const Theme = (function () {
    function init() {
        const saved = localStorage.getItem("theme") || "dark";
        apply(saved);
    }

    function apply(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#f5f5f5");
        }
        localStorage.setItem("theme", theme);
        updateToggleIcon(theme);
    }

    function toggle() {
        const current = document.documentElement.getAttribute("data-theme") || "dark";
        apply(current === "dark" ? "light" : "dark");
    }

    function updateToggleIcon(theme) {
        const icon = document.getElementById("theme-toggle-icon");
        if (icon) {
            icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
        }
    }

    return { init, toggle, apply };
})();
