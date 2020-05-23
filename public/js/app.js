$(function () {
  $(".navigation").click(function () {
    let tab_id = $(this).attr("data-tab");

    $(".navigation").removeClass("current");

    $(".tab-content").removeClass("current");

    $(this).addClass("current");

    $("#" + tab_id).addClass("current");
  });
});
