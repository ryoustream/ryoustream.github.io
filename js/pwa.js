const PWAInit = (function () {
    let deferredPrompt = null;

    function isStandalone() {
        return window.matchMedia("(display-mode: standalone)").matches;
    }

    async function showBanner() {
        if (isStandalone()) return;
        if (localStorage.getItem("pwa_dismissed") === "true") return;

        const res = await fetch("partials/install-banner.html");
        const html = await res.text();
        const wrapper = document.createElement("div");
        wrapper.id = "install-banner-wrapper";
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper);

        const installBtn = wrapper.querySelector("[data-pwa-install]");
        const dismissBtn = wrapper.querySelector("[data-pwa-dismiss]");

        if (installBtn) {
            installBtn.addEventListener("click", async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    await deferredPrompt.userChoice;
                    deferredPrompt = null;
                }
                wrapper.remove();
            });
        }
        if (dismissBtn) {
            dismissBtn.addEventListener("click", () => {
                localStorage.setItem("pwa_dismissed", "true");
                wrapper.remove();
            });
        }
    }

    function init() {
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });

        window.addEventListener("appinstalled", () => {
            localStorage.removeItem("pwa_dismissed");
            const wrapper = document.getElementById("install-banner-wrapper");
            if (wrapper) wrapper.remove();
        });

        setTimeout(showBanner, 30000);
    }

    return { init };
})();
