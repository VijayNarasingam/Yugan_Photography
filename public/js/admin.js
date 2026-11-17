/* Yugan Photography — studio application: routing, events, saving */
(function (A) {
  'use strict';

  var adminView = document.querySelector('#admin-view');
  var sectionTitle = document.querySelector('[data-section-title]');
  var sidebar = document.querySelector('[data-admin-sidebar]');
  var scrim = document.querySelector('[data-sidebar-scrim]');
  var sidebarOpen = document.querySelector('[data-sidebar-open]');
  var sidebarClose = document.querySelector('[data-sidebar-close]');

  if (!adminView || !A) return;

  A.rerender = renderRoute;

  /* ----------------------------------------------------------------------
     Routing
     ---------------------------------------------------------------------- */

  function parseRoute() {
    var hash = window.location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    var name = parts[0] || 'overview';
    if (name === 'galleries' && parts[1]) return { name: 'gallery', id: parts[1] };
    return { name: name, id: null };
  }

  function renderRoute() {
    if (!A.state.content) return;
    var route = parseRoute();
    var html = '';
    var title = A.ROUTE_TITLES[route.name] || 'Overview';

    switch (route.name) {
      case 'home':
        html = A.renderHome();
        break;
      case 'about':
        html = A.renderAbout();
        break;
      case 'contact':
        html = A.renderContact();
        break;
      case 'work':
        html = A.renderWork();
        break;
      case 'galleries':
        html = A.renderGalleries();
        break;
      case 'gallery':
        html = A.renderGallery(route.id);
        var gallery = (A.state.content.galleries || []).find(function (g) { return g.id === route.id; });
        title = gallery ? gallery.title : 'Gallery';
        break;
      case 'library':
        html = A.renderLibrary();
        break;
      case 'inquiries':
        html = A.renderInquiries();
        break;
      case 'settings':
        html = A.renderSettings();
        break;
      default:
        html = A.renderOverview();
        title = 'Overview';
    }

    adminView.innerHTML = html;
    if (sectionTitle) sectionTitle.textContent = title;
    document.querySelectorAll('[data-route]').forEach(function (link) {
      var linkRoute = link.getAttribute('data-route');
      var active = linkRoute === route.name || (route.name === 'gallery' && linkRoute === 'galleries');
      link.classList.toggle('is-active', active);
    });
    A.updateCounts();
    closeSidebar();
    adminView.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'auto' });
    A.state.dirty = false;
  }

  window.addEventListener('hashchange', renderRoute);

  /* ----------------------------------------------------------------------
     Sidebar (mobile)
     ---------------------------------------------------------------------- */

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('is-open');
    if (scrim) scrim.hidden = false;
    if (sidebarOpen) sidebarOpen.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    if (scrim) scrim.hidden = true;
    if (sidebarOpen) sidebarOpen.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  if (sidebarOpen) sidebarOpen.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (scrim) scrim.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeSidebar();
  });

  /* ----------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */

  function setBusy(form, busy) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    button.classList.toggle('is-loading', busy);
    if (busy) button.setAttribute('aria-busy', 'true');
    else button.removeAttribute('aria-busy');
  }

  function projectById(id) {
    return (A.state.content.projects || []).find(function (p) { return p.id === id; });
  }

  function galleryById(id) {
    return (A.state.content.galleries || []).find(function (g) { return g.id === id; });
  }

  function photoById(gallery, id) {
    return ((gallery && gallery.photos) || []).find(function (p) { return p.id === id; });
  }

  function reindexRepeater(container, prefix) {
    container.querySelectorAll('[data-repeater-row]').forEach(function (row, index) {
      row.querySelectorAll('[name]').forEach(function (input) {
        input.name = input.name.replace(new RegExp('^' + prefix + '\\.\\d+\\.'), prefix + '.' + index + '.');
      });
    });
  }

  function addRepeaterRow(prefix, fields) {
    var container = document.querySelector('[data-repeater="' + prefix + '"]');
    if (!container) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = A.repeaterRows(prefix, [{}], fields);
    container.appendChild(wrapper.firstElementChild);
    reindexRepeater(container, prefix);
    var last = container.querySelector('[data-repeater-row]:last-child input, [data-repeater-row]:last-child textarea');
    if (last) last.focus();
  }

  async function reorderProjects(ids) {
    try {
      var data = await A.api('/projects/reorder', { method: 'POST', body: JSON.stringify({ ids: ids }) });
      A.applyContent(data);
      A.markSaved('Order saved');
      renderRoute();
    } catch (error) {
      A.toast(error.message, 'error');
    }
  }

  async function reorderPhotos(galleryId, ids) {
    try {
      var data = await A.api('/galleries/' + encodeURIComponent(galleryId) + '/photos/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids: ids }),
      });
      A.applyContent(data);
      A.markSaved('Order saved');
      renderRoute();
    } catch (error) {
      A.toast(error.message, 'error');
    }
  }

  /* ----------------------------------------------------------------------
     Saving
     ---------------------------------------------------------------------- */

  async function saveForm(form) {
    var name = form.getAttribute('data-form');
    var body = A.collectForm(form);
    var method = 'PUT';
    var path = '';
    var message = 'Saved.';

    if (name === 'password') {
      if (body.newPassword !== body.confirmPassword) {
        A.toast('The new passwords do not match.', 'error');
        return;
      }
      if (String(body.newPassword || '').length < 10) {
        A.toast('Use at least 10 characters for the new password.', 'error');
        return;
      }
    }

    switch (name) {
      case 'home':
        path = '/home';
        message = 'Home page saved.';
        break;
      case 'about':
        path = '/about';
        message = 'About page saved.';
        break;
      case 'contact':
        path = '/contact';
        message = 'Contact page saved.';
        break;
      case 'site':
        path = '/site';
        message = 'Site settings saved.';
        break;
      case 'password':
        path = '/password';
        method = 'POST';
        message = 'Password changed. Signing you back in…';
        break;
      case 'project': {
        var projectId = form.getAttribute('data-id');
        path = projectId ? '/projects/' + encodeURIComponent(projectId) : '/projects';
        method = projectId ? 'PUT' : 'POST';
        message = projectId ? 'Project saved.' : 'Project created.';
        break;
      }
      case 'gallery': {
        var galleryId = form.getAttribute('data-id');
        path = galleryId ? '/galleries/' + encodeURIComponent(galleryId) : '/galleries';
        method = galleryId ? 'PUT' : 'POST';
        message = galleryId ? 'Gallery saved.' : 'Gallery created.';
        break;
      }
      case 'photo': {
        path = '/galleries/' + encodeURIComponent(form.getAttribute('data-gallery')) + '/photos/' + encodeURIComponent(form.getAttribute('data-id'));
        message = 'Photograph updated.';
        break;
      }
      case 'media-alt': {
        path = '/media/' + encodeURIComponent(form.getAttribute('data-id'));
        message = 'Alt text saved.';
        break;
      }
      default:
        return;
    }

    A.clearFormErrors(form);
    setBusy(form, true);
    try {
      var data = await A.api(path, { method: method, body: JSON.stringify(body) });
      A.applyContent(data);
      A.state.dirty = false;
      A.markSaved('Saved');
      A.toast(message);

      if (name === 'project' || name === 'gallery' || name === 'photo' || name === 'media-alt') {
        A.closeEditor();
      }

      if (name === 'gallery' && !form.getAttribute('data-id') && data.gallery) {
        window.location.hash = '#/galleries/' + data.gallery.id;
      } else if (name === 'password') {
        window.setTimeout(function () { window.location.reload(); }, 1200);
      } else {
        renderRoute();
      }
    } catch (error) {
      if (error.fields) A.showFieldErrors(form, error.fields);
      A.toast(error.message, 'error');
      setBusy(form, false);
    }
  }

  /* ----------------------------------------------------------------------
     Actions
     ---------------------------------------------------------------------- */

  async function deleteProject(id) {
    var project = projectById(id);
    if (!project) return;
    var confirmed = await A.confirm({
      title: 'Delete “' + project.title + '”?',
      message: 'The project will be removed from the site. The gallery and its photographs stay in the library.',
      confirmLabel: 'Delete project',
    });
    if (!confirmed) return;
    try {
      var data = await A.api('/projects/' + encodeURIComponent(id), { method: 'DELETE' });
      A.applyContent(data);
      A.closeEditor();
      A.toast('Project deleted.');
      renderRoute();
    } catch (error) {
      A.toast(error.message, 'error');
    }
  }

  async function deleteGallery(id) {
    var gallery = galleryById(id);
    if (!gallery) return;
    var confirmed = await A.confirm({
      title: 'Delete “' + gallery.title + '”?',
      message: 'The gallery and its photo records will be removed. The images stay in the library. Projects using this gallery must be changed first.',
      confirmLabel: 'Delete gallery',
    });
    if (!confirmed) return;
    try {
      var data = await A.api('/galleries/' + encodeURIComponent(id), { method: 'DELETE' });
      A.applyContent(data);
      A.toast('Gallery deleted.');
      if (window.location.hash === '#/galleries/' + id) window.location.hash = '#/galleries';
      else renderRoute();
    } catch (error) {
      A.toast(error.message, 'error');
    }
  }

  async function deletePhoto(galleryId, photoId) {
    var gallery = galleryById(galleryId);
    var photo = photoById(gallery, photoId);
    if (!photo) return;
    var confirmed = await A.confirm({
      title: 'Remove this photograph?',
      message: 'It will be removed from the gallery. The image file stays in the library and can be used again.',
      confirmLabel: 'Remove photograph',
    });
    if (!confirmed) return;
    try {
      var data = await A.api('/galleries/' + encodeURIComponent(galleryId) + '/photos/' + encodeURIComponent(photoId), { method: 'DELETE' });
      A.applyContent(data);
      A.toast('Photograph removed.');
      renderRoute();
    } catch (error) {
      A.toast(error.message, 'error');
    }
  }

  async function deleteMedia(id) {
    var media = A.mediaById(id);
    if (!media) return;
    var uses = A.usageFor(id);
    var confirmed = await A.confirm({
      title: 'Delete this image?',
      message: uses.length
        ? 'This image is still used in ' + uses.length + ' place' + (uses.length === 1 ? '' : 's') + '. Remove or replace those uses first.'
        : 'The image and its generated WebP files will be deleted permanently.',
      confirmLabel: 'Delete image',
      safe: uses.length > 0,
    });
    if (!confirmed) return;
    try {
      var data = await A.api('/media/' + encodeURIComponent(id), { method: 'DELETE' });
      A.applyContent(data);
      A.toast('Image deleted.');
      renderRoute();
    } catch (error) {
      var extra = error.usages && error.usages.length ? ' ' + error.usages.slice(0, 3).join('; ') : '';
      A.toast(error.message + extra, 'error');
    }
  }

  async function deleteInquiry(id) {
    var inquiry = A.state.inquiries.find(function (item) { return item.id === id; });
    if (!inquiry) return;
    var confirmed = await A.confirm({
      title: 'Delete this enquiry?',
      message: 'The note from ' + inquiry.name + ' will be permanently removed.',
      confirmLabel: 'Delete enquiry',
    });
    if (!confirmed) return;
    try {
      await A.api('/inquiries/' + encodeURIComponent(id), { method: 'DELETE' });
      A.state.inquiries = A.state.inquiries.filter(function (item) { return item.id !== id; });
      A.toast('Enquiry deleted.');
      renderRoute();
    } catch (error) {
      A.toast(error.message, 'error');
    }
  }

  async function markRead(id) {
    try {
      await A.api('/inquiries/' + encodeURIComponent(id) + '/read', { method: 'POST' });
      var inquiry = A.state.inquiries.find(function (item) { return item.id === id; });
      if (inquiry) inquiry.read = true;
      A.markSaved('Marked as read');
      renderRoute();
    } catch (error) {
      A.toast(error.message, 'error');
    }
  }

  function moveProject(id, direction) {
    var projects = A.sortByOrder(A.state.content.projects);
    var index = projects.findIndex(function (p) { return p.id === id; });
    var target = index + Number(direction);
    if (index < 0 || target < 0 || target >= projects.length) return;
    var ids = projects.map(function (p) { return p.id; });
    var moved = ids.splice(index, 1)[0];
    ids.splice(target, 0, moved);
    reorderProjects(ids);
  }

  function movePhoto(galleryId, photoId, direction) {
    var gallery = galleryById(galleryId);
    if (!gallery) return;
    var photos = A.sortByOrder(gallery.photos || []);
    var index = photos.findIndex(function (p) { return p.id === photoId; });
    var target = index + Number(direction);
    if (index < 0 || target < 0 || target >= photos.length) return;
    var ids = photos.map(function (p) { return p.id; });
    var moved = ids.splice(index, 1)[0];
    ids.splice(target, 0, moved);
    reorderPhotos(galleryId, ids);
  }

  /* ----------------------------------------------------------------------
     Click handling
     ---------------------------------------------------------------------- */

  document.addEventListener('click', function (event) {
    var actionEl = event.target.closest('[data-action]');
    var action = actionEl ? actionEl.getAttribute('data-action') : null;

    if (action) {
      var id = actionEl.getAttribute('data-id');
      var galleryId = actionEl.getAttribute('data-gallery');

      switch (action) {
        case 'close-editor':
          A.closeEditor();
          return;
        case 'new-project':
          event.preventDefault();
          A.openEditor(A.projectEditor(null));
          return;
        case 'edit-project': {
          event.preventDefault();
          var project = projectById(id);
          if (project) A.openEditor(A.projectEditor(project));
          return;
        }
        case 'delete-project':
          event.preventDefault();
          deleteProject(id);
          return;
        case 'move-project':
          event.preventDefault();
          moveProject(id, actionEl.getAttribute('data-dir'));
          return;
        case 'new-gallery':
          event.preventDefault();
          A.openEditor(A.galleryEditor(null));
          return;
        case 'edit-gallery': {
          event.preventDefault();
          var gallery = galleryById(id);
          if (gallery) A.openEditor(A.galleryEditor(gallery));
          return;
        }
        case 'delete-gallery':
          event.preventDefault();
          deleteGallery(id);
          return;
        case 'edit-photo': {
          event.preventDefault();
          var editGallery = galleryById(galleryId);
          var photo = photoById(editGallery, id);
          if (photo) A.openEditor(A.photoEditor(galleryId, photo));
          return;
        }
        case 'delete-photo':
          event.preventDefault();
          deletePhoto(galleryId, id);
          return;
        case 'replace-photo':
          event.preventDefault();
          A.requestUpload({ kind: 'replace', galleryId: galleryId, photoId: id });
          A.toast('Choose a replacement image.');
          return;
        case 'move-photo':
          event.preventDefault();
          movePhoto(galleryId, id, actionEl.getAttribute('data-dir'));
          return;
        case 'edit-media': {
          event.preventDefault();
          var media = A.mediaById(id);
          if (media) A.openEditor(A.mediaEditor(media));
          return;
        }
        case 'delete-media':
          event.preventDefault();
          deleteMedia(id);
          return;
        case 'mark-read':
          event.preventDefault();
          markRead(id);
          return;
        case 'delete-inquiry':
          event.preventDefault();
          deleteInquiry(id);
          return;
        case 'pick-image': {
          event.preventDefault();
          var field = actionEl.closest('[data-image-field]');
          var selected = field ? field.querySelector('[data-image-id]').value : '';
          A.openMediaPicker(function (chosen) {
            A.setImageField(field, chosen);
            A.state.dirty = true;
          }, selected);
          return;
        }
        case 'clear-image': {
          event.preventDefault();
          var imageField = actionEl.closest('[data-image-field]');
          A.setImageField(imageField, null);
          A.state.dirty = true;
          return;
        }
        case 'upload': {
          event.preventDefault();
          A.requestUpload({
            kind: actionEl.getAttribute('data-kind') || 'media',
            galleryId: actionEl.getAttribute('data-gallery') || null,
            photoId: actionEl.getAttribute('data-id') || null,
          });
          return;
        }
        case 'add-approach':
          event.preventDefault();
          addRepeaterRow('approach', [
            { name: 'title', label: 'Title' },
            { name: 'body', label: 'Text', textarea: true },
          ]);
          return;
        case 'add-experience':
          event.preventDefault();
          addRepeaterRow('experience', [
            { name: 'years', label: 'Years' },
            { name: 'role', label: 'Role' },
            { name: 'place', label: 'Place' },
          ]);
          return;
        case 'add-testimonial':
          event.preventDefault();
          addRepeaterRow('testimonials', [
            { name: 'quote', label: 'Quote', textarea: true },
            { name: 'names', label: 'Names' },
            { name: 'context', label: 'Context' },
          ]);
          return;
        case 'add-social':
          event.preventDefault();
          addRepeaterRow('socials', [
            { name: 'label', label: 'Label' },
            { name: 'handle', label: 'Handle' },
            { name: 'url', label: 'URL' },
          ]);
          return;
        case 'remove-row': {
          event.preventDefault();
          var row = actionEl.closest('[data-repeater-row]');
          var container = row ? row.closest('[data-repeater]') : null;
          if (row) row.remove();
          if (container) reindexRepeater(container, container.getAttribute('data-repeater'));
          A.state.dirty = true;
          return;
        }
        case 'retry-load':
          event.preventDefault();
          init();
          return;
        default:
          break;
      }
    }

    var mediaUpload = event.target.closest('[data-media-upload]');
    if (mediaUpload) {
      event.preventDefault();
      A.requestUpload({ kind: 'media', picker: true });
      return;
    }

    if (event.target.closest('[data-route]')) closeSidebar();
  });

  /* ----------------------------------------------------------------------
     Form submission
     ---------------------------------------------------------------------- */

  document.addEventListener('submit', function (event) {
    var form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();
    saveForm(form);
  });

  document.addEventListener('input', function (event) {
    var input = event.target;
    if (input.matches('[data-image-x], [data-image-y], [data-range]')) {
      var output = input.closest('.range-field') && input.closest('.range-field').querySelector('output');
      if (output) output.textContent = input.value;
    }
    if (input.closest('form[data-form]')) A.state.dirty = true;
  });

  document.addEventListener('change', function (event) {
    if (event.target.closest('form[data-form]')) A.state.dirty = true;
  });

  window.addEventListener('beforeunload', function (event) {
    if (!A.state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  /* ----------------------------------------------------------------------
     Drag and drop
     ---------------------------------------------------------------------- */

  var dragType = null;
  var dragId = null;
  var dragGallery = null;

  document.addEventListener('dragstart', function (event) {
    var projectRow = event.target.closest('.project-row[data-project-id]');
    var photoCard = event.target.closest('.photo-card[data-photo-id]');
    if (projectRow) {
      dragType = 'project';
      dragId = projectRow.getAttribute('data-project-id');
      projectRow.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', dragId);
    } else if (photoCard) {
      dragType = 'photo';
      dragId = photoCard.getAttribute('data-photo-id');
      dragGallery = photoCard.getAttribute('data-gallery-id');
      photoCard.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', dragId);
    }
  });

  document.addEventListener('dragend', function () {
    document.querySelectorAll('.is-dragging, .is-drop-target').forEach(function (el) {
      el.classList.remove('is-dragging');
      el.classList.remove('is-drop-target');
    });
    dragType = null;
    dragId = null;
    dragGallery = null;
  });

  document.addEventListener('dragover', function (event) {
    if (!dragType) return;
    var target =
      dragType === 'project'
        ? event.target.closest('.project-row[data-project-id]')
        : event.target.closest('.photo-card[data-photo-id]');
    if (!target) return;
    event.preventDefault();
    document.querySelectorAll('.is-drop-target').forEach(function (el) { el.classList.remove('is-drop-target'); });
    if (target.getAttribute(dragType === 'project' ? 'data-project-id' : 'data-photo-id') !== dragId) {
      target.classList.add('is-drop-target');
    }
  });

  document.addEventListener('drop', function (event) {
    if (!dragType) return;
    var target =
      dragType === 'project'
        ? event.target.closest('.project-row[data-project-id]')
        : event.target.closest('.photo-card[data-photo-id]');
    if (!target) return;
    event.preventDefault();

    if (dragType === 'project') {
      var targetId = target.getAttribute('data-project-id');
      if (!targetId || targetId === dragId) return;
      var projects = A.sortByOrder(A.state.content.projects);
      var ids = projects.map(function (p) { return p.id; });
      var from = ids.indexOf(dragId);
      var to = ids.indexOf(targetId);
      if (from === -1 || to === -1) return;
      ids.splice(from, 1);
      ids.splice(to, 0, dragId);
      reorderProjects(ids);
    } else {
      var photoTarget = target.getAttribute('data-photo-id');
      if (!photoTarget || photoTarget === dragId) return;
      var gallery = galleryById(dragGallery);
      if (!gallery) return;
      var photos = A.sortByOrder(gallery.photos || []);
      var photoIds = photos.map(function (p) { return p.id; });
      var photoFrom = photoIds.indexOf(dragId);
      var photoTo = photoIds.indexOf(photoTarget);
      if (photoFrom === -1 || photoTo === -1) return;
      photoIds.splice(photoFrom, 1);
      photoIds.splice(photoTo, 0, dragId);
      reorderPhotos(dragGallery, photoIds);
    }
  });

  /* ----------------------------------------------------------------------
     Upload drop zones
     ---------------------------------------------------------------------- */

  document.addEventListener('dragover', function (event) {
    var zone = event.target.closest('[data-upload-zone]');
    if (!zone) return;
    event.preventDefault();
    zone.classList.add('is-dragover');
  });

  document.addEventListener('dragleave', function (event) {
    var zone = event.target.closest('[data-upload-zone]');
    if (zone) zone.classList.remove('is-dragover');
  });

  document.addEventListener('drop', function (event) {
    var zone = event.target.closest('[data-upload-zone]');
    if (!zone || !event.dataTransfer.files.length) return;
    event.preventDefault();
    zone.classList.remove('is-dragover');
    var button = zone.querySelector('[data-action="upload"]');
    if (!button) return;
    A.startUpload(
      {
        kind: button.getAttribute('data-kind') || 'media',
        galleryId: button.getAttribute('data-gallery') || null,
      },
      event.dataTransfer.files,
    );
  });

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */

  function showError(message) {
    adminView.innerHTML =
      '<div class="admin-page">' +
        '<div class="panel"><div class="panel__body">' +
          '<p class="eyebrow">Could not open the studio</p>' +
          '<h1 class="admin-page__title" style="margin-top:.5rem">Something went wrong.</h1>' +
          '<p class="admin-page__intro">' + A.esc(message || 'The studio data could not be loaded.') + '</p>' +
          '<div style="margin-top:1.5rem"><button class="button button--ink button--small" type="button" data-action="retry-load">Try again</button></div>' +
        '</div></div>' +
      '</div>';
  }

  function init() {
    adminView.innerHTML =
      '<div class="admin-loading"><span class="spinner" aria-hidden="true"></span><p>Opening the studio…</p></div>';
    A.load()
      .then(function () {
        renderRoute();
      })
      .catch(function (error) {
        if (error && error.message === 'Session expired') return;
        showError(error && error.message);
      });
  }

  init();
})(window.AKAdmin);
