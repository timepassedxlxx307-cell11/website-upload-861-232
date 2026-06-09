(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initCardFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]")).forEach(function (filter) {
      var input = filter.querySelector("[data-filter-input]");
      var region = filter.querySelector("[data-filter-region]");
      var year = filter.querySelector("[data-filter-year]");
      var genre = filter.querySelector("[data-filter-genre]");
      var list = filter.parentElement.querySelector("[data-card-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var genreValue = normalize(genre && genre.value);
        cards.forEach(function (card) {
          var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-genre"));
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
            ok = false;
          }
          if (genreValue && normalize(card.getAttribute("data-genre")).indexOf(genreValue) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
        });
      }

      [input, region, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
        apply();
      }
    });
  }

  function setupPlayer(videoId, coverId, playbackUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !playbackUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(playbackUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playbackUrl;
      }
      video.controls = true;
    }

    function play() {
      load();
      cover.classList.add("hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;

  ready(function () {
    initMenu();
    initHero();
    initCardFilters();
  });
})();
