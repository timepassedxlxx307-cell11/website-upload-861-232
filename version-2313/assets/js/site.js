document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        let currentIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(currentIndex + 1);
        }, 5000);
    }

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        const buttons = Array.from(panel.querySelectorAll("[data-filter-value]"));
        const grid = document.querySelector(".filterable-grid");

        if (!grid) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll("[data-card]"));

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                const value = button.getAttribute("data-filter-value");
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function (card) {
                    const text = card.getAttribute("data-filter-text") || "";
                    const matched = value === "all" || text.indexOf(value) !== -1;
                    card.style.display = matched ? "" : "none";
                });
            });
        });
    });

    const searchResults = document.getElementById("search-results");
    const searchTitle = document.querySelector("[data-search-title]");

    if (searchResults && Array.isArray(window.movieIndex)) {
        const params = new URLSearchParams(window.location.search);
        const query = (params.get("q") || "").trim();

        if (query) {
            const lowerQuery = query.toLowerCase();
            const results = window.movieIndex.filter(function (movie) {
                return movie.search.toLowerCase().indexOf(lowerQuery) !== -1;
            }).slice(0, 120);

            if (searchTitle) {
                searchTitle.textContent = "搜索结果：" + query;
            }

            if (results.length) {
                searchResults.innerHTML = results.map(renderSearchCard).join("");
            } else {
                searchResults.innerHTML = "<div class=\"empty-state\"><h2>没有找到相关影片</h2><p>可以尝试更换影片名、地区、年份或类型关键词。</p></div>";
            }
        }
    }
});

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderSearchCard(movie) {
    return "<article class=\"movie-card\">" +
        "<a class=\"movie-cover\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"cover-badge\">" + escapeHtml(movie.region) + "</span>" +
            "<span class=\"cover-play\">▶</span>" +
        "</a>" +
        "<div class=\"movie-info\">" +
            "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
        "</div>" +
    "</article>";
}
