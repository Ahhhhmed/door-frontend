var config1 = liquidFillGaugeDefaultSettings();
config1.circleThickness = 0.1;
config1.circleFillGap=0;
config1.waveAnimateTime = 500;
config1.waveRiseTime = 100;
config1.colorsCss = true;
config1.displayPercent = false;
var gauge1 = loadLiquidFillGauge("fillgauge1", 55, config1);
var value = 50;
//      setInterval(()=>{
//          value = (value + ((Math.random() > .5)?1:-1)) % 100;
//          if(value > 60){
//              config1.textColor = "#2eff59"
//          }
//          gauge1.update(value);
//      },100);

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
