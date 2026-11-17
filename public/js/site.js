/* Yugan Photography — public site behaviour */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     Theme
     ---------------------------------------------------------------------- */

  var themeButtons = document.querySelectorAll('[data-theme-toggle]');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function updateThemeButtons() {
    var theme = currentTheme();
    var next = theme === 'dark' ? 'light' : 'dark';
    themeButtons.forEach(function (button) {
      button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      button.setAttribute('title', 'Switch to ' + next + ' theme');
      var label = button.querySelector('[data-theme-label]');
      if (label) label.textContent = next === 'dark' ? 'Dark' : 'Light';
    });
  }

  themeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('ak-theme', next);
      } catch (error) {
        /* storage may be unavailable */
      }
      updateThemeButtons();
    });
  });

  updateThemeButtons();

  /* ----------------------------------------------------------------------
     Header scroll state
     ---------------------------------------------------------------------- */

  var header = document.querySelector('[data-header]');
  var ticking = false;

  function syncHeader() {
    if (!header) return;
    var threshold = header.classList.contains('site-header--overlay') ? 40 : 12;
    header.classList.toggle('is-scrolled', window.scrollY > threshold);
    ticking = false;
  }

  if (header) {
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(syncHeader);
      },
      { passive: true },
    );
    syncHeader();
  }

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */

  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  var menuCloseTimer = null;
  var lastFocused = null;

  function openMenu() {
    if (!mobileMenu || !navToggle) return;
    window.clearTimeout(menuCloseTimer);
    lastFocused = document.activeElement;
    mobileMenu.hidden = false;
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    window.requestAnimationFrame(function () {
      mobileMenu.classList.add('is-open');
      var first = mobileMenu.querySelector('a');
      if (first) first.focus();
    });
  }

  function closeMenu(returnFocus) {
    if (!mobileMenu || !navToggle) return;
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    menuCloseTimer = window.setTimeout(function () {
      mobileMenu.hidden = true;
    }, 350);
    if (returnFocus !== false) {
      var target = lastFocused || navToggle;
      if (target && typeof target.focus === 'function') target.focus();
    }
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      if (navToggle.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu(false);
      }
    });
  }

  /* ----------------------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------------------- */

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll(
      '.section-head, .intro__text, .intro__figure, .project-card, .quote__inner, .cta__media, .cta__body, .about-story__figure, .about-story__text, .approach__item, .experience__row, .highlights__col, .contact__form-wrap, .contact__aside, .next-project__inner, .gallery-item, .page-head__lead',
    );

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    revealTargets.forEach(function (element, index) {
      element.classList.add('reveal');
      element.style.transitionDelay = Math.min(index % 4, 3) * 60 + 'ms';
      observer.observe(element);
    });
  }

  /* ----------------------------------------------------------------------
     Work filters
     ---------------------------------------------------------------------- */

  var filterBar = document.querySelector('[data-filter-bar]');
  var workGrid = document.querySelector('[data-work-grid]');

  if (filterBar && workGrid) {
    var filterButtons = filterBar.querySelectorAll('[data-filter]');
    var resultLabel = filterBar.querySelector('[data-filter-result]');
    var emptyState = document.querySelector('[data-filter-empty]');
    var cards = workGrid.querySelectorAll('[data-category]');

    function applyFilter(category) {
      var visible = 0;
      cards.forEach(function (card) {
        var match = category === 'all' || card.getAttribute('data-category') === category;
        card.classList.toggle('is-filtered', !match);
        if (match) visible += 1;
      });

      filterButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-filter') === category ? 'true' : 'false');
      });

      if (resultLabel) {
        resultLabel.textContent = visible + (visible === 1 ? ' project' : ' projects');
      }
      if (emptyState) emptyState.hidden = visible !== 0;
    }

    filterBar.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) return;
      applyFilter(button.getAttribute('data-filter'));
    });

    var resetButton = document.querySelector('[data-filter-reset]');
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        applyFilter('all');
        var first = filterBar.querySelector('[data-filter="all"]');
        if (first) first.focus();
      });
    }
  }

  /* ----------------------------------------------------------------------
     Lightbox
     ---------------------------------------------------------------------- */

  var lightbox = document.querySelector('[data-lightbox]');

  if (lightbox) {
    var lightboxImage = lightbox.querySelector('[data-lightbox-image]');
    var lightboxCaption = lightbox.querySelector('[data-lightbox-caption]');
    var lightboxCounter = lightbox.querySelector('[data-lightbox-counter]');
    var lightboxClose = lightbox.querySelector('[data-lightbox-close]');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-item]'));
    var currentIndex = 0;
    var trigger = null;

    function renderLightbox(index) {
      if (!items.length) return;
      currentIndex = (index + items.length) % items.length;
      var item = items[currentIndex];
      lightboxImage.src = item.getAttribute('data-full');
      lightboxImage.alt = item.getAttribute('data-alt') || '';
      lightboxCaption.textContent = item.getAttribute('data-caption') || '';
      lightboxCounter.textContent = currentIndex + 1 + ' / ' + items.length;

      var next = items[(currentIndex + 1) % items.length];
      if (next && next.getAttribute('data-full')) {
        var preload = new Image();
        preload.src = next.getAttribute('data-full');
      }
    }

    function openLightbox(index, item) {
      trigger = item;
      renderLightbox(index);
      lightbox.hidden = false;
      lightbox.classList.add('is-opening');
      document.body.classList.add('no-scroll');
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.classList.remove('is-opening');
      document.body.classList.remove('no-scroll');
      lightboxImage.src = '';
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    }

    items.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index, item);
      });
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (button) {
      button.addEventListener('click', closeLightbox);
    });

    var prevButton = lightbox.querySelector('[data-lightbox-prev]');
    var nextButton = lightbox.querySelector('[data-lightbox-next]');
    if (prevButton) prevButton.addEventListener('click', function () { renderLightbox(currentIndex - 1); });
    if (nextButton) nextButton.addEventListener('click', function () { renderLightbox(currentIndex + 1); });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        renderLightbox(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        renderLightbox(currentIndex + 1);
      } else if (event.key === 'Tab') {
        var focusables = lightbox.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ----------------------------------------------------------------------
     Contact form
     ---------------------------------------------------------------------- */

  var contactForm = document.querySelector('[data-contact-form]');

  if (contactForm) {
    var status = contactForm.querySelector('[data-form-status]');
    var submit = contactForm.querySelector('[data-submit]');
    var submitLabel = contactForm.querySelector('[data-submit-label]');
    var success = document.querySelector('[data-contact-success]');
    var successText = document.querySelector('[data-contact-success-text]');
    var resetButton = document.querySelector('[data-contact-reset]');
    var fields = ['name', 'email', 'projectType', 'message'];

    function fieldError(name, message) {
      var error = contactForm.querySelector('[data-error-for="' + name + '"]');
      var input = contactForm.querySelector('[name="' + name + '"]');
      if (error) {
        error.textContent = message || '';
        error.hidden = !message;
      }
      if (input) {
        if (message) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    }

    function clearErrors() {
      fields.forEach(function (name) { fieldError(name, ''); });
      if (status) {
        status.hidden = true;
        status.textContent = '';
        status.className = 'form-status';
      }
    }

    function showStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.className = 'form-status is-' + type;
      status.hidden = false;
    }

    function validate(values) {
      var errors = {};
      if (!values.name || values.name.trim().length < 2) {
        errors.name = 'Please share your name.';
      }
      if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
      if (!values.message || values.message.trim().length < 10) {
        errors.message = 'Please add a little more detail (at least 10 characters).';
      }
      return errors;
    }

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors();

      var data = new FormData(contactForm);
      var values = {
        name: String(data.get('name') || ''),
        email: String(data.get('email') || ''),
        projectType: String(data.get('projectType') || ''),
        message: String(data.get('message') || ''),
        website: String(data.get('website') || ''),
      };

      var errors = validate(values);
      if (Object.keys(errors).length) {
        Object.keys(errors).forEach(function (name) { fieldError(name, errors[name]); });
        var first = contactForm.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }

      submit.disabled = true;
      submit.classList.add('is-loading');
      if (submitLabel) submitLabel.textContent = 'Sending';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (payload) {
            return { ok: response.ok, status: response.status, payload: payload };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            if (result.payload && result.payload.fields) {
              Object.keys(result.payload.fields).forEach(function (name) {
                fieldError(name, result.payload.fields[name]);
              });
            }
            showStatus(
              (result.payload && result.payload.error) ||
                'The note could not be sent. Please try again, or email directly.',
              'error',
            );
            return;
          }

          contactForm.hidden = true;
          if (success) {
            success.hidden = false;
            if (successText && result.payload && result.payload.message) {
              successText.textContent = result.payload.message;
            }
            success.setAttribute('tabindex', '-1');
            success.focus({ preventScroll: true });
            success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
        })
        .catch(function () {
          showStatus('The note could not be sent. Check your connection and try again.', 'error');
        })
        .finally(function () {
          submit.disabled = false;
          submit.classList.remove('is-loading');
          if (submitLabel) submitLabel.textContent = 'Send enquiry';
        });
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        contactForm.reset();
        clearErrors();
        contactForm.hidden = false;
        if (success) success.hidden = true;
        var firstInput = contactForm.querySelector('input[name="name"]');
        if (firstInput) firstInput.focus();
      });
    }
  }
})();
