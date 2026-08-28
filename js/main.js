$(document).ready(function(){
    $("header#header-container").load("/asset/header.html");
    $("nav.navbar").load("/asset/nav.html");
    $(document).ready(function () {
        $("footer").load("/asset/footer.html");
    });
});
document.addEventListener( 'DOMContentLoaded', function () {
    new Splide(".splide").mount(window.splide.Extensions);
    
});