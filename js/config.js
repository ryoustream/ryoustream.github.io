const CONFIG = {
    API_BASE: localStorage.getItem('api_base') || "https://PASTE_TUNNEL_URL_HERE.trycloudflare.com",

    USE_CACHE_FALLBACK: true,
    API_TIMEOUT: 8000,
    MAX_RETRY: 2,
    RETRY_DELAY: 1500,
    API_CACHE_TTL: 300000,

    ENDPOINTS: {
        PING: "/api/ping",
        CONTENTS: "/api/contents",
        CONTENT_DETAIL: "/api/contents/",
        CATEGORIES: "/api/categories",
        GENRES: "/api/genres",
        SETTINGS: "/api/settings",
        SEARCH: "/api/search",
        VIDEO_BASE: "/video/",
        POSTER_BASE: "/posters/"
    },

    VERSION: "1.0.0"
};
