var v;
var noise;
window.onload = function() {
  v = new Visualizer();
  v.ini();
  $.get("/fftNoise", function (data) {
    noise = JSON.parse(data);
  });
};

var Visualizer = function() {

  this.audioContext = null;
  this.powerOfNoise = 0;  // prosecna snaga buke koja se koristi za racunjane faktora c50
  this.energy50 = 0; // energija u prvih 50 ms
  this.energyAfter = 0; // energija od 50 ms pa u beskonacno
  this.count = 0; // brojac milisekundi
  this.timer = null; // okida se na 1 ms, sluzi za merenje C50
  this.timer1 = null; // okida se na 1ms, i koristi da se u toku 2s izmeri prosecna energija buke

  this.analyser = null; // analayser node
  this.gain_node = null; // gain node - mute izlaz
  this.noiseTimer = null; // timer koji kontrolise pustanje pink noise

};
Visualizer.prototype = {
  ini: function() {
    this._prepareAPI();
  },
  _prepareAPI: function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
    try {
      this.audioContext = new AudioContext();
    } catch (e) {
      this._updateInfo('!Your browser does not support AudioContext', false);
      console.log(e);
    }

    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    var that = this;
    if (navigator.getUserMedia){

      navigator.getUserMedia({audio:true, video:false},
        function(stream) {
          that._start_microphone(stream);
        },
        function(e) {
          window.alert('Error capturing audio.');
        }
      );

    } else { window.alert('getUserMedia not supported in this browser.'); }

  },
  _start_microphone: function(stream){
    var BUFF_SIZE_RENDERER = 16384; // najfinija podela na pocetku
    this.gain_node = this.audioContext.createGain();
    this.gain_node.gain.value = 0; // postavljen na 0 jer ne treba da pusta zvuk

    // ulaz se povezuje sa mikrofonom
    var microphone_stream = this.audioContext.createMediaStreamSource(stream);

    var analyser_node = this.audioContext.createAnalyser();
    analyser_node.smoothingTimeConstant = 0; // konstanta koja kaze koliko fft zavisi od prethodno izracunatog
                                            // 0 nista, 1 najvise
    analyser_node.fftSize = BUFF_SIZE_RENDERER;

    this.analyser = analyser_node;

    microphone_stream.connect(analyser_node); // ulaz za analayser node postaje izlaz sa mikrofona

    analyser_node.connect(this.gain_node); // ulaz u gain je izlaz iz analyser-a

    this.gain_node.connect(this.audioContext.destination);  // krajnji izlaz je izlaz iz gain

    this._drawSpectrum(analyser_node);


  },
  _drawSpectrum: function(analyser) {
    analyser.smoothingTimeConstant = 0.8; // da grafik ne "igra" previse
    analyser.fftSize = 2048; // smanji se velicina zbog dinamicnosti prikazivanja

    var bufferLength = analyser.frequencyBinCount -250 ; // poslednjih 250 tacaka ne treba da se razmatraju za mikrofone koje mi koristimo
    var dataArray = new Float32Array(bufferLength); // niz u koji se smestaju fft koeficijenti
    var data = new Array(bufferLength);
    for(var i=0, j = 0; i<bufferLength; j++ ){
      data[j] = {x:i*this.audioContext.sampleRate/analyser.fftSize}; // postavljanje  x koordinate grafiku
      // frekvencija koja odgovara i-toj koordinati i*sampleRate/fftSize
      i +=  Math.floor(i/50) + 1; // posto je logaritamska skala tacke su gusce kako se frekvencija povecava pa je napravljen
                                  // prored na visim frekvencijama

    }


    var that = this;
    function draw() {
      // funkcija koja se poziva na svakih 100ms i osvezava grafik
      var drawVisual = requestAnimationFrame(draw);
      analyser.getFloatFrequencyData(dataArray);

      for(var i=0, j =0; i<bufferLength; j++){
        data[j].y = dataArray[i];
        i +=  Math.floor(i/50) + 1;
      }

      scatterChart.data.datasets[0].data = data;
      scatterChart.update();

   };
    draw();
  },
  clarty: function(analyser){

    // funkcija koja izdracunava energiju u prvih 50ms
    // integegral funkcija p^2(t) po dt (t je vreme)
    // p je power of noise u funkciji od vremena

    // integral se racuna pravougaonom formulom
    var data = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(data);
    // posto su podaci u dB, moramo prvo da ih vratimo natrag
    // u dokumentaciji je data formula 20*log10(x) za racunanje dB
    data = data.map(function(x){
      return Math.pow(10, x/20);
    });

    var power = 0; // jacina u vremenu i
    for(var i = 0, l = data.length; i < l; i++){
      var frequency = i*this.audioContext.sampleRate/analyser.fftSize;
      power += data[i]*frequency*data[i]*frequency;
    }
    // i od jacine se oduzme prosecna jacina buke
    // posto nju ne merimo
    power -= this.powerOfNoise;
    if(this.count < 50){
      // ovo bi trebalo da se mnozi sa promenom i, ali to je 1, pa zato nije mnozeno
      this.energy50 += power*power;
      this.count += 1;
    } else{
      // racunamo energiju posle 50ms
      if(this.count > 500){
        // dovoljno je meriti kada snaga padne na 0
        // ali posto je buka promenljiva u sobama koje merimo pronasli smo empirijsko merenje
        // posle 2 s snaga bi trebalo da padne na 0, a mi merimo jos 3s vise zbog tacnosti
        this._result();
      }
      this.energyAfter += power*power;
      this.count += 1;
    }
  },
  _noisePower: function(analyser){
    // prvu sekundu racunamo prosecnu snagu buke u prostoriji
    this.count += 1;

    if(this.count > 100){
      this._noise();
    }
    var data = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(data);
    data = data.map(function(x){
      return Math.pow(10, x/20);
    });
    var power = 0;
    for(var i = 0, l = data.length; i < l; i++){
      var frequency = i*this.audioContext.sampleRate/analyser.fftSize;
      power += data[i]*frequency*data[i]*frequency;
    }
    this.powerOfNoise += power;
  },
  _result: function(){
    // 5s po pustanju diraka mozemo da kazemo koji je faktor
    this.analyser.smoothingTimeConstant = 0.8; // smooth konstantu vracamo natrag
    this.powerOfNoise = 0; // anuliramo prosecnu snagu buke za sledece merenje
    clearInterval(this.timer); // oslobadjamo tajmer
    var c50;
    if(this.energyAfter == 0){
      c50 = 1000; // ako je energija posle 0, znaci da se sva energija upije u prvih 50 ms
              // pa je akutika sobe jako losa i postavljamo c50 na 1000 (bila bi beskonacno) jer ce svakako procenat biti 0
    } else{
      // izracunamo c50 po formuli iz standarda
      c50 = 10*Math.log(this.energy50/this.energyAfter);
    }
    var value = function (c50) {
      if(c50 > -5 && c50 < 4){
        // po razlicitim radovima idealne vrednsti za faktor c50 se krecu izmedju - 2 i 2
        // dodat je faktor losijih instrumenata
        return 100;
      }

      var x = Math.min(Math.abs(c50 + 5), Math.abs(c50 - 4) );

      return Math.max(0, 100 - Math.round(x));

    };
    gauge1.update(value(c50));
    setWaterColor(value(c50));
    enablePlay();
    // console.log(c50);
  },
  _noise: function () {
    clearInterval(this.timer1);
    this.powerOfNoise /= this.count;
    this.count = 0;
    var that = this;
    // console.log(sliderValue());
    $.ajax({
      type: "GET",
      url: "/play",
      data: {"freq" : sliderValue()}
    });
    this.timer = setInterval(function() {that.clarty(that.analyser)}, 1);
  },
  _start: function(){
    if(inMode2()){
      this.analyser.smoothingTimeConstant = 0;
      var that = this;
      this.timer1 = setInterval(function() {that._noisePower(that.analyser)}, 1);
    } else{
      if(isActive()){
        this.analyser.smoothingTimeConstant = 0;
        this._playNoise();
      } else {
        this.analyser.smoothingTimeConstant = 0.8;
        this._pauseNoise();
      }
    }

  },
  _playNoise: function(){
    var that = this;
    $.get("/startNoise");
    this.noiseTimer = setInterval(function () {
      that._drawNoise();
    }, 100);

  },
  _pauseNoise: function () {
    $.get("/stopNoise");
    clearInterval(this.noiseTimer);
    setTimeout(function (){
      scatterChart.data.datasets[1].data = [];
      scatterChart.update()
    }, 10);
  },
  _drawNoise(){

    $.get("/fftIndex", function (data) {
      var json = noise[data];
      var dataS = new Array(data.length);
      var i = 0;
      var keys = [];
      Object.keys(json).forEach(function(key)
      {
          keys.push(key);
      });

      keys.sort(function (a, b) {
        return parseFloat(a)-parseFloat(b);
      });

      for(var i = 0, n = keys.length; i < n; i++){
        dataS[i] = {"x": parseFloat(keys[i]), "y":json[keys[i]][0]};
      }
      scatterChart.data.datasets[1].data = dataS;
      scatterChart.update();
    });
  }

}
