window.APP_STATE = {
    online: false,
    apiUrl: CONFIG.API_BASE,
    settings: {
        siteName: "Web3 Platform",
        siteDescription: "Decentralized Content Platform",
        version: CONFIG.VERSION,
        defaultTheme: "dark",
        itemsPerPage: 24,
        debounceDelay: 300
    },
    currentRoute: "",
    sidebarOpen: false
};

async function updateConnectionIndicator() {
    const result = await API.ping();
    window.APP_STATE.online = !result.error;
    const dot = document.getElementById("connection-dot");
    if (dot) {
        dot.classList.toggle("online", window.APP_STATE.online);
        dot.classList.toggle("offline", !window.APP_STATE.online);
    }
}

async function loadPartials() {
    const targets = [
        { id: "navbar-container", path: "partials/navbar.html" },
        { id: "sidebar-container", path: "partials/sidebar.html" },
        { id: "footer-container", path: "partials/footer.html" }
    ];

    for (const t of targets) {
        try {
            const res = await fetch(t.path);
            const html = await res.text();
            const el = document.getElementById(t.id);
            if (el) el.innerHTML = html;
        } catch (err) {
            /* silent fail, UI stays functional without partial */
        }
    }

    ContentLoader.loadCategories(document.getElementById("sidebar-category-list"));

    const siteNameEls = document.querySelectorAll("[data-site-name]");
    siteNameEls.forEach((el) => (el.textContent = window.APP_STATE.settings.siteName));

    let footerClicks = 0;
    let footerClickTimer = null;
    document.addEventListener("click", (e) => {
        if (e.target.closest("[data-footer-shortcut]")) {
            footerClicks++;
            clearTimeout(footerClickTimer);
            footerClickTimer = setTimeout(() => (footerClicks = 0), 2000);
            if (footerClicks >= 5) {
                footerClicks = 0;
                navigateTo("#/about");
            }
        }
        if (e.target.closest("#connection-dot")) {
            updateConnectionIndicator();
        }
        if (e.target.closest("#theme-toggle-btn")) {
            Theme.toggle();
        }
    });
}

async function initApp() {
    await updateConnectionIndicator();

    const settingsData = await API.getSettings();
    if (!settingsData.error) {
        window.APP_STATE.settings = { ...window.APP_STATE.settings, ...settingsData };
    }

    Theme.init();
    Sidebar.init();
    SearchModule.init();
    FilterSort.init();
    AnimationsInit.init();
    PWAInit.init();

    await loadPartials();

    Router.init();

    setInterval(updateConnectionIndicator, 60000);

    const loader = document.getElementById("app-loader");
    const wrapper = document.getElementById("app-wrapper");
    if (loader) loader.style.display = "none";
    if (wrapper) wrapper.style.display = "block";

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
}

window.addEventListener("unhandledrejection", () => {
    /* prevent uncaught promise rejections from breaking the app */
});

document.addEventListener("DOMContentLoaded", initApp);
