var v;
window.onload = function() {
  v = new Visualizer();
  v.ini();
};

var Visualizer = function() {
  this.audioContext = null;
  this.powerOfNoise = 0;
  this.power80 = 0;
  this.powerAfter = 0;
  this.count = 0;
  this.timer = null;
  this.timer1 = null;

  this.analyser = null;
  this.gain_node = null;
  this.noiseTimer = null;

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
    var BUFF_SIZE_RENDERER = 16384;
    this.gain_node = this.audioContext.createGain();
    this.gain_node.gain.value = 0; // postavljen na 0 jer ne treba da pusta zvuk

    var microphone_stream = this.audioContext.createMediaStreamSource(stream);

    var analyser_node = this.audioContext.createAnalyser();
    analyser_node.smoothingTimeConstant = 0;
    analyser_node.minDecibels = -120;
    analyser_node.maxDecibels = 10;
    analyser_node.fftSize = BUFF_SIZE_RENDERER;

    this.analyser = analyser_node;

    microphone_stream.connect(analyser_node);

    analyser_node.connect(this.gain_node);

    this.gain_node.connect(this.audioContext.destination);

    this._drawSpectrum(analyser_node);


  },
  _drawSpectrum: function(analyser) {
    analyser.smoothingTimeConstant = 0.9;
    analyser.fftSize = 4096;

    var bufferLength = analyser.frequencyBinCount -250 ;
    var dataArray = new Float32Array(bufferLength);
    var data = new Array(bufferLength);
    for(var i=0, j = 0; i<bufferLength; j++ ){
      data[j] = {x:i*this.audioContext.sampleRate/analyser.fftSize};
      i +=  Math.floor(i/50) + 1;
    }


    var that = this;
    function draw() {
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
    var data = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(data);
    data = data.map(function(x){
      return Math.pow(10, x/20);
    });

    var power = 0
    for(var i = 0, l = data.length; i < l; i++){
      var frequency = i*this.audioContext.sampleRate/analyser.fftSize;
      power += data[i]*frequency*data[i]*frequency;
    }
    power -= this.powerOfNoise;
    if(this.count < 50){
      // console.log(power);
      this.power80 += power*power;
      this.count += 1;
    } else{
      if(this.count > 500){
        this._result();
      }
      this.powerAfter += power*power;
      this.count += 1;
    }
  },
  _noisePower: function(analyser){
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
    this.analyser.smoothingTimeConstant = 0.9;
    clearInterval(this.timer);
    var c50;
    if(this.powerAfter == 0){
      c50 = 0;
    } else{
      c50 = 10*Math.log(this.power80/this.powerAfter);
    }
    var value = function (c50) {
      if(c50 > -5 && c50 < 4){
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
    console.log(sliderValue());
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
        this._playNoise();
      } else {
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
  },
  _drawNoise(){

    $.get("/fftNoise", function (data) {
      var json = JSON.parse(data);
      var dataS = new Array(data.length);
      Object.keys(json).forEach(function(key)
      { dataS[i] = {"x": parseFloat(key), "y":json[key][0]};
        i+=1;
      });

      scatterChart.data.datasets[1].data = dataS;
      scatterChart.update();
    });
  }

}
