(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var links = document.querySelector(".nav-links");
        if (toggle && links) {
            toggle.addEventListener("click", function () {
                var open = links.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length > 1) {
            var current = 0;
            var prev = document.querySelector(".hero-prev");
            var next = document.querySelector(".hero-next");
            var timer;

            function show(index) {
                slides[current].classList.remove("active");
                current = (index + slides.length) % slides.length;
                slides[current].classList.add("active");
            }

            function restart() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5600);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            restart();
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
        var activeFilter = "all";

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(searchInputs.map(function (input) {
                return input.value;
            }).join(" "));

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search") || card.textContent);
                var genre = normalize(card.getAttribute("data-genre") || card.textContent);
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesGenre = activeFilter === "all" || genre.indexOf(normalize(activeFilter)) !== -1;
                card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesGenre));
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });

        Array.prototype.slice.call(document.querySelectorAll(".filter-btn")).forEach(function (button) {
            button.addEventListener("click", function () {
                Array.prototype.slice.call(button.parentNode.querySelectorAll(".filter-btn")).forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                activeFilter = button.getAttribute("data-filter") || "all";
                applyFilters();
            });
        });
    });

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("player-overlay");
        if (!video || !streamUrl) {
            return;
        }

        var hlsInstance = null;

        function attachStream() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function startPlayback() {
            attachStreamOnce();
            if (overlay) {
                overlay.hidden = true;
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        var attached = false;
        function attachStreamOnce() {
            if (!attached) {
                attached = true;
                attachStream();
            }
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("playing", function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
