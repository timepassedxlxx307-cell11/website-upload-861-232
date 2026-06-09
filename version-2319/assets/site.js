(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var navButton = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (navButton && mobileNav) {
            navButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var input = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-filter-region]");
        var year = document.querySelector("[data-filter-year]");
        var list = document.querySelector("[data-card-list]");
        var empty = document.querySelector("[data-filter-empty]");
        if (list && (input || region || year)) {
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }

            function filterCards() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-text") || "").toLowerCase();
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var ok = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        ok = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        ok = false;
                    }

                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }
            if (region) {
                region.addEventListener("change", filterCards);
            }
            if (year) {
                year.addEventListener("change", filterCards);
            }
            filterCards();
        }

        var playerShell = document.querySelector("[data-player-shell]");
        if (playerShell) {
            var video = playerShell.querySelector("[data-player-video]");
            var button = playerShell.querySelector("[data-player-button]");
            var mediaUrl = playerShell.getAttribute("data-url");
            var hlsInstance = null;

            function playVideo() {
                if (!video || !mediaUrl) {
                    return;
                }
                if (!playerShell.classList.contains("loaded")) {
                    playerShell.classList.add("loaded");
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = mediaUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(mediaUrl);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = mediaUrl;
                    }
                }
                video.setAttribute("controls", "controls");
                if (button) {
                    button.classList.add("hidden");
                }
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            playerShell.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                playVideo();
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
