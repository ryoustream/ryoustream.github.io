const AnimationsInit = (function () {
    function init() {
        if (window.AOS) {
            AOS.init({ offset: 50, duration: 600, once: true });
        }
        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }
    }

    function refreshAnimations() {
        if (window.AOS) AOS.refresh();
        if (window.ScrollTrigger) ScrollTrigger.refresh();

        if (window.gsap) {
            const hero = document.querySelector(".hero-text");
            if (hero) {
                gsap.fromTo(hero, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
            }
            document.querySelectorAll(".section-title").forEach((el) => {
                gsap.fromTo(el, { opacity: 0, x: -20 }, {
                    opacity: 1, x: 0, duration: 0.5, ease: "power2.out",
                    scrollTrigger: { trigger: el, start: "top 90%" }
                });
            });
        }
    }

    return { init, refreshAnimations };
})();
