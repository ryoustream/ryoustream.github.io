const Sidebar = (function () {
    function isMobile() {
        return window.innerWidth < 1024;
    }

    function open() {
        const sidebar = document.getElementById("sidebar-container");
        const overlay = document.getElementById("sidebar-overlay");
        if (sidebar) sidebar.classList.add("sidebar-open");
        if (overlay) overlay.classList.add("active");
        if (isMobile()) document.body.classList.add("no-scroll");
        window.APP_STATE.sidebarOpen = true;
    }

    function close() {
        const sidebar = document.getElementById("sidebar-container");
        const overlay = document.getElementById("sidebar-overlay");
        if (sidebar) sidebar.classList.remove("sidebar-open");
        if (overlay) overlay.classList.remove("active");
        document.body.classList.remove("no-scroll");
        window.APP_STATE.sidebarOpen = false;
    }

    function toggle() {
        window.APP_STATE.sidebarOpen ? close() : open();
    }

    function init() {
        document.addEventListener("click", (e) => {
            if (e.target.closest("[data-sidebar-toggle]")) {
                toggle();
            }
            if (e.target.id === "sidebar-overlay") {
                close();
            }
            if (e.target.closest(".sidebar-item") && isMobile()) {
                close();
            }
        });

        window.addEventListener("resize", debounce(() => {
            if (!isMobile()) close();
        }, 150));
    }

    return { init, open, close, toggle };
})();
