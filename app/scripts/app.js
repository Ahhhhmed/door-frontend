

function switchMode(){
  if(!inMode2()){
    v._pauseNoise();
    $('.play').removeClass('active')
  }
  $('body').toggleClass('mode2');
}

function inMode2() {
  return $('body').hasClass('mode2');
}

function isActive() {
  return $('.play').hasClass('active');
}

function enablePlay() {
  $('.loader').removeClass("loader active").addClass("play");
}

function disablePlay() {
  $('.play').removeClass("play").addClass("loader");

}

function sliderValue() {
  return $("#slider")[0].noUiSlider.get();
}

$(document).ready(function() {
  var icon = $('.play');
  icon.click(function() {
    if(icon.hasClass("play")) {
      if (!inMode2()) {
        icon.toggleClass('active');
      } else {
        disablePlay();
      }
      v._start();
    }
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
