// Effect for go to top btn
window.onscroll = function() { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        document.getElementById("gotopbtn").style.opacity = "1";
    } else {
        document.getElementById("gotopbtn").style.opacity = "0";
    }
}

function topFunction() {
    $('html,body').animate({ scrollTop: 0 }, 1000);
}