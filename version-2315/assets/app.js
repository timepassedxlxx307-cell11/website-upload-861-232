(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) return;
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var year = qs('[data-year-filter]', scope);
      var type = qs('[data-type-filter]', scope);
      var region = qs('[data-region-filter]', scope);
      var cards = qsa('.movie-card', scope);

      if (scope.hasAttribute('data-query-page')) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) input.value = query;
      }

      function apply() {
        var queryValue = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (queryValue && text.indexOf(queryValue) === -1) ok = false;
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) ok = false;
          if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) ok = false;
          if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) ok = false;
          card.classList.toggle('is-hidden', !ok);
        });
      }

      [input, year, type, region].forEach(function (control) {
        if (!control) return;
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      apply();
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('.player-start', shell);
      var src = shell.getAttribute('data-video-src');
      var hlsInstance = null;
      var loaded = false;

      if (!video || !src) return;

      function attach() {
        if (loaded) return;
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = src;
      }

      function play() {
        attach();
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
}());
