

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
  $( "#slider" ).slider();
} );
