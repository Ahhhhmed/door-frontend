

function switchMode(){
  $('body').toggleClass('mode2');
}

$(document).ready(function() {
  var icon = $('.play');
  icon.click(function() {
    icon.toggleClass('active');
    v._start();
    return false;
  });
});

function setWaterColor(value) {
  var water = $('.gauge');
  for(var i=1; i<= 100; i++){
    water.removeClass('color-'+i);
  }
  water.addClass("color-"+value);
  console.log(water[0]);
}

$( function() {
  noUiSlider.create($("#slider")[0], {
    start: 440,
    tooltips: true,
    step: 1,
    range:{
      min: [1],
      max: [20000]
    }
  });
} );
