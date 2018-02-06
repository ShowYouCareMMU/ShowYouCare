$(function(){

  $('#apologise').click(function(){
    $.ajax({
      url: "https://showyoucare.herokuapp.co.uk/",
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
  })

});
