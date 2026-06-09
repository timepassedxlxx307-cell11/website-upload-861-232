(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-site-nav]");
    var headerSearch = document.querySelector("[data-header-search]");

    if (menuButton && nav && headerSearch) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        headerSearch.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      showSlide(0);
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var searchForm = document.querySelector("[data-search-form]");
    if (searchForm) {
      var keywordInput = searchForm.querySelector("[data-keyword]");
      var categorySelect = searchForm.querySelector("[data-category-filter]");
      var typeSelect = searchForm.querySelector("[data-type-filter]");
      var emptyState = document.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && keywordInput) {
        keywordInput.value = q;
      }

      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardType = normalize(card.getAttribute("data-type"));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }

          card.classList.toggle("hide-card", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [keywordInput, categorySelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });

      applyFilters();
    }
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var overlay = document.querySelector("[data-play-button]");
  var initialized = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function bindSource() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    bindSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
