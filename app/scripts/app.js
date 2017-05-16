

var mode = 0
function switchMode(){
  if(mode==0){
    $('body').addClass('mode2');
    mode = 1;
  } else {
    $('body').removeClass('mode2');
    mode = 0;
  }
}
