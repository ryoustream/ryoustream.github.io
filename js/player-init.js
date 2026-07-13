const PlayerInit = (function () {
    async function init(id) {
        const container = document.getElementById("player-detail-container");
        if (!id || !container) return;

        const data = await API.getContentDetail(id);
        if (data.error || !data.content) {
            const errorArea = document.getElementById("player-error");
            if (errorArea) {
                errorArea.style.display = "block";
                errorArea.textContent = "Video tidak dapat dimuat. Periksa koneksi server.";
            }
            return;
        }

        const content = data.content;
        const player = document.getElementById("main-player");
        if (player) {
            player.src = API.getVideoUrl(content.videoSrc);
            player.poster = API.getPosterUrl(content.poster);
        }

        document.querySelector("[data-player-title]").textContent = content.title;
        document.querySelector("[data-player-description]").textContent = content.description;
        document.querySelector("[data-player-year]").textContent = content.year;
        document.querySelector("[data-player-rating]").textContent = content.rating;
        document.querySelector("[data-player-duration]").textContent = content.duration || formatDuration(content.durationSeconds);

        const genreContainer = document.querySelector("[data-player-genres]");
        if (genreContainer) {
            genreContainer.innerHTML = (content.genres || [])
                .map((g) => `<span class="genre-tag">${g}</span>`)
                .join("");
        }

        const catContainer = document.querySelector("[data-player-category]");
        if (catContainer) catContainer.textContent = content.category;

        const backBtn = document.querySelector("[data-back-button]");
        if (backBtn) {
            backBtn.addEventListener("click", () => history.back());
        }

        loadRelated(content);
    }

    async function loadRelated(content) {
        const container = document.getElementById("related-content-container");
        if (!container) return;
        const data = await API.search({ category: content.category, limit: 10 });
        if (data.error) return;
        const items = (data.contents || []).filter((c) => c.id !== content.id);
        container.innerHTML = "";
        items.forEach((item) => container.appendChild(ContentLoader.buildCard(item)));
        if (window.CarouselInit) CarouselInit.initCarousels(container.closest("section"));
    }

    return { init };
})();
