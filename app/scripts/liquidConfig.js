function setWaterColor(value) {
  var water = $('.gauge');
  for(var i=1; i<= 100; i++){
    water.removeClass('color-'+i);
  }
  water.addClass("color-"+value);
}


var config1 = liquidFillGaugeDefaultSettings();
config1.circleThickness = 0.1;
config1.circleFillGap=0;
config1.waveAnimateTime = 500;
config1.waveRiseTime = 100;
config1.colorsCss = true;
config1.displayPercent = false;
var gauge1 = loadLiquidFillGauge("fillgauge1", 55, config1);
setWaterColor(55);

function NewValue(){
  var res;
  if(Math.random() > .5){
    res = Math.round(Math.random()*100);
  } else {
    res = (Math.random()*100).toFixed(1);
  }
  setWaterColor(Math.round(res));
  return res;
}
