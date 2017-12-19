$("#mobile_nav_button").click(function(){
	$('.mobile_nav').slideToggle();
});

$(".mobile_link, .container, .desktop_nav").click(function(){
	$('.mobile_nav').slideUp();
});

$('a[href^="#"]').on('click',function (e) {
    e.preventDefault();

    var target = this.hash;
    var $target = $(target);

    $('html, body').stop().animate({
        'scrollTop': $target.offset().top
    }, 900, 'swing', function () {
        window.location.hash = target;
    });
});
