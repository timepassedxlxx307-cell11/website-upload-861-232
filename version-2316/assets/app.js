(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });
            start();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (input && query) {
                input.value = query;
            }

            function filter() {
                var q = normalize(input ? input.value : "");
                var r = normalize(region ? region.value : "");
                var t = normalize(type ? type.value : "");
                var y = normalize(year ? year.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(" "));
                    var match = true;
                    if (q && text.indexOf(q) === -1) {
                        match = false;
                    }
                    if (r && normalize(card.dataset.region) !== r) {
                        match = false;
                    }
                    if (t && normalize(card.dataset.type) !== t) {
                        match = false;
                    }
                    if (y && normalize(card.dataset.year) !== y) {
                        match = false;
                    }
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, type, year].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", filter);
                    el.addEventListener("change", filter);
                }
            });
            filter();
        });
    });

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            existing.addEventListener("error", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        script.addEventListener("error", callback, { once: true });
        document.head.appendChild(script);
    }

    window.initMoviePlayer = function (url) {
        ready(function () {
            var shell = document.querySelector("[data-player]");
            if (!shell) {
                return;
            }
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-player-button]");
            var started = false;
            var hlsInstance = null;

            function play() {
                if (!video || !url) {
                    return;
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
                if (started) {
                    video.play().catch(function () {});
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    video.play().catch(function () {});
                    return;
                }
                loadHls(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(url);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.src = url;
                        video.play().catch(function () {});
                    }
                });
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started || video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
                window.addEventListener("pagehide", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            }
        });
    };
})();
