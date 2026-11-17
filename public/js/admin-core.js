/* Yugan Photography — studio core: state, API, dialogs, uploads */
window.AKAdmin = window.AKAdmin || {};
(function (A) {
  'use strict';

  var root = document.querySelector('[data-admin]');
  var adminView = document.querySelector('#admin-view');
  var editorDialog = document.querySelector('[data-editor-dialog]');
  var editorContent = document.querySelector('[data-editor-content]');
  var mediaDialog = document.querySelector('[data-media-dialog]');
  var mediaGrid = document.querySelector('[data-media-grid]');
  var mediaEmpty = document.querySelector('[data-media-empty]');
  var mediaSearch = document.querySelector('[data-media-search]');
  var confirmDialog = document.querySelector('[data-confirm-dialog]');
  var toastRegion = document.querySelector('[data-toast-region]');
  var globalUpload = document.querySelector('[data-global-upload]');
  var saveState = document.querySelector('[data-save-state]');

  A.state = {
    content: null,
    inquiries: [],
    media: [],
    csrf: '',
    route: 'overview',
    galleryId: null,
    dirty: false,
    pickerCallback: null,
    pickerSelected: null,
    uploadRequest: null,
    confirmResolve: null,
    fieldSeq: 0,
  };

  A.RATIOS = [
    { value: 'natural', label: 'Original ratio' },
    { value: '4/5', label: 'Portrait · 4:5' },
    { value: '5/4', label: 'Landscape · 5:4' },
    { value: '3/2', label: 'Landscape · 3:2' },
    { value: '2/3', label: 'Portrait · 2:3' },
    { value: '1/1', label: 'Square · 1:1' },
    { value: '16/9', label: 'Wide · 16:9' },
    { value: '9/16', label: 'Tall · 9:16' },
  ];

  A.ROUTE_TITLES = {
    overview: 'Overview',
    home: 'Home page',
    about: 'About page',
    contact: 'Contact page',
    work: 'Projects',
    galleries: 'Galleries',
    gallery: 'Gallery',
    library: 'Image library',
    inquiries: 'Enquiries',
    settings: 'Site settings',
  };

  /* ----------------------------------------------------------------------
     Utilities
     ---------------------------------------------------------------------- */

  A.esc = function (value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  A.attr = function (value) {
    return A.esc(value).replace(/`/g, '&#96;');
  };

  A.icon = function (name) {
    var icons = {
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
      alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5"/><circle cx="12" cy="17.3" r=".8" fill="currentColor" stroke="none"/></svg>',
      plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
      trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6.5 7l.8 13h9.4l.8-13M10 11v5M14 11v5"/></svg>',
      edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/></svg>',
      image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="8.5" cy="9" r="1.6"/><path d="m4 17 5-5 4 4 3-3 4 4"/></svg>',
      upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/></svg>',
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
      arrowUpRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg>',
      arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
      drag: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/></svg>',
      star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m12 3 2.7 5.9 6.3.7-4.7 4.3 1.3 6.3-5.6-3.2-5.6 3.2 1.3-6.3L3 9.6l6.3-.7L12 3Z"/></svg>',
      eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
      external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M14 4h6v6M20 4 10 14"/><path d="M18 14v5H5V6h5"/></svg>',
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>',
      archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 7h18v4H3zM5 11v9h14v-9M9.5 15h5"/></svg>',
      crop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M7 3v14h14M3 7h14v14"/></svg>',
      refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
      grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/></svg>',
      settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.98 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.6 8.98a1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.96 4.6 1.7 1.7 0 0 0 10 3.04V3h4v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.87A1.7 1.7 0 0 0 20.96 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/></svg>',
    };
    return icons[name] || '';
  };

  A.setPath = function (target, path, value) {
    var parts = path.split('.');
    var cursor = target;
    for (var i = 0; i < parts.length - 1; i += 1) {
      var key = parts[i];
      var next = parts[i + 1];
      if (cursor[key] === undefined || cursor[key] === null) {
        cursor[key] = /^\d+$/.test(next) ? [] : {};
      }
      cursor = cursor[key];
    }
    cursor[parts[parts.length - 1]] = value;
  };

  A.getPath = function (target, path) {
    return path.split('.').reduce(function (value, key) {
      return value === undefined || value === null ? undefined : value[key];
    }, target);
  };

  A.sortByOrder = function (items) {
    return items.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  };

  A.formatDateTime = function (value) {
    var date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(date);
  };

  A.formatDate = function (value) {
    var date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(date);
  };

  A.mediaById = function (id) {
    if (!id || !A.state.content) return null;
    return (A.state.content.media || []).find(function (item) { return item.id === id; }) || null;
  };

  A.mediaThumb = function (media) {
    if (!media) return '';
    return media.thumb || (media.variants && media.variants[0] && media.variants[0].url) || '';
  };

  A.mediaFull = function (media) {
    if (!media || !media.variants || !media.variants.length) return '';
    return media.variants[media.variants.length - 1].url;
  };

  A.usageFor = function (mediaId) {
    var c = A.state.content;
    var uses = [];
    if (!c) return uses;
    var check = function (ref, label) {
      if (ref && ref.mediaId === mediaId) uses.push(label);
    };
    check(c.home.hero.image, 'Home — hero');
    check(c.home.intro.image, 'Home — introduction');
    check(c.home.cta.image, 'Home — contact panel');
    check(c.about.portrait, 'About — portrait');
    check(c.contact.image, 'Contact — page image');
    (c.projects || []).forEach(function (project) {
      check(project.cover, 'Project — ' + project.title + ' (cover)');
    });
    (c.galleries || []).forEach(function (gallery) {
      (gallery.photos || []).forEach(function (photo) {
        if (photo.mediaId === mediaId) {
          uses.push('Gallery — ' + gallery.title + (photo.caption ? ' (' + photo.caption + ')' : ''));
        }
      });
    });
    return uses;
  };

  A.syncMedia = function () {
    if (!A.state.content) return;
    A.state.media = (A.state.content.media || []).slice().sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  };

  A.computeStats = function () {
    var c = A.state.content || { projects: [], galleries: [], media: [] };
    var projects = c.projects || [];
    var galleries = c.galleries || [];
    return {
      projects: projects.length,
      visibleProjects: projects.filter(function (p) { return p.visible; }).length,
      galleries: galleries.length,
      photos: galleries.reduce(function (sum, g) { return sum + (g.photos || []).length; }, 0),
      media: (c.media || []).length,
      unreadInquiries: A.state.inquiries.filter(function (item) { return !item.read; }).length,
    };
  };

  A.updateCounts = function () {
    var stats = A.computeStats();
    document.querySelectorAll('[data-count="projects"]').forEach(function (el) { el.textContent = stats.projects; });
    document.querySelectorAll('[data-count="galleries"]').forEach(function (el) { el.textContent = stats.galleries; });
    document.querySelectorAll('[data-count="media"]').forEach(function (el) { el.textContent = stats.media; });
    document.querySelectorAll('[data-count="inquiries"]').forEach(function (el) {
      el.textContent = stats.unreadInquiries ? stats.unreadInquiries : '';
    });
  };

  /* ----------------------------------------------------------------------
     API
     ---------------------------------------------------------------------- */

  A.api = function (path, options) {
    options = options || {};
    var headers = Object.assign({ Accept: 'application/json' }, options.headers || {});
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.method && options.method !== 'GET') {
      headers['X-CSRF-Token'] = A.state.csrf;
    }
    return fetch('/api/admin' + path, Object.assign({}, options, {
      headers: headers,
      credentials: 'same-origin',
    })).then(function (response) {
      if (response.status === 401) {
        window.location.href = '/admin/login';
        throw new Error('Session expired');
      }
      return response.json().catch(function () { return {}; }).then(function (payload) {
        if (!response.ok) {
          var error = new Error(payload.error || 'The request could not be completed.');
          error.status = response.status;
          error.fields = payload.fields || null;
          error.usages = payload.usages || null;
          throw error;
        }
        return payload;
      });
    });
  };

  A.load = function () {
    return fetch('/api/admin/bootstrap', {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    }).then(function (response) {
      if (response.status === 401) {
        window.location.href = '/admin/login';
        throw new Error('Session expired');
      }
      if (!response.ok) throw new Error('The studio could not be loaded.');
      return response.json();
    }).then(function (data) {
      A.state.content = data.content;
      A.state.inquiries = data.inquiries || [];
      A.state.media = data.media || [];
      A.state.csrf = data.csrfToken || '';
      A.updateCounts();
      return data;
    });
  };

  A.applyContent = function (payload) {
    if (payload && payload.content) {
      A.state.content = payload.content;
      A.syncMedia();
      A.updateCounts();
    }
  };

  /* ----------------------------------------------------------------------
     Toast / saved state / progress
     ---------------------------------------------------------------------- */

  A.toast = function (message, type) {
    if (!toastRegion) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'success');
    toast.innerHTML =
      '<span class="toast__icon">' + A.icon(type === 'error' ? 'alert' : 'check') + '</span>' +
      '<p>' + A.esc(message) + '</p>';
    toastRegion.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add('is-leaving');
      window.setTimeout(function () { toast.remove(); }, 320);
    }, type === 'error' ? 6000 : 3800);
  };

  A.markSaved = function (message) {
    if (!saveState) return;
    saveState.textContent = message || 'Saved';
    saveState.classList.add('is-visible');
    window.clearTimeout(A._saveTimer);
    A._saveTimer = window.setTimeout(function () {
      saveState.classList.remove('is-visible');
    }, 2600);
  };

  A.ensureProgress = function () {
    var el = document.querySelector('[data-upload-progress]');
    if (!el) {
      el = document.createElement('div');
      el.className = 'upload-progress';
      el.setAttribute('data-upload-progress', '');
      el.innerHTML =
        '<div class="upload-progress__track"><div class="upload-progress__bar" data-upload-bar></div></div>' +
        '<p class="upload-progress__label" data-upload-label>Preparing upload…</p>';
      document.body.appendChild(el);
    }
    return el;
  };

  A.showProgress = function (percent, label) {
    var el = A.ensureProgress();
    var bar = el.querySelector('[data-upload-bar]');
    var text = el.querySelector('[data-upload-label]');
    el.hidden = false;
    if (bar) bar.style.width = Math.max(0, Math.min(100, percent)) + '%';
    if (text) text.textContent = label;
  };

  A.hideProgress = function () {
    var el = document.querySelector('[data-upload-progress]');
    if (!el) return;
    window.setTimeout(function () { el.hidden = true; }, 500);
  };

  /* ----------------------------------------------------------------------
     Confirm dialog
     ---------------------------------------------------------------------- */

  A.confirm = function (options) {
    options = options || {};
    return new Promise(function (resolve) {
      if (!confirmDialog) {
        resolve(window.confirm(options.message || 'Are you sure?'));
        return;
      }
      A.state.confirmResolve = resolve;
      var kicker = confirmDialog.querySelector('[data-confirm-kicker]');
      var title = confirmDialog.querySelector('[data-confirm-title]');
      var message = confirmDialog.querySelector('[data-confirm-message]');
      var ok = confirmDialog.querySelector('[data-confirm-ok]');
      if (kicker) kicker.textContent = options.kicker || 'Please confirm';
      if (title) title.textContent = options.title || 'Are you sure?';
      if (message) message.textContent = options.message || '';
      if (ok) {
        ok.textContent = options.confirmLabel || 'Remove';
        ok.className = 'button ' + (options.safe ? 'button--ink' : 'button--danger');
      }
      confirmDialog.showModal();
      if (ok) ok.focus();
    });
  };

  function settleConfirm(value) {
    var resolve = A.state.confirmResolve;
    A.state.confirmResolve = null;
    if (confirmDialog && confirmDialog.open) confirmDialog.close();
    if (resolve) resolve(value);
  }

  if (confirmDialog) {
    confirmDialog.querySelector('[data-confirm-ok]').addEventListener('click', function () { settleConfirm(true); });
    confirmDialog.querySelector('[data-confirm-cancel]').addEventListener('click', function () { settleConfirm(false); });
    confirmDialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      settleConfirm(false);
    });
    confirmDialog.addEventListener('close', function () {
      if (A.state.confirmResolve) settleConfirm(false);
    });
  }

  /* ----------------------------------------------------------------------
     Editor dialog
     ---------------------------------------------------------------------- */

  A.openEditor = function (html) {
    if (!editorDialog || !editorContent) return;
    if (editorDialog.open) editorDialog.close();
    editorContent.innerHTML = html;
    editorDialog.showModal();
    var first = editorDialog.querySelector('input:not([type="hidden"]), textarea, select, button');
    if (first) window.setTimeout(function () { first.focus(); }, 60);
  };

  A.closeEditor = function () {
    if (editorDialog && editorDialog.open) editorDialog.close();
  };

  if (editorDialog) {
    editorDialog.addEventListener('click', function (event) {
      if (event.target === editorDialog) A.closeEditor();
    });
  }

  /* ----------------------------------------------------------------------
     Media picker
     ---------------------------------------------------------------------- */

  A.renderMediaPicker = function (filter) {
    if (!mediaGrid) return;
    var query = String(filter || '').trim().toLowerCase();
    var items = A.state.media.filter(function (media) {
      if (!query) return true;
      return (
        String(media.filename || '').toLowerCase().indexOf(query) !== -1 ||
        String(media.alt || '').toLowerCase().indexOf(query) !== -1
      );
    });

    mediaGrid.innerHTML = items.map(function (media) {
      var selected = media.id === A.state.pickerSelected;
      return (
        '<button class="media-option' + (selected ? ' is-selected' : '') + '" type="button" data-media-id="' + A.attr(media.id) + '">' +
          '<span class="media-option__media"><img src="' + A.attr(A.mediaThumb(media)) + '" alt="" loading="lazy"></span>' +
          '<span class="media-option__label">' + A.esc(media.alt || media.filename) + '</span>' +
          '<span class="media-option__check">' + A.icon('check') + '</span>' +
        '</button>'
      );
    }).join('');

    if (mediaEmpty) mediaEmpty.hidden = items.length !== 0;
  };

  A.openMediaPicker = function (callback, selectedId) {
    if (!mediaDialog) return;
    A.state.pickerCallback = callback;
    A.state.pickerSelected = selectedId || null;
    if (mediaSearch) mediaSearch.value = '';
    A.renderMediaPicker('');
    if (mediaDialog.open) mediaDialog.close();
    mediaDialog.showModal();
    window.setTimeout(function () {
      if (mediaSearch) mediaSearch.focus();
    }, 60);
  };

  A.closeMediaPicker = function () {
    if (mediaDialog && mediaDialog.open) mediaDialog.close();
    A.state.pickerCallback = null;
  };

  if (mediaDialog) {
    mediaDialog.querySelectorAll('[data-media-close]').forEach(function (button) {
      button.addEventListener('click', A.closeMediaPicker);
    });
    mediaDialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      A.closeMediaPicker();
    });
    if (mediaSearch) {
      mediaSearch.addEventListener('input', function () {
        A.renderMediaPicker(mediaSearch.value);
      });
    }
    if (mediaGrid) {
      mediaGrid.addEventListener('click', function (event) {
        var option = event.target.closest('[data-media-id]');
        if (!option) return;
        var media = A.mediaById(option.getAttribute('data-media-id'));
        if (!media) return;
        var callback = A.state.pickerCallback;
        A.closeMediaPicker();
        if (callback) callback(media);
      });
    }
  }

  /* ----------------------------------------------------------------------
     Image fields
     ---------------------------------------------------------------------- */

  A.ratioOptions = function (selected) {
    return A.RATIOS.map(function (ratio) {
      return '<option value="' + A.attr(ratio.value) + '"' + (ratio.value === selected ? ' selected' : '') + '>' + A.esc(ratio.label) + '</option>';
    }).join('');
  };

  A.imageField = function (label, path, ref, options) {
    options = options || {};
    var media = ref && ref.mediaId ? A.mediaById(ref.mediaId) : null;
    var x = ref && ref.focalX !== undefined ? ref.focalX : 50;
    var y = ref && ref.focalY !== undefined ? ref.focalY : 50;
    var ratio = ref && ref.ratio ? ref.ratio : 'natural';
    var preview = media
      ? '<img src="' + A.attr(A.mediaThumb(media)) + '" alt="" data-preview-img>'
      : '<span class="image-field__empty">' + A.icon('image') + '<span>No image</span></span>';
    return (
      '<div class="image-field' + (options.full ? ' image-field--full' : '') + '" data-image-field data-path="' + A.attr(path) + '">' +
        '<input type="hidden" data-image-id value="' + A.attr(media ? media.id : '') + '">' +
        '<div class="image-field__preview" data-image-preview>' + preview + '</div>' +
        '<div class="image-field__controls">' +
          '<div class="image-field__actions">' +
            '<button type="button" class="button button--outline button--small" data-action="pick-image">' + A.icon('image') + ' Choose image</button>' +
            '<button type="button" class="link-button" data-action="clear-image">Remove</button>' +
            '<span class="image-field__name" data-image-name>' + A.esc(media ? media.filename : 'No image selected') + '</span>' +
          '</div>' +
          '<div class="image-field__row">' +
            '<label class="admin-field admin-field--compact"><span>Display ratio</span><select data-image-ratio>' + A.ratioOptions(ratio) + '</select></label>' +
            '<label class="admin-field admin-field--compact"><span>Focus X</span><div class="range-field"><input type="range" min="0" max="100" step="1" value="' + A.attr(x) + '" data-image-x><output>' + A.esc(Math.round(x)) + '</output></div></label>' +
            '<label class="admin-field admin-field--compact"><span>Focus Y</span><div class="range-field"><input type="range" min="0" max="100" step="1" value="' + A.attr(y) + '" data-image-y><output>' + A.esc(Math.round(y)) + '</output></div></label>' +
          '</div>' +
          '<p class="admin-field__hint">' + (options.hint || 'The crop focus sets which part of the photograph stays visible.') + '</p>' +
        '</div>' +
      '</div>'
    );
  };

  A.setImageField = function (field, media) {
    if (!field) return;
    var input = field.querySelector('[data-image-id]');
    var preview = field.querySelector('[data-image-preview]');
    var name = field.querySelector('[data-image-name]');
    if (input) input.value = media ? media.id : '';
    if (preview) {
      preview.innerHTML = media
        ? '<img src="' + A.attr(A.mediaThumb(media)) + '" alt="" data-preview-img>'
        : '<span class="image-field__empty">' + A.icon('image') + '<span>No image</span></span>';
    }
    if (name) name.textContent = media ? media.filename : 'No image selected';
  };

  A.readImageFields = function (rootEl) {
    var out = {};
    rootEl.querySelectorAll('[data-image-field]').forEach(function (field) {
      var path = field.getAttribute('data-path');
      var id = field.querySelector('[data-image-id]').value;
      var ratio = field.querySelector('[data-image-ratio]').value;
      var x = Number(field.querySelector('[data-image-x]').value);
      var y = Number(field.querySelector('[data-image-y]').value);
      out[path] = id ? { mediaId: id, ratio: ratio, focalX: x, focalY: y } : null;
    });
    return out;
  };

  A.collectForm = function (form) {
    var body = {};
    form.querySelectorAll('input[name], textarea[name], select[name]').forEach(function (input) {
      if (input.type === 'checkbox') {
        A.setPath(body, input.name, input.checked);
      } else if (input.type === 'radio') {
        if (input.checked) A.setPath(body, input.name, input.value);
      } else {
        A.setPath(body, input.name, input.value);
      }
    });
    var images = A.readImageFields(form);
    Object.keys(images).forEach(function (path) {
      A.setPath(body, path, images[path]);
    });
    return body;
  };

  A.clearFormErrors = function (form) {
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (input) {
      input.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.admin-field__error').forEach(function (el) { el.remove(); });
  };

  A.formField = function (form, name) {
    var found = null;
    form.querySelectorAll('[name]').forEach(function (input) {
      if (input.name === name) found = input;
    });
    return found;
  };

  A.showFieldErrors = function (form, fields) {
    if (!fields) return;
    Object.keys(fields).forEach(function (name) {
      var input = A.formField(form, name);
      if (!input) {
        var imageField = form.querySelector('[data-image-field][data-path="' + name.replace(/"/g, '\\"') + '"]');
        if (imageField) imageField.classList.add('has-error');
        return;
      }
      input.setAttribute('aria-invalid', 'true');
      var error = document.createElement('p');
      error.className = 'admin-field__error';
      error.textContent = fields[name];
      var wrapper = input.closest('.admin-field');
      if (wrapper) wrapper.appendChild(error);
    });
  };

  /* ----------------------------------------------------------------------
     Uploads
     ---------------------------------------------------------------------- */

  A.requestUpload = function (request) {
    if (!globalUpload) return;
    A.state.uploadRequest = request;
    globalUpload.value = '';
    globalUpload.click();
  };

  A.startUpload = function (request, files) {
    if (!request || !files || !files.length) return;
    var endpoint;
    var fieldName = 'photos';
    if (request.kind === 'gallery') {
      endpoint = '/api/admin/galleries/' + encodeURIComponent(request.galleryId) + '/photos';
    } else if (request.kind === 'replace') {
      endpoint = '/api/admin/galleries/' + encodeURIComponent(request.galleryId) + '/photos/' + encodeURIComponent(request.photoId) + '/replace';
      fieldName = 'photo';
      files = [files[0]];
    } else {
      endpoint = '/api/admin/media';
    }

    var formData = new FormData();
    Array.prototype.forEach.call(files, function (file) { formData.append(fieldName, file); });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.setRequestHeader('X-CSRF-Token', A.state.csrf);
    xhr.setRequestHeader('Accept', 'application/json');

    A.showProgress(2, 'Uploading ' + files.length + (files.length === 1 ? ' photograph…' : ' photographs…'));

    xhr.upload.onprogress = function (event) {
      if (!event.lengthComputable) return;
      var percent = Math.round((event.loaded / event.total) * 88) + 2;
      A.showProgress(percent, 'Uploading… ' + Math.round((event.loaded / event.total) * 100) + '%');
    };

    xhr.onload = function () {
      var payload = {};
      try { payload = JSON.parse(xhr.responseText || '{}'); } catch (error) { payload = {}; }
      if (xhr.status >= 200 && xhr.status < 300) {
        A.applyContent(payload);
        A.showProgress(100, 'Processing complete');
        A.hideProgress();
        var count = (payload.uploaded && payload.uploaded.length) || files.length;
        if (request.kind === 'replace') {
          A.toast('Photograph replaced.');
        } else {
          A.toast(count + (count === 1 ? ' photograph added.' : ' photographs added.'));
        }
        if (payload.errors && payload.errors.length) {
          payload.errors.forEach(function (item) {
            A.toast(item.filename + ': ' + item.error, 'error');
          });
        }
        if (request.picker) {
          A.state.pickerSelected = payload.uploaded && payload.uploaded[0] ? payload.uploaded[0].id : A.state.pickerSelected;
          A.renderMediaPicker(mediaSearch ? mediaSearch.value : '');
        }
        if (request.kind === 'replace') {
          A.closeEditor();
        }
        if (A.rerender) A.rerender();
        if (A.updateCounts) A.updateCounts();
      } else {
        A.hideProgress();
        A.toast(payload.error || 'The upload could not be completed.', 'error');
      }
    };

    xhr.onerror = function () {
      A.hideProgress();
      A.toast('The upload failed. Check your connection and try again.', 'error');
    };

    xhr.send(formData);
  };

  if (globalUpload) {
    globalUpload.addEventListener('change', function () {
      var files = globalUpload.files;
      var request = A.state.uploadRequest;
      if (files && files.length && request) A.startUpload(request, files);
      globalUpload.value = '';
      A.state.uploadRequest = null;
    });
  }

})(window.AKAdmin);
