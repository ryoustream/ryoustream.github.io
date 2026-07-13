const ContentLoader = (function () {
    let cardTemplate = null;

    async function getCardTemplate() {
        if (cardTemplate) return cardTemplate;
        const res = await fetch("partials/card-item.html");
        cardTemplate = await res.text();
        return cardTemplate;
    }

    function buildCard(item) {
        const genreLabel = (item.genres && item.genres[0]) || "";
        const poster = API.getPosterUrl(item.poster);
        const div = document.createElement("div");
        div.className = "card-item";
        div.dataset.id = item.id;
        div.innerHTML = `
            <div class="card-poster">
                <img src="${poster}" alt="${item.title}" loading="lazy"
                     onerror="this.onerror=null;this.src='assets/images/posters/default-poster.svg';">
                ${genreLabel ? `<span class="card-badge">${genreLabel}</span>` : ""}
                <div class="card-overlay">
                    <div class="card-title">${item.title}</div>
                </div>
            </div>
        `;
        div.addEventListener("click", () => navigateTo(`#/player/${item.id}`));
        return div;
    }

    async function renderGrid(container, params) {
        if (!container) return;
        container.innerHTML = '<div class="loading-spinner"></div>';
        const data = await API.search(params);

        if (data.error && data.code === "OFFLINE") {
            const res = await fetch("partials/error-state.html");
            container.innerHTML = await res.text();
            return;
        }

        const items = data.contents || [];
        if (items.length === 0) {
            const res = await fetch("partials/empty-state.html");
            container.innerHTML = await res.text();
            const resetBtn = container.querySelector("[data-reset-filter]");
            if (resetBtn) resetBtn.addEventListener("click", () => navigateTo("#/home"));
            return;
        }

        container.innerHTML = "";
        if (data.stale) {
            const banner = document.createElement("div");
            banner.className = "stale-banner";
            banner.textContent = "Menampilkan data tersimpan (mode offline)";
            container.appendChild(banner);
        }
        const grid = document.createElement("div");
        grid.className = "content-grid";
        items.forEach((item) => grid.appendChild(buildCard(item)));
        container.appendChild(grid);

        updateResultCount(items.length, data.total);
    }

    function updateResultCount(shown, total) {
        const el = document.querySelector("[data-result-count]");
        if (el) el.textContent = `${total !== undefined ? total : shown} hasil`;
    }

    async function loadCarousel(container, params) {
        if (!container) return;
        const data = await API.getContents(params);
        if (data.error) return;
        const items = data.contents || [];
        container.innerHTML = "";
        items.forEach((item) => container.appendChild(buildCard(item)));
    }

    async function loadCategories(container, activeId) {
        if (!container) return;
        const data = await API.getCategories();
        if (data.error) return;
        container.innerHTML = "";
        (data.categories || []).forEach((cat) => {
            const a = document.createElement("a");
            a.href = `#/category/${cat.id}`;
            a.className = "sidebar-item" + (cat.id === activeId ? " active" : "");
            a.dataset.categoryId = cat.id;
            a.innerHTML = `<i class="bi ${cat.icon}"></i><span>${cat.name}</span>`;
            container.appendChild(a);
        });
    }

    async function loadGenreChips(container, onSelect) {
        if (!container) return;
        const data = await API.getGenres();
        if (data.error) return;
        container.innerHTML = "";
        (data.genres || []).forEach((genre) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "genre-chip";
            chip.textContent = genre.name;
            chip.dataset.genreId = genre.id;
            chip.addEventListener("click", () => onSelect(genre.id));
            container.appendChild(chip);
        });
    }

    async function initHome() {
        await loadCarousel(document.getElementById("trending-carousel"), { sort: "rating-desc", limit: 10 });
        await loadCarousel(document.getElementById("recent-grid"), { sort: "newest", limit: 10 });

        const catData = await API.getCategories();
        const catSections = document.getElementById("category-sections");
        if (catSections && catData.categories) {
            catSections.innerHTML = "";
            for (const cat of catData.categories) {
                const section = document.createElement("section");
                section.className = "category-section";
                section.innerHTML = `
                    <h3 class="section-title">${cat.name}</h3>
                    <div class="carousel-category" id="cat-${cat.id}"></div>
                `;
                catSections.appendChild(section);
                await loadCarousel(document.getElementById(`cat-${cat.id}`), { category: cat.id, limit: 10 });
            }
            if (window.CarouselInit) CarouselInit.initCarousels(catSections);
        }
    }

    async function loadFilterBar() {
        const container = document.getElementById("filter-bar-container");
        if (!container) return;
        const res = await fetch("partials/filter-bar.html");
        container.innerHTML = await res.text();
    }

    async function initCategory(categoryId) {
        await loadFilterBar();
        const container = document.getElementById("content-grid-container");
        FilterSort.bind(container, { category: categoryId });
        renderGrid(container, { category: categoryId });
        loadCategories(document.getElementById("sidebar-category-list"), categoryId);
        const titleEl = document.querySelector("[data-category-title]");
        if (titleEl) {
            API.getCategories().then((data) => {
                const cat = (data.categories || []).find((c) => c.id === categoryId);
                if (cat) titleEl.textContent = cat.name;
            });
        }
    }

    async function initGenres(genreId) {
        const chipContainer = document.getElementById("genre-chips");
        const gridContainer = document.getElementById("content-grid-container");

        loadGenreChips(chipContainer, (id) => {
            navigateTo(`#/genres/${id}`);
        });

        if (genreId) {
            await loadFilterBar();
            FilterSort.bind(gridContainer, { genre: genreId });
            renderGrid(gridContainer, { genre: genreId });
        } else if (gridContainer) {
            gridContainer.innerHTML = "";
        }
    }

    async function initArchived() {
        await loadFilterBar();
        const container = document.getElementById("content-grid-container");
        FilterSort.bind(container, { archived: "true" });
        renderGrid(container, { archived: "true" });
    }

    async function initAbout() {
        const settings = await API.getSettings();
        const versionEl = document.querySelector("[data-app-version]");
        if (versionEl) versionEl.textContent = (settings && settings.version) || CONFIG.VERSION;

        const statusEl = document.querySelector("[data-connection-status]");
        const urlEl = document.querySelector("[data-active-url]");
        const ping = await API.ping();
        const isOnline = !ping.error;
        if (statusEl) {
            statusEl.textContent = isOnline ? "Connected" : "Disconnected";
            statusEl.className = isOnline ? "status-connected" : "status-disconnected";
        }
        if (urlEl) urlEl.textContent = CONFIG.API_BASE;

        const input = document.getElementById("tunnel-url-input");
        const saveBtn = document.getElementById("save-tunnel-url");
        const testBtn = document.getElementById("test-connection");
        const testResult = document.getElementById("test-connection-result");

        if (saveBtn && input) {
            saveBtn.addEventListener("click", () => {
                const val = input.value.trim();
                if (val) {
                    localStorage.setItem("api_base", val);
                    location.reload();
                }
            });
        }
        if (testBtn) {
            testBtn.addEventListener("click", async () => {
                testResult.textContent = "Menguji koneksi...";
                const result = await API.ping();
                testResult.textContent = result.error ? "Gagal terhubung ke server" : "Koneksi berhasil";
            });
        }
    }

    return {
        renderGrid,
        loadCategories,
        initHome,
        initCategory,
        initGenres,
        initArchived,
        initAbout,
        buildCard
    };
})();
