

function switchMode(){
  $('body').toggleClass('mode2');
}

$(document).ready(function() {
  var icon = $('.play');
  icon.click(function() {
    icon.toggleClass('active');
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
