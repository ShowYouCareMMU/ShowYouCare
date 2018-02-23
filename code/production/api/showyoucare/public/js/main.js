$(function(){

  $('#apologise').click(function(){
    $('.loading').fadeIn()
    $.ajax({
      url: window.location.origin + "/api/event/" + eventId + "/state/APOLOGISE",
      type: 'POST',
      success: function(){
        $('.result.apologised').fadeIn();
        $('.loading').fadeOut()
      },
      error: function(err){
        console.error(err)
        $('.result.fail').fadeIn();
        $('.loading').fadeOut()
      }
    });
  })

  $('#ignore').click(function(){
    $('.result.ignore').fadeIn();
    $.ajax({
      url: window.location.origin + "/api/event/" + eventId + "/state/IGNORE",
      type: 'POST'
    });
  })

});
