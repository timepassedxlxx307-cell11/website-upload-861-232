(function () {
    var hlsPromise = null;

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function loadHls() {
        if (!hlsPromise) {
            hlsPromise = import('./hls-vendor-dru42stk.js')
                .then(function (module) {
                    return module.H || null;
                })
                .catch(function () {
                    return null;
                });
        }
        return hlsPromise;
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                var target = form.getAttribute('action') || 'search.html';
                window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
            });
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var thumbs = qsa('[data-hero-thumb]', root);
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(Number(thumb.getAttribute('data-hero-thumb') || 0));
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getCardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function applyFilter(root) {
        var input = qs('[data-live-search]');
        var empty = qs('[data-empty-state]');
        var query = normalize(input ? input.value : '');
        var cards = qsa('[data-card]', root);
        var visible = 0;
        cards.forEach(function (card) {
            var matched = !query || getCardText(card).indexOf(query) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function sortCards(root, mode) {
        var cards = qsa('[data-card]', root);
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
            if (mode === 'latest') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (mode === 'popular') {
                return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
            }
            if (mode === 'rating') {
                return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
            }
            if (mode === 'title') {
                return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
            }
            return 0;
        });
        sorted.forEach(function (card) {
            root.appendChild(card);
        });
    }

    function initFilters() {
        var list = qs('[data-card-list]');
        if (!list) {
            return;
        }
        var input = qs('[data-live-search]');
        var sort = qs('[data-sort-select]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        var searchTitle = qs('[data-search-title]');
        if (query && input) {
            input.value = query;
            if (searchTitle) {
                searchTitle.textContent = '搜索：' + query;
            }
        }
        if (input) {
            input.addEventListener('input', function () {
                applyFilter(list);
            });
        }
        if (sort) {
            sort.addEventListener('change', function () {
                sortCards(list, sort.value);
                applyFilter(list);
            });
        }
        applyFilter(list);
    }

    function attachNative(video, source) {
        video.src = source;
        video.setAttribute('data-ready', 'true');
        return Promise.resolve();
    }

    function prepareVideo(player, video, source) {
        if (video.getAttribute('data-ready') === 'true') {
            return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            return attachNative(video, source);
        }
        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                player._hls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                video.setAttribute('data-ready', 'true');
                return new Promise(function (resolve) {
                    if (Hls.Events && Hls.Events.MANIFEST_PARSED) {
                        hls.on(Hls.Events.MANIFEST_PARSED, resolve);
                    } else {
                        resolve();
                    }
                    window.setTimeout(resolve, 1600);
                });
            }
            return attachNative(video, source);
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (player) {
            var video = qs('video', player);
            var cover = qs('.player-cover', player);
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-video');
            if (!source) {
                return;
            }

            function play() {
                prepareVideo(player, video, source).then(function () {
                    if (cover) {
                        cover.hidden = true;
                    }
                    player.classList.add('is-playing');
                    video.controls = true;
                    var result = video.play();
                    if (result && result.catch) {
                        result.catch(function () {});
                    }
                });
            }

            if (cover) {
                cover.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused && video.getAttribute('data-ready') !== 'true') {
                    play();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayers();
    });
})();
