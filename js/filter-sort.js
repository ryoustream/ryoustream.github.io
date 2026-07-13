const FilterSort = (function () {
    let lastParams = {};

    function setLastParams(params) {
        lastParams = { ...lastParams, ...params };
    }

    function getLastParams() {
        return lastParams;
    }

    function bind(container, baseParams) {
        lastParams = { ...baseParams };
    }

    function init() {
        document.addEventListener("change", (e) => {
            if (e.target.matches("[data-sort-select]")) {
                lastParams.sort = e.target.value;
                const container = document.getElementById("content-grid-container");
                ContentLoader.renderGrid(container, lastParams);
            }
        });
    }

    return { init, bind, setLastParams, getLastParams };
})();
