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

  this.id = 0;
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
    var gain_node = this.audioContext.createGain();
    gain_node.gain.value = 0; // postavljen na 0 jer ne treba da pusta zvuk

    var microphone_stream = this.audioContext.createMediaStreamSource(stream);

    var analyser_node = this.audioContext.createAnalyser();
    analyser_node.smoothingTimeConstant = 0;
    analyser_node.minDecibels = -120;
    analyser_node.maxDecibels = 10;
    analyser_node.fftSize = BUFF_SIZE_RENDERER;

    this.analyser = analyser_node;
    // var distortion = this.audioContext.createWaveShaper();
    // var biquadFilter = this.audioContext.createBiquadFilter();
    // var convolver = this.audioContext.createConvolver();

    microphone_stream.connect(analyser_node);
    // microphone_stream.connect(convolver);
    // convolver.connect(analyser_node);
    //
    analyser_node.connect(gain_node);
    // analyser_node.connect(distortion);
    // distortion.connect(gain_node)
    // distortion.connect(biquadFilter);
    // biquadFilter.connect(convolver);
    // convolver.connect(gain_node);
    gain_node.connect(this.audioContext.destination);

    this._drawSpectrum(analyser_node);


  },
  _drawSpectrum: function(analyser) {
    analyser.smoothingTimeConstant = 0.85;
    analyser.fftSize = 4096;
    // canvas = document.getElementById('canvas');
    // cwidth = canvas.width;
    // cheight = canvas.height - 2;
    // canvasCtx = canvas.getContext('2d');
    var bufferLength = analyser.frequencyBinCount ;
    var dataArray = new Float32Array(bufferLength);
    var data = new Array(bufferLength);
    for(var i=0, j = 0; i<bufferLength; j++ ){
      data[j] = {x:i*this.audioContext.sampleRate/analyser.fftSize};
      i +=  Math.floor(i/50) + 1;
    }


    console.log(dataArray);

    // canvasCtx.clearRect(0, 0, cwidth, cheight);
    var that = this;
    function draw() {
      var drawVisual = requestAnimationFrame(draw);
      analyser.getFloatFrequencyData(dataArray);
      //  that.clarty(analyser)
      // canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      // canvasCtx.fillRect(0, 0, cwidth, cheight);
      for(var i=0, j =0; i<bufferLength; j++){
        data[j].y = dataArray[i];
        i +=  Math.floor(i/50) + 1;
      }

      scatterChart.data.datasets[0].data = data;
      scatterChart.update();

      // console.log('asd');

      // var barWidth = (cwidth / bufferLength) * 2.5;
      // var barHeight;
      // var x = 0;
      //
      // for(var i = 0; i < bufferLength; i++) {
      //   barHeight = dataArray[i];
      //
      //   canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
      //   canvasCtx.fillRect(x,cheight-barHeight/2,barWidth,barHeight/2);
      //
      //   x += barWidth + 1;
      // }
    };
    draw();
  },
  clarty: function(analyser){
    // console.log(this.count)
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
    // console.log('radi');
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
    console.log(c50);
    this.id = 0;
  },
  _noise: function () {
    // console.log("da");
    clearInterval(this.timer1);
    this.powerOfNoise /= this.count;
    this.count = 0;
    var that = this;
    this.timer = setInterval(function() {that.clarty(that.analyser)}, 1);
  },
  _start: function(){
    if(this.id == 0){
      // this._beginFreq(this.analyser);
      $.get('http://localhost:5000');
      var that = this;
      this.timer1 = setInterval(function() {that._noisePower(that.analyser)}, 1);
      // this.timer = setInterval(function() {that.clarty(that.analyser)}, 1);
      this.id = 1;
    } else{
      console.log('majmune');
    }

  }
}
