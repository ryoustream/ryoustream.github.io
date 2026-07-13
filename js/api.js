const API = (function () {
    const memoryCache = new Map();

    function cacheKey(endpoint, params) {
        return endpoint + "?" + JSON.stringify(params || {});
    }

    function buildUrl(endpoint, params) {
        const url = new URL(CONFIG.API_BASE.replace(/\/$/, "") + endpoint);
        if (params) {
            Object.keys(params).forEach((k) => {
                if (params[k] !== undefined && params[k] !== null && params[k] !== "") {
                    url.searchParams.set(k, params[k]);
                }
            });
        }
        return url.toString();
    }

    async function fetchWithTimeout(url, options, timeout, signal) {
        const controller = new AbortController();
        const combinedSignal = signal || controller.signal;
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(url, { ...options, signal: combinedSignal });
            clearTimeout(timer);
            return res;
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    }

    async function request(endpoint, options = {}) {
        const { params, signal, useCache = true, method = "GET" } = options;
        const key = cacheKey(endpoint, params);

        if (useCache && memoryCache.has(key)) {
            const entry = memoryCache.get(key);
            if (Date.now() - entry.time < CONFIG.API_CACHE_TTL) {
                return entry.data;
            }
        }

        const url = buildUrl(endpoint, params);
        let lastError = null;

        for (let attempt = 0; attempt <= CONFIG.MAX_RETRY; attempt++) {
            try {
                const res = await fetchWithTimeout(url, { method }, CONFIG.API_TIMEOUT, signal);
                if (!res.ok) {
                    throw new Error("HTTP " + res.status);
                }
                const data = await res.json();
                memoryCache.set(key, { data, time: Date.now() });
                return data;
            } catch (err) {
                lastError = err;
                if (err.name === "AbortError" && signal) {
                    throw err;
                }
                if (attempt < CONFIG.MAX_RETRY) {
                    await new Promise((r) => setTimeout(r, CONFIG.RETRY_DELAY));
                }
            }
        }

        if (CONFIG.USE_CACHE_FALLBACK && memoryCache.has(key)) {
            const entry = memoryCache.get(key);
            return { ...entry.data, stale: true };
        }

        return { error: true, message: "Server unreachable", code: "OFFLINE" };
    }

    function getContents(params) {
        return request(CONFIG.ENDPOINTS.CONTENTS, { params });
    }

    function getContentDetail(id) {
        return request(CONFIG.ENDPOINTS.CONTENT_DETAIL + id);
    }

    function getCategories() {
        return request(CONFIG.ENDPOINTS.CATEGORIES);
    }

    function getGenres() {
        return request(CONFIG.ENDPOINTS.GENRES);
    }

    function getSettings() {
        return request(CONFIG.ENDPOINTS.SETTINGS);
    }

    function search(params, signal) {
        return request(CONFIG.ENDPOINTS.SEARCH, { params, signal, useCache: false });
    }

    function ping() {
        return request(CONFIG.ENDPOINTS.PING, { useCache: false });
    }

    function getVideoUrl(filename) {
        if (!filename) return "";
        return CONFIG.API_BASE.replace(/\/$/, "") + CONFIG.ENDPOINTS.VIDEO_BASE + filename;
    }

    function getPosterUrl(filename) {
        if (!filename) return "assets/images/posters/default-poster.svg";
        return CONFIG.API_BASE.replace(/\/$/, "") + CONFIG.ENDPOINTS.POSTER_BASE + filename;
    }

    return {
        request,
        getContents,
        getContentDetail,
        getCategories,
        getGenres,
        getSettings,
        search,
        ping,
        getVideoUrl,
        getPosterUrl
    };
})();
