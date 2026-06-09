(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var empty = scope.querySelector("[data-empty-state]");
        var active = "all";

        function textOf(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = textOf(card);
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesFilter = active === "all" || text.indexOf(active.toLowerCase()) !== -1;
                var show = matchesKeyword && matchesFilter;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                active = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-player-button]");
        var src = player.getAttribute("data-stream");
        var ready = false;
        var instance = null;

        function load() {
            if (ready || !video || !src) {
                return;
            }
            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                instance.loadSource(src);
                instance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            load();
            player.classList.add("is-playing");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        if (button && video) {
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("pagehide", function () {
                if (instance) {
                    instance.destroy();
                    instance = null;
                }
            });
        }
    });
})();
