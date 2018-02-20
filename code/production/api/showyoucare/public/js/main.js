$(function(){

  $('#apologise').click(function(){
    $.ajax({
      url: "https://showyoucare.herokuapp.com/api/event/" + eventId + "/state/APOLOGISE",
      type: 'POST',
      success: function(){
        $('.result.success').fadeIn();
      },
      error: function(){
        $('.result.fail').fadeIn();
      }
    });
  })

  $('#ignore').click(function(){
    $('.result.ignore').fadeIn();
    $.ajax({
      url: "https://showyoucare.herokuapp.com/api/event/" + eventId + "/state/IGNORE",
      type: 'POST',
      success: function(){
        $('.result.success').fadeIn();
      },
      error: function(){
        $('.result.fail').fadeIn();
      }
    });
  })

});
