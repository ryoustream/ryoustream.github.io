const SearchModule = (function () {
    let currentAbort = null;

    async function performSearch(query, extraParams) {
        if (currentAbort) currentAbort.abort();
        currentAbort = new AbortController();

        const container = document.getElementById("content-grid-container");
        if (!container) return;

        const params = { ...extraParams, q: query };
        const data = await API.search(params, currentAbort.signal).catch(() => null);
        if (!data) return;

        FilterSort.setLastParams(params);
        ContentLoader.renderGrid(container, params);
    }

    const debouncedSearch = debounce((value, extraParams) => {
        performSearch(value, extraParams);
    }, 300);

    function init() {
        document.addEventListener("input", (e) => {
            if (e.target.matches("[data-search-input]")) {
                const extraParams = FilterSort.getLastParams();
                debouncedSearch(e.target.value, extraParams);
            }
        });
    }

    return { init };
})();
