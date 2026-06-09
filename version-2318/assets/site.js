document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-dot'));
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        startTimer();
      });
    });

    show(0);
    startTimer();
  });

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var scopeSelector = input.getAttribute('data-search-input');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var empty = document.querySelector(input.getAttribute('data-empty-target') || '');

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call((scope || document).querySelectorAll('.searchable-card'));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || card.textContent.toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video[data-video-src]');
    var button = shell.querySelector('.play-layer');
    var hlsInstance = null;

    function begin() {
      if (!video) {
        return;
      }

      var address = video.getAttribute('data-video-src');
      shell.classList.add('is-playing');

      if (!video.dataset.ready) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(address);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = address;
          video.play().catch(function () {});
        }
        video.dataset.ready = '1';
      } else {
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        begin();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === shell) {
        begin();
      }
    });

    video.addEventListener('error', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
});
