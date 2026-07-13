const Router = (function () {
    const ROUTES = {
        home: "pages/home.html",
        category: "pages/category.html",
        genres: "pages/genres.html",
        archived: "pages/archived.html",
        about: "pages/about.html",
        player: "pages/player.html"
    };

    const pageCallbacks = {
        home: () => window.ContentLoader && ContentLoader.initHome(),
        category: (params) => window.ContentLoader && ContentLoader.initCategory(params[0]),
        genres: (params) => window.ContentLoader && ContentLoader.initGenres(params[0]),
        archived: () => window.ContentLoader && ContentLoader.initArchived(),
        about: () => window.ContentLoader && ContentLoader.initAbout(),
        player: (params) => window.PlayerInit && PlayerInit.init(params[0])
    };

    async function navigate(hash) {
        const { page, params } = getRouteParams(hash);
        const templatePath = ROUTES[page] || ROUTES.home;
        const target = document.getElementById("main-content");

        try {
            const res = await fetch(templatePath);
            if (!res.ok) throw new Error("Page not found");
            const html = await res.text();
            target.innerHTML = html;
        } catch (err) {
            target.innerHTML = '<div class="p-4 text-center text-secondary">Halaman tidak ditemukan.</div>';
        }

        window.APP_STATE.currentRoute = page;
        updateActiveStates(page, params[0]);
        window.scrollTo({ top: 0, behavior: "auto" });

        if (pageCallbacks[page]) {
            pageCallbacks[page](params);
        }

        if (window.CarouselInit) CarouselInit.initCarousels(target);
        if (window.AnimationsInit) AnimationsInit.refreshAnimations();
    }

    function updateActiveStates(page, param) {
        document.querySelectorAll(".navbar-menu-item").forEach((el) => {
            el.classList.toggle("active", el.dataset.route === page);
        });
        document.querySelectorAll(".sidebar-item").forEach((el) => {
            const isActive = page === "category" && el.dataset.categoryId === param;
            el.classList.toggle("active", isActive);
        });
    }

    function init() {
        window.addEventListener("hashchange", () => navigate(location.hash));
        const initial = location.hash || "#/home";
        navigate(initial);
    }

    return { init, navigate };
})();

function navigateTo(route) {
    location.hash = route;
}
