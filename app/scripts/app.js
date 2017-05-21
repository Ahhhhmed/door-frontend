

function switchMode(){
  $('body').toggleClass('mode2');
}

function inMode2() {
  return $('body').hasClass('mode2');
}

function isActive() {
  return $('.play').hasClass('active');
}

function enablePlay() {

}

function disablePlay() {

}

function sliderValue() {
  return $("#slider")[0].noUiSlider.get();
}

$(document).ready(function() {
  var icon = $('.play');
  icon.click(function() {
    if(!inMode2()) {
      icon.toggleClass('active');
    } else{
      disablePlay();
    }
    v._start();
    return false;
  });
});



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
