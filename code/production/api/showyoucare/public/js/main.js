$(function(){

  $('#apologise').click(function(){
    $('.loading').fadeIn()
    $.ajax({
      url: "http://localhost:3000/api/event/" + eventId + "/state/APOLOGISE",
      type: 'POST',
      success: function(){
        $('.result.apologised').fadeIn();
        $('.loading').fadeOut()
      },
      error: function(){
        $('.result.fail').fadeIn();
        $('.loading').fadeOut()
      }
    });
  })

  $('#ignore').click(function(){
    $('.result.ignore').fadeIn();
    $.ajax({
      url: "http://localhost:3000/api/event/" + eventId + "/state/IGNORE",
      type: 'POST'
    });
  })

});
