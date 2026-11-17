/* Yugan Photography — studio views: galleries, library, enquiries */
(function (A) {
  'use strict';

  /* ----------------------------------------------------------------------
     Galleries list
     ---------------------------------------------------------------------- */

  A.renderGalleries = function () {
    var galleries = A.state.content.galleries || [];
    var rows = galleries.map(function (gallery) {
      var first = (gallery.photos || [])[0];
      var media = first ? A.mediaById(first.mediaId) : null;
      var projects = (A.state.content.projects || []).filter(function (p) { return p.galleryId === gallery.id; });
      return (
        '<article class="project-row gallery-row" data-gallery-id="' + A.attr(gallery.id) + '">' +
          '<div class="project-row__thumb">' + (media ? '<img src="' + A.attr(A.mediaThumb(media)) + '" alt="" loading="lazy">' : '') + '</div>' +
          '<div class="project-row__main">' +
            '<h3 class="project-row__title">' + A.esc(gallery.title) + '</h3>' +
            '<p class="project-row__meta">' + (gallery.photos || []).length + ' photographs' + (projects.length ? ' · ' + projects.map(function (p) { return p.title; }).join(', ') : ' · not linked to a project') + '</p>' +
          '</div>' +
          '<div class="project-row__badges">' + A.badge((gallery.photos || []).length ? 'Gallery' : 'Empty', (gallery.photos || []).length ? 'live' : 'draft') + '</div>' +
          '<div class="row-actions">' +
            '<a class="icon-button" href="#/galleries/' + A.attr(gallery.id) + '" aria-label="Open ' + A.attr(gallery.title) + '">' + A.icon('eye') + '</a>' +
            '<button class="icon-button" type="button" data-action="edit-gallery" data-id="' + A.attr(gallery.id) + '" aria-label="Edit gallery details">' + A.icon('edit') + '</button>' +
            '<button class="icon-button icon-button--danger" type="button" data-action="delete-gallery" data-id="' + A.attr(gallery.id) + '" aria-label="Delete gallery">' + A.icon('trash') + '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    return (
      '<div class="admin-page">' +
        A.pageHead('Galleries', 'Groups of photographs.', 'A gallery holds the images for a project. Create a gallery, upload photographs, then attach it to a project.', 
          '<button class="button button--ink button--small" type="button" data-action="new-gallery">' + A.icon('plus') + ' New gallery</button>'
        ) +
        '<div class="list-toolbar"><p>' + galleries.length + (galleries.length === 1 ? ' gallery' : ' galleries') + '</p></div>' +
        (galleries.length ? '<div class="gallery-list">' + rows + '</div>' : A.emptyAdmin('No galleries yet', 'Create a gallery, then add photographs to it.', '<button class="button button--outline button--small" type="button" data-action="new-gallery">Create a gallery</button>')) +
      '</div>'
    );
  };

  /* ----------------------------------------------------------------------
     Gallery detail
     ---------------------------------------------------------------------- */

  A.renderGallery = function (galleryId) {
    var gallery = (A.state.content.galleries || []).find(function (g) { return g.id === galleryId; });
    if (!gallery) {
      return (
        '<div class="admin-page">' +
          A.pageHead('Gallery', 'Gallery not found.', 'It may have been removed in another tab.', '<a class="button button--outline button--small" href="#/galleries">All galleries</a>') +
        '</div>'
      );
    }
    var photos = A.sortByOrder(gallery.photos || []);
    var projects = (A.state.content.projects || []).filter(function (p) { return p.galleryId === gallery.id; });

    var cards = photos.map(function (photo, index) {
      var media = A.mediaById(photo.mediaId);
      return (
        '<figure class="photo-card" draggable="true" data-photo-id="' + A.attr(photo.id) + '" data-gallery-id="' + A.attr(gallery.id) + '">' +
          '<div class="photo-card__media">' +
            (media ? '<img src="' + A.attr(A.mediaThumb(media)) + '" alt="' + A.attr(photo.alt) + '" loading="lazy">' : '') +
            '<span class="photo-card__order">' + String(index + 1).padStart(2, '0') + '</span>' +
            '<span class="photo-card__grip" aria-hidden="true">' + A.icon('drag') + '</span>' +
          '</div>' +
          '<div class="photo-card__body">' +
            '<p class="photo-card__caption">' + A.esc(photo.caption || photo.alt || 'Untitled') + '</p>' +
            '<p class="photo-card__meta">' + A.esc(photo.ratio === 'natural' ? 'Original ratio' : photo.ratio) + (photo.alt ? ' · alt set' : ' · no alt text') + '</p>' +
          '</div>' +
          '<div class="photo-card__actions">' +
            '<button class="icon-button" type="button" data-action="move-photo" data-gallery="' + A.attr(gallery.id) + '" data-id="' + A.attr(photo.id) + '" data-dir="-1" aria-label="Move photograph up"' + (index === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button class="icon-button" type="button" data-action="move-photo" data-gallery="' + A.attr(gallery.id) + '" data-id="' + A.attr(photo.id) + '" data-dir="1" aria-label="Move photograph down"' + (index === photos.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button class="icon-button" type="button" data-action="edit-photo" data-gallery="' + A.attr(gallery.id) + '" data-id="' + A.attr(photo.id) + '" aria-label="Edit photograph details">' + A.icon('edit') + '</button>' +
            '<button class="icon-button" type="button" data-action="replace-photo" data-gallery="' + A.attr(gallery.id) + '" data-id="' + A.attr(photo.id) + '" aria-label="Replace photograph">' + A.icon('refresh') + '</button>' +
            '<button class="icon-button icon-button--danger" type="button" data-action="delete-photo" data-gallery="' + A.attr(gallery.id) + '" data-id="' + A.attr(photo.id) + '" aria-label="Remove photograph">' + A.icon('trash') + '</button>' +
          '</div>' +
        '</figure>'
      );
    }).join('');

    return (
      '<div class="admin-page">' +
        '<a class="back-link" href="#/galleries" style="margin-bottom:1rem">' + A.icon('arrowLeft') + ' All galleries</a>' +
        '<div class="gallery-head">' +
          '<div>' +
            '<p class="eyebrow">Gallery</p>' +
            '<h1 class="gallery-head__title">' + A.esc(gallery.title) + '</h1>' +
            '<p class="gallery-head__meta">' + photos.length + (photos.length === 1 ? ' photograph' : ' photographs') + (projects.length ? ' · used by ' + projects.map(function (p) { return p.title; }).join(', ') : ' · not linked to a project') + '</p>' +
          '</div>' +
          '<div class="gallery-head__actions">' +
            '<button class="button button--outline button--small" type="button" data-action="edit-gallery" data-id="' + A.attr(gallery.id) + '">' + A.icon('edit') + ' Edit details</button>' +
            '<button class="button button--outline button--small" type="button" data-action="delete-gallery" data-id="' + A.attr(gallery.id) + '">' + A.icon('trash') + ' Delete</button>' +
          '</div>' +
        '</div>' +

        A.panel('Photographs', 'Drag to reorder. The first photograph is used as the gallery thumbnail.',
          '<div class="upload-zone" data-upload-zone>' +
            '<span class="upload-zone__icon">' + A.icon('upload') + '</span>' +
            '<p class="upload-zone__title">Drop photographs here</p>' +
            '<p class="upload-zone__hint">JPEG, PNG, WebP, or AVIF · up to 30 MB each · 20 at a time</p>' +
            '<button class="button button--outline button--small" type="button" data-action="upload" data-kind="gallery" data-gallery="' + A.attr(gallery.id) + '">Choose files</button>' +
          '</div>' +
          (photos.length
            ? '<div class="photo-grid" data-photo-grid data-gallery="' + A.attr(gallery.id) + '">' + cards + '</div>'
            : A.emptyAdmin('No photographs yet', 'Upload the first images for this gallery. They are converted to WebP automatically.'))
        ) +
      '</div>'
    );
  };

  A.galleryEditor = function (gallery) {
    var isNew = !gallery;
    var current = gallery || { title: '', slug: '', description: '' };
    return (
      '<form class="admin-dialog__form" data-form="gallery" data-id="' + A.attr(current.id || '') + '">' +
        '<div class="admin-dialog__head admin-dialog__head--row">' +
          '<div><p class="eyebrow">' + (isNew ? 'New gallery' : 'Gallery details') + '</p><h2 class="admin-dialog__title">' + A.esc(isNew ? 'Create a gallery' : current.title) + '</h2></div>' +
          '<button class="icon-button" type="button" data-action="close-editor" aria-label="Close">' + A.icon('close') + '</button>' +
        '</div>' +
        '<div class="admin-dialog__body">' +
          '<div class="form-grid">' +
            A.textField('Title', 'title', current.title, { full: true, hint: 'Required' }) +
            A.textField('URL slug', 'slug', current.slug, { full: true, help: 'Leave blank to build one from the title.' }) +
            A.textField('Description', 'description', current.description, { full: true, textarea: true, rows: 4 }) +
          '</div>' +
        '</div>' +
        '<div class="admin-dialog__foot">' +
          '<button class="button button--ghost" type="button" data-action="close-editor">Cancel</button>' +
          '<button class="button button--ink" type="submit">' + (isNew ? 'Create gallery' : 'Save gallery') + '</button>' +
        '</div>' +
      '</form>'
    );
  };

  A.photoEditor = function (galleryId, photo) {
    var media = A.mediaById(photo.mediaId);
    return (
      '<form class="admin-dialog__form" data-form="photo" data-gallery="' + A.attr(galleryId) + '" data-id="' + A.attr(photo.id) + '">' +
        '<div class="admin-dialog__head admin-dialog__head--row">' +
          '<div><p class="eyebrow">Photograph</p><h2 class="admin-dialog__title">Edit details</h2></div>' +
          '<button class="icon-button" type="button" data-action="close-editor" aria-label="Close">' + A.icon('close') + '</button>' +
        '</div>' +
        '<div class="admin-dialog__body">' +
          '<div class="photo-editor">' +
            '<div class="photo-editor__preview">' + (media ? '<img src="' + A.attr(A.mediaThumb(media)) + '" alt="">' : '') + '</div>' +
            '<div class="form-grid">' +
              A.textField('Alt text', 'alt', photo.alt, { full: true, textarea: true, rows: 3, help: 'Describe the photograph for screen readers and search engines.' }) +
              A.textField('Caption', 'caption', photo.caption, { full: true, help: 'Optional. Shown beneath the photograph on the project page.' }) +
              A.selectField('Display ratio', 'ratio', photo.ratio, A.RATIOS, { full: true, help: 'Original ratio keeps the photograph as uploaded.' }) +
              '<div class="admin-field"><label>Focus X</label><div class="range-field"><input type="range" min="0" max="100" step="1" name="focalX" value="' + A.attr(photo.focalX) + '" data-range><output>' + Math.round(photo.focalX) + '</output></div></div>' +
              '<div class="admin-field"><label>Focus Y</label><div class="range-field"><input type="range" min="0" max="100" step="1" name="focalY" value="' + A.attr(photo.focalY) + '" data-range><output>' + Math.round(photo.focalY) + '</output></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-dialog__foot">' +
          '<p>Need a different file? Use Replace on the gallery grid.</p>' +
          '<button class="button button--ghost" type="button" data-action="close-editor">Cancel</button>' +
          '<button class="button button--ink" type="submit">Save photograph</button>' +
        '</div>' +
      '</form>'
    );
  };

  /* ----------------------------------------------------------------------
     Library
     ---------------------------------------------------------------------- */

  A.renderLibrary = function () {
    var media = A.state.media;
    var cards = media.map(function (item) {
      var uses = A.usageFor(item.id);
      return (
        '<figure class="library-card" data-media-card="' + A.attr(item.id) + '">' +
          '<div class="library-card__media"><img src="' + A.attr(A.mediaThumb(item)) + '" alt="" loading="lazy"></div>' +
          '<div class="library-card__body">' +
            '<p class="library-card__name" title="' + A.attr(item.filename) + '">' + A.esc(item.filename || 'Photograph') + '</p>' +
            '<p class="library-card__alt">' + A.esc(item.alt || 'No alt text yet.') + '</p>' +
            '<div class="library-card__foot">' +
              '<span class="library-card__usage">' + (uses.length ? 'Used ' + uses.length + '×' : 'Unused') + '</span>' +
              '<span class="library-card__actions">' +
                '<button class="icon-button" type="button" data-action="edit-media" data-id="' + A.attr(item.id) + '" aria-label="Edit alt text">' + A.icon('edit') + '</button>' +
                '<button class="icon-button icon-button--danger" type="button" data-action="delete-media" data-id="' + A.attr(item.id) + '" aria-label="Delete image"' + (uses.length ? ' title="This image is in use"' : '') + '>' + A.icon('trash') + '</button>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</figure>'
      );
    }).join('');

    return (
      '<div class="admin-page">' +
        A.pageHead('Image library', 'Every photograph in one place.', 'Images uploaded here can be used anywhere on the site. The library also contains the seeded portfolio photography.', 
          '<button class="button button--ink button--small" type="button" data-action="upload" data-kind="media">' + A.icon('upload') + ' Upload images</button>'
        ) +
        '<div class="upload-zone" data-upload-zone>' +
          '<span class="upload-zone__icon">' + A.icon('upload') + '</span>' +
          '<p class="upload-zone__title">Drop images here</p>' +
          '<p class="upload-zone__hint">JPEG, PNG, WebP, or AVIF · up to 30 MB each · converted to WebP at five sizes</p>' +
          '<button class="button button--outline button--small" type="button" data-action="upload" data-kind="media">Choose files</button>' +
        '</div>' +
        '<div class="list-toolbar"><p>' + media.length + (media.length === 1 ? ' image' : ' images') + ' · newest first</p></div>' +
        (media.length ? '<div class="library-grid">' + cards + '</div>' : A.emptyAdmin('No images yet', 'Upload a photograph to start the library.')) +
      '</div>'
    );
  };

  A.mediaEditor = function (media) {
    return (
      '<form class="admin-dialog__form" data-form="media-alt" data-id="' + A.attr(media.id) + '">' +
        '<div class="admin-dialog__head admin-dialog__head--row">' +
          '<div><p class="eyebrow">Image details</p><h2 class="admin-dialog__title">Alt text</h2></div>' +
          '<button class="icon-button" type="button" data-action="close-editor" aria-label="Close">' + A.icon('close') + '</button>' +
        '</div>' +
        '<div class="admin-dialog__body">' +
          '<div class="photo-editor">' +
            '<div class="photo-editor__preview"><img src="' + A.attr(A.mediaThumb(media)) + '" alt=""></div>' +
            '<div class="form-grid">' +
              A.textField('Alt text', 'alt', media.alt, { full: true, textarea: true, rows: 4, help: 'A short description of what is visible. Leave empty only for decorative images.' }) +
            '</div>' +
          '</div>' +
          '<p class="panel__note" style="margin-top:1rem">' + A.esc(media.filename || '') + ' · ' + (media.width || '?') + ' × ' + (media.height || '?') + ' px</p>' +
        '</div>' +
        '<div class="admin-dialog__foot">' +
          '<button class="button button--ghost" type="button" data-action="close-editor">Cancel</button>' +
          '<button class="button button--ink" type="submit">Save alt text</button>' +
        '</div>' +
      '</form>'
    );
  };

  /* ----------------------------------------------------------------------
     Enquiries
     ---------------------------------------------------------------------- */

  A.renderInquiries = function () {
    var inquiries = A.state.inquiries;
    var unread = inquiries.filter(function (item) { return !item.read; }).length;
    var cards = inquiries.map(function (inquiry) {
      return (
        '<article class="inquiry-card' + (inquiry.read ? '' : ' is-unread') + '" data-inquiry-id="' + A.attr(inquiry.id) + '">' +
          '<div class="inquiry-card__head">' +
            '<div>' +
              '<h3 class="inquiry-card__name">' + A.esc(inquiry.name) + (inquiry.read ? '' : ' ' + A.badge('New', 'unread')) + '</h3>' +
              '<a class="inquiry-card__email" href="mailto:' + A.attr(inquiry.email) + '">' + A.esc(inquiry.email) + '</a>' +
            '</div>' +
            '<time class="inquiry-card__time" datetime="' + A.attr(inquiry.createdAt) + '">' + A.esc(A.formatDateTime(inquiry.createdAt)) + '</time>' +
          '</div>' +
          (inquiry.projectType ? '<p class="inquiry-card__type">' + A.esc(inquiry.projectType) + '</p>' : '') +
          '<p class="inquiry-card__message">' + A.esc(inquiry.message) + '</p>' +
          '<div class="inquiry-card__actions">' +
            '<a class="link-button" href="mailto:' + A.attr(inquiry.email) + '?subject=' + encodeURIComponent('Re: your note to Yugan Photography') + '">Reply by email</a>' +
            (inquiry.read ? '' : '<button class="link-button" type="button" data-action="mark-read" data-id="' + A.attr(inquiry.id) + '">Mark as read</button>') +
            '<button class="link-button link-button--danger" type="button" data-action="delete-inquiry" data-id="' + A.attr(inquiry.id) + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    return (
      '<div class="admin-page">' +
        A.pageHead('Enquiries', 'Notes from the site.', unread ? unread + (unread === 1 ? ' unread enquiry.' : ' unread enquiries.') : 'You are up to date.', '') +
        '<div class="list-toolbar"><p>' + inquiries.length + (inquiries.length === 1 ? ' enquiry' : ' enquiries') + ' in total</p></div>' +
        (inquiries.length ? '<div class="inquiry-list">' + cards + '</div>' : A.emptyAdmin('No enquiries yet', 'Messages sent through the contact form will appear here.')) +
      '</div>'
    );
  };
})(window.AKAdmin);
