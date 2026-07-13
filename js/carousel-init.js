const CarouselInit = (function () {
    function initCarousels(container) {
        if (!window.jQuery || !container) return;
        const $ = window.jQuery;

        $(container).find(".carousel-hero").each(function () {
            if (!$(this).hasClass("slick-initialized")) {
                $(this).slick({
                    slidesToShow: 1,
                    fade: true,
                    autoplay: true,
                    speed: 800,
                    dots: true,
                    arrows: false,
                    infinite: true
                });
            }
        });

        $(container).find(".carousel-trending, .carousel-category, .carousel-related").each(function () {
            if (!$(this).hasClass("slick-initialized")) {
                $(this).slick({
                    slidesToShow: 5,
                    slidesToScroll: 2,
                    arrows: true,
                    dots: false,
                    infinite: true,
                    lazyLoad: "ondemand",
                    rows: 1,
                    responsive: [
                        { breakpoint: 1023, settings: { slidesToShow: 3, arrows: false } },
                        { breakpoint: 767, settings: { slidesToShow: 2, arrows: false } }
                    ]
                });
            }
        });
    }

    return { initCarousels };
})();
