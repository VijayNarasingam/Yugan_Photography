/* Yugan Photography — studio views: shared form pieces, overview, page forms, projects */
(function (A) {
  'use strict';

  /* ----------------------------------------------------------------------
     Shared components
     ---------------------------------------------------------------------- */

  A.panel = function (title, description, body, options) {
    options = options || {};
    return (
      '<section class="panel ' + (options.className || '') + '">' +
        '<div class="panel__head">' +
          '<div><h2>' + A.esc(title) + '</h2>' + (description ? '<p>' + A.esc(description) + '</p>' : '') + '</div>' +
          (options.action || '') +
        '</div>' +
        '<div class="panel__body">' + body + '</div>' +
      '</section>'
    );
  };

  A.textField = function (label, name, value, options) {
    options = options || {};
    var id = 'field_' + (A.state.fieldSeq += 1);
    var full = options.full ? ' admin-field--full' : '';
    var hint = options.hint ? '<span>' + A.esc(options.hint) + '</span>' : '';
    var help = options.help ? '<p class="admin-field__hint">' + A.esc(options.help) + '</p>' : '';
    var control;
    if (options.textarea) {
      control =
        '<textarea id="' + id + '" name="' + A.attr(name) + '" rows="' + (options.rows || 4) + '"' +
        (options.placeholder ? ' placeholder="' + A.attr(options.placeholder) + '"' : '') + '>' +
        A.esc(value) + '</textarea>';
    } else {
      control =
        '<input id="' + id + '" type="' + (options.type || 'text') + '" name="' + A.attr(name) + '" value="' + A.attr(value) + '"' +
        (options.placeholder ? ' placeholder="' + A.attr(options.placeholder) + '"' : '') +
        (options.min !== undefined ? ' min="' + A.attr(options.min) + '"' : '') +
        (options.max !== undefined ? ' max="' + A.attr(options.max) + '"' : '') +
        (options.step !== undefined ? ' step="' + A.attr(options.step) + '"' : '') + '>';
    }
    return (
      '<div class="admin-field' + full + '">' +
        '<label for="' + id + '">' + A.esc(label) + hint + '</label>' +
        control + help +
      '</div>'
    );
  };

  A.selectField = function (label, name, value, options, fieldOptions) {
    fieldOptions = fieldOptions || {};
    var id = 'field_' + (A.state.fieldSeq += 1);
    var full = fieldOptions.full ? ' admin-field--full' : '';
    var help = fieldOptions.help ? '<p class="admin-field__hint">' + A.esc(fieldOptions.help) + '</p>' : '';
    var html = options.map(function (option) {
      var optionValue = typeof option === 'string' ? option : option.value;
      var optionLabel = typeof option === 'string' ? option : option.label;
      return '<option value="' + A.attr(optionValue) + '"' + (String(optionValue) === String(value) ? ' selected' : '') + '>' + A.esc(optionLabel) + '</option>';
    }).join('');
    return (
      '<div class="admin-field' + full + '">' +
        '<label for="' + id + '">' + A.esc(label) + '</label>' +
        '<select id="' + id + '" name="' + A.attr(name) + '">' + html + '</select>' + help +
      '</div>'
    );
  };

  A.checkboxField = function (label, name, checked) {
    return (
      '<label class="checkbox"><input type="checkbox" name="' + A.attr(name) + '"' + (checked ? ' checked' : '') + '> ' + A.esc(label) + '</label>'
    );
  };

  A.formActions = function (note, label) {
    return (
      '<div class="form-actions">' +
        '<span class="form-actions__note">' + A.esc(note || 'Changes go live immediately.') + '</span>' +
        '<div class="form-actions__buttons">' +
          '<button class="button button--ink" type="submit">' + A.esc(label || 'Save changes') + '</button>' +
        '</div>' +
      '</div>'
    );
  };

  A.pageHead = function (eyebrow, title, intro, actions) {
    return (
      '<header class="admin-page__head">' +
        '<div>' +
          '<p class="eyebrow">' + A.esc(eyebrow) + '</p>' +
          '<h1 class="admin-page__title">' + A.esc(title) + '</h1>' +
          (intro ? '<p class="admin-page__intro">' + A.esc(intro) + '</p>' : '') +
        '</div>' +
        (actions ? '<div class="admin-page__actions">' + actions + '</div>' : '') +
      '</header>'
    );
  };

  A.listLines = function (items) {
    return (items || []).join('\n');
  };

  A.repeaterRows = function (prefix, rows, fields) {
    return rows.map(function (row, index) {
      return (
        '<div class="repeater__row repeater__row--' + fields.length + '" data-repeater-row>' +
          fields.map(function (field) {
            return (
              '<label class="admin-field"><span>' + A.esc(field.label) + '</span>' +
                (field.textarea
                  ? '<textarea name="' + A.attr(prefix + '.' + index + '.' + field.name) + '" rows="2">' + A.esc(row[field.name] || '') + '</textarea>'
                  : '<input type="text" name="' + A.attr(prefix + '.' + index + '.' + field.name) + '" value="' + A.attr(row[field.name] || '') + '">') +
              '</label>'
            );
          }).join('') +
          '<button type="button" class="repeater__remove" data-action="remove-row" aria-label="Remove this row">' + A.icon('trash') + '</button>' +
        '</div>'
      );
    }).join('');
  };

  A.emptyAdmin = function (eyebrow, message, action) {
    return (
      '<div class="empty-state empty-state--admin">' +
        '<p class="eyebrow">' + A.esc(eyebrow) + '</p>' +
        '<p>' + A.esc(message) + '</p>' +
        (action || '') +
      '</div>'
    );
  };

  A.badge = function (label, kind) {
    return '<span class="badge badge--' + (kind || 'draft') + '">' + A.esc(label) + '</span>';
  };

  A.projectEditor = function (project) {
    var isNew = !project;
    var current = project || {
      title: '', slug: '', category: '', year: new Date().getFullYear(), location: '',
      summary: '', description: '', cover: null, galleryId: '', featured: false, visible: true,
    };
    var galleryOptions = [{ value: '', label: 'No gallery' }].concat(
      (A.state.content.galleries || []).map(function (gallery) {
        return { value: gallery.id, label: gallery.title + ' (' + gallery.photos.length + ')' };
      }),
    );
    return (
      '<form class="admin-dialog__form" data-form="project" data-id="' + A.attr(current.id || '') + '">' +
        '<div class="admin-dialog__head admin-dialog__head--row">' +
          '<div>' +
            '<p class="eyebrow">' + (isNew ? 'New project' : 'Edit project') + '</p>' +
            '<h2 class="admin-dialog__title">' + A.esc(isNew ? 'Add a project' : current.title) + '</h2>' +
          '</div>' +
          '<button class="icon-button" type="button" data-action="close-editor" aria-label="Close">' + A.icon('close') + '</button>' +
        '</div>' +
        '<div class="admin-dialog__body">' +
          '<div class="form-grid">' +
            A.textField('Title', 'title', current.title, { hint: 'Required' }) +
            A.textField('URL slug', 'slug', current.slug, { help: 'Leave blank to build one from the title.' }) +
            A.textField('Category', 'category', current.category, { hint: 'Required', placeholder: 'Portraits' }) +
            A.textField('Year', 'year', current.year, { type: 'number', min: 1900, max: 2100 }) +
            A.textField('Location', 'location', current.location, { placeholder: 'Jaipur, Rajasthan' }) +
            A.selectField('Gallery', 'galleryId', current.galleryId, galleryOptions, { help: 'The photographs shown on the project page.' }) +
            A.textField('Summary', 'summary', current.summary, { full: true, help: 'One line, shown under the title and on cards.' }) +
            A.textField('Description', 'description', current.description, { full: true, textarea: true, rows: 6, help: 'Separate paragraphs with a blank line.' }) +
            '<div class="admin-field admin-field--full"><span class="admin-field__label">Cover image</span>' +
              A.imageField('Cover image', 'cover', current.cover, { full: true, hint: 'Required. Used on the work index and at the top of the project.' }) +
            '</div>' +
            '<div class="admin-field admin-field--full"><span class="admin-field__label">Visibility</span><div class="checkbox-row">' +
              A.checkboxField('Visible on the public site', 'visible', current.visible) +
              A.checkboxField('Feature on the home page', 'featured', current.featured) +
            '</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-dialog__foot">' +
          (isNew ? '<p>You can add photographs after saving.</p>' : '<button class="button button--ghost" type="button" data-action="delete-project" data-id="' + A.attr(current.id) + '">Delete project</button>') +
          '<button class="button button--ghost" type="button" data-action="close-editor">Cancel</button>' +
          '<button class="button button--ink" type="submit">' + (isNew ? 'Create project' : 'Save project') + '</button>' +
        '</div>' +
      '</form>'
    );
  };

  /* ----------------------------------------------------------------------
     Overview
     ---------------------------------------------------------------------- */

  A.renderOverview = function () {
    var stats = A.computeStats();
    var recent = A.state.inquiries.slice(0, 3);
    var recentHtml = recent.length
      ? recent.map(function (inquiry) {
          return (
            '<a class="overview-inquiry" href="#/inquiries">' +
              '<span class="overview-inquiry__dot' + (inquiry.read ? '' : ' is-unread') + '"></span>' +
              '<span class="overview-inquiry__main">' +
                '<strong>' + A.esc(inquiry.name) + '</strong>' +
                '<span>' + A.esc(inquiry.projectType || 'General enquiry') + '</span>' +
              '</span>' +
              '<span class="overview-inquiry__time">' + A.esc(A.formatDate(inquiry.createdAt)) + '</span>' +
            '</a>'
          );
        }).join('')
      : A.emptyAdmin('Inbox empty', 'New enquiries from the contact form will appear here.');

    return (
      '<div class="admin-page">' +
        A.pageHead(
          'Studio overview',
          'Good to see you.',
          'Everything on the site is edited here. Changes are saved to the live content immediately.',
          '<a class="button button--outline button--small" href="/" target="_blank" rel="noopener">' + A.icon('eye') + ' View live site</a>',
        ) +
        '<div class="stat-grid">' +
          '<a class="stat-card" href="#/work"><span class="stat-card__label">Projects</span><strong class="stat-card__value">' + stats.projects + '</strong><span class="stat-card__meta">' + stats.visibleProjects + ' visible publicly</span></a>' +
          '<a class="stat-card" href="#/galleries"><span class="stat-card__label">Galleries</span><strong class="stat-card__value">' + stats.galleries + '</strong><span class="stat-card__meta">' + stats.photos + ' photographs</span></a>' +
          '<a class="stat-card" href="#/library"><span class="stat-card__label">Image library</span><strong class="stat-card__value">' + stats.media + '</strong><span class="stat-card__meta">Optimised WebP files</span></a>' +
          '<a class="stat-card" href="#/inquiries"><span class="stat-card__label">Unread enquiries</span><strong class="stat-card__value">' + stats.unreadInquiries + '</strong><span class="stat-card__meta">Replies within two days</span></a>' +
        '</div>' +
        '<div class="admin-grid-2">' +
          A.panel('Recent enquiries', 'The latest notes from the contact form.', recentHtml, {
            action: '<a class="panel__link" href="#/inquiries">All enquiries</a>',
          }) +
          '<div class="stack">' +
            A.panel('Quick actions', 'Common studio tasks.', 
              '<div class="quick-actions">' +
                '<button type="button" class="quick-action" data-action="new-project"><span>' + A.icon('plus') + '</span><strong>New project</strong><small>Add a series to the work index</small></button>' +
                '<button type="button" class="quick-action" data-action="new-gallery"><span>' + A.icon('image') + '</span><strong>New gallery</strong><small>Group photographs for a project</small></button>' +
                '<a class="quick-action" href="#/home"><span>' + A.icon('grid') + '</span><strong>Home page</strong><small>Hero, introduction, quote</small></a>' +
                '<a class="quick-action" href="#/settings"><span>' + A.icon('settings') + '</span><strong>Site settings</strong><small>Identity, socials, password</small></a>' +
              '</div>'
            ) +
            A.panel('Backup', 'Download a JSON copy of all written content.',
              '<p class="panel__note">Photographs live in <code>/public</code> and are not included in this file. Keep a copy of the uploads folder alongside it.</p>' +
              '<a class="button button--outline button--small" href="/api/admin/backup">' + A.icon('archive') + ' Download backup</a>'
            ) +
          '</div>' +
        '</div>' +
      '</div>'
    );
  };

  /* ----------------------------------------------------------------------
     Home page form
     ---------------------------------------------------------------------- */

  A.renderHome = function () {
    var home = A.state.content.home;
    return (
      '<div class="admin-page">' +
        A.pageHead('Home page', 'The first impression.', 'The hero fills the screen. The introduction and featured projects follow.', '') +
        '<form class="admin-form" data-form="home">' +
          A.panel('Hero', 'Full-screen opening image and statement.',
            '<div class="form-grid">' +
              A.textField('Eyebrow', 'hero.eyebrow', home.hero.eyebrow, { full: true, placeholder: 'Jaipur · Wedding Photography' }) +
              A.textField('Title', 'hero.title', home.hero.title, { hint: 'Shown at display size' }) +
              A.textField('Link label', 'hero.ctaLabel', home.hero.ctaLabel) +
              A.textField('Statement', 'hero.statement', home.hero.statement, { full: true, textarea: true, rows: 2 }) +
              '<div class="admin-field admin-field--full"><span class="admin-field__label">Hero image</span>' + A.imageField('Hero image', 'hero.image', home.hero.image, { hint: 'A wide, quiet image works best. It is cropped to fill the viewport.' }) + '</div>' +
            '</div>'
          ) +
          A.panel('Introduction', 'A short statement beneath the hero.',
            '<div class="form-grid">' +
              A.textField('Eyebrow', 'intro.kicker', home.intro.kicker, { full: true }) +
              A.textField('Title', 'intro.title', home.intro.title, { full: true }) +
              A.textField('Text', 'intro.body', home.intro.body, { full: true, textarea: true, rows: 5 }) +
              '<div class="admin-field admin-field--full"><span class="admin-field__label">Image</span>' + A.imageField('Introduction image', 'intro.image', home.intro.image, { hint: 'Shown beside the text on desktop.' }) + '</div>' +
            '</div>'
          ) +
          A.panel('Pull quote', 'The large statement on the dark band.',
            '<div class="form-grid">' +
              A.textField('Quote', 'quote.text', home.quote.text, { full: true, textarea: true, rows: 3 }) +
              A.textField('Attribution', 'quote.attribution', home.quote.attribution, { full: true }) +
            '</div>'
          ) +
          A.panel('Contact panel', 'The split image and invitation near the foot of the page.',
            '<div class="form-grid">' +
              A.textField('Title', 'cta.title', home.cta.title, { full: true }) +
              A.textField('Text', 'cta.body', home.cta.body, { full: true, textarea: true, rows: 3 }) +
              A.textField('Link label', 'cta.linkLabel', home.cta.linkLabel, { full: true }) +
              '<div class="admin-field admin-field--full"><span class="admin-field__label">Image</span>' + A.imageField('Contact panel image', 'cta.image', home.cta.image) + '</div>' +
            '</div>'
          ) +
          A.formActions('Saving updates the public home page immediately.', 'Save home page') +
        '</form>' +
      '</div>'
    );
  };

  /* ----------------------------------------------------------------------
     About form
     ---------------------------------------------------------------------- */

  A.renderAbout = function () {
    var about = A.state.content.about;
    return (
      '<div class="admin-page">' +
        A.pageHead('About page', 'The studio, in words.', 'Biography, approach, experience, and the lists of clients and recognition.', '') +
        '<form class="admin-form" data-form="about">' +
          A.panel('Introduction', 'The opening statement and portrait.',
            '<div class="form-grid">' +
              A.textField('Eyebrow', 'kicker', about.kicker, { full: true }) +
              A.textField('Title', 'title', about.title, { full: true }) +
              A.textField('Lead', 'lead', about.lead, { full: true, textarea: true, rows: 4 }) +
              '<div class="admin-field admin-field--full"><span class="admin-field__label">Portrait</span>' + A.imageField('Portrait', 'portrait', about.portrait, { hint: 'A vertical portrait, ideally 4:5.' }) + '</div>' +
            '</div>'
          ) +
          A.panel('Biography', 'The long-form story. Separate paragraphs with a blank line.',
            A.textField('Biography', 'bio', A.listLines(about.bio), { full: true, textarea: true, rows: 10, help: 'Each blank line starts a new paragraph.' })
          ) +
          A.panel('Approach', 'Three principles shown in a row.',
            '<div class="repeater" data-repeater="approach">' +
              A.repeaterRows('approach', about.approach, [
                { name: 'title', label: 'Title' },
                { name: 'body', label: 'Text', textarea: true },
              ]) +
            '</div>' +
            '<button class="button button--outline button--small repeater__add" type="button" data-action="add-approach">' + A.icon('plus') + ' Add principle</button>'
          ) +
          A.panel('Experience', 'A short CV, most recent first.',
            '<div class="repeater" data-repeater="experience">' +
              A.repeaterRows('experience', about.experience, [
                { name: 'years', label: 'Years' },
                { name: 'role', label: 'Role' },
                { name: 'place', label: 'Place' },
              ]) +
            '</div>' +
            '<button class="button button--outline button--small repeater__add" type="button" data-action="add-experience">' + A.icon('plus') + ' Add role</button>'
          ) +
          A.panel('Clients & recognition', 'One item per line.',
            '<div class="form-grid">' +
              A.textField('Clients', 'highlights.clients', A.listLines(about.highlights.clients), { textarea: true, rows: 6 }) +
              A.textField('Publications', 'highlights.publications', A.listLines(about.highlights.publications), { textarea: true, rows: 6 }) +
              A.textField('Awards', 'highlights.awards', A.listLines(about.highlights.awards), { textarea: true, rows: 5 }) +
              A.textField('Services', 'highlights.services', A.listLines(about.highlights.services), { textarea: true, rows: 5 }) +
            '</div>'
          ) +
          A.formActions('Saving updates the public about page immediately.', 'Save about page') +
        '</form>' +
      '</div>'
    );
  };

  /* ----------------------------------------------------------------------
     Contact page form
     ---------------------------------------------------------------------- */

  A.renderContact = function () {
    var contact = A.state.content.contact;
    return (
      '<div class="admin-page">' +
        A.pageHead('Contact page', 'An invitation to write.', 'The page image, wording, and the project types offered in the enquiry form.', '') +
        '<form class="admin-form" data-form="contact">' +
          A.panel('Contact page', 'Wording and image.',
            '<div class="form-grid">' +
              A.textField('Eyebrow', 'kicker', contact.kicker, { full: true }) +
              A.textField('Title', 'title', contact.title, { full: true }) +
              A.textField('Invitation', 'invitation', contact.invitation, { full: true, textarea: true, rows: 4 }) +
              A.textField('Form note', 'formNote', contact.formNote, { full: true }) +
              '<div class="admin-field admin-field--full"><span class="admin-field__label">Page image</span>' + A.imageField('Contact image', 'image', contact.image, { hint: 'Shown beside the form on desktop.' }) + '</div>' +
              A.textField('Project types', 'projectTypes', A.listLines(contact.projectTypes), { full: true, textarea: true, rows: 6, help: 'One option per line. These appear in the enquiry form.' }) +
            '</div>'
          ) +
          A.formActions('Saving updates the public contact page immediately.', 'Save contact page') +
        '</form>' +
      '</div>'
    );
  };

  /* ----------------------------------------------------------------------
     Projects list
     ---------------------------------------------------------------------- */

  A.renderWork = function () {
    var projects = A.sortByOrder(A.state.content.projects);
    var rows = projects.map(function (project, index) {
      var gallery = (A.state.content.galleries || []).find(function (g) { return g.id === project.galleryId; });
      var thumb = A.mediaById(project.cover && project.cover.mediaId);
      return (
        '<article class="project-row" draggable="true" data-project-id="' + A.attr(project.id) + '">' +
          '<span class="drag-handle" aria-hidden="true">' + A.icon('drag') + '</span>' +
          '<div class="project-row__thumb">' + (thumb ? '<img src="' + A.attr(A.mediaThumb(thumb)) + '" alt="" loading="lazy">' : '') + '</div>' +
          '<div class="project-row__main">' +
            '<h3 class="project-row__title">' + A.esc(project.title) + '</h3>' +
            '<p class="project-row__meta">' + A.esc(project.category) + ' · ' + A.esc(project.year) + (gallery ? ' · ' + gallery.photos.length + ' photographs' : ' · no gallery') + '</p>' +
          '</div>' +
          '<div class="project-row__badges">' +
            (project.featured ? A.badge('Featured', 'featured') : '') +
            A.badge(project.visible ? 'Live' : 'Hidden', project.visible ? 'live' : 'draft') +
          '</div>' +
          '<div class="row-actions">' +
            '<button class="icon-button" type="button" data-action="move-project" data-id="' + A.attr(project.id) + '" data-dir="-1" aria-label="Move ' + A.attr(project.title) + ' up"' + (index === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button class="icon-button" type="button" data-action="move-project" data-id="' + A.attr(project.id) + '" data-dir="1" aria-label="Move ' + A.attr(project.title) + ' down"' + (index === projects.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button class="icon-button" type="button" data-action="edit-project" data-id="' + A.attr(project.id) + '" aria-label="Edit ' + A.attr(project.title) + '">' + A.icon('edit') + '</button>' +
            '<button class="icon-button icon-button--danger" type="button" data-action="delete-project" data-id="' + A.attr(project.id) + '" aria-label="Delete ' + A.attr(project.title) + '">' + A.icon('trash') + '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    return (
      '<div class="admin-page">' +
        A.pageHead('Projects', 'The work index.', 'Drag to reorder, or use the arrow buttons. Hidden projects stay in the studio but leave the public site.', 
          '<button class="button button--ink button--small" type="button" data-action="new-project">' + A.icon('plus') + ' New project</button>'
        ) +
        '<div class="list-toolbar"><p>' + projects.length + (projects.length === 1 ? ' project' : ' projects') + ' · drag rows to set the public order</p></div>' +
        (projects.length ? '<div class="project-list" data-project-list>' + rows + '</div>' : A.emptyAdmin('No projects yet', 'Create the first project to begin the work index.', '<button class="button button--outline button--small" type="button" data-action="new-project">Create a project</button>')) +
      '</div>'
    );
  };

  /* ----------------------------------------------------------------------
     Settings
     ---------------------------------------------------------------------- */

  A.renderSettings = function () {
    var site = A.state.content.site;
    var socials = site.socials || [];
    return (
      '<div class="admin-page">' +
        A.pageHead('Site settings', 'The studio details.', 'Identity, contact details, social links, password, and backup.', '') +
        '<form class="admin-form" data-form="site">' +
          A.panel('Studio identity', 'Used in the header, footer, metadata, and structured data.',
            '<div class="form-grid">' +
              A.textField('Studio name', 'name', site.name) +
              A.textField('Role', 'role', site.role) +
              A.textField('Location', 'location', site.location) +
              A.textField('Availability', 'availability', site.availability) +
              A.textField('Email', 'email', site.email, { type: 'email' }) +
              A.textField('Telephone', 'phone', site.phone, { type: 'tel' }) +
              A.textField('Footer note', 'footerNote', site.footerNote, { full: true }) +
              A.textField('Meta description', 'metaDescription', site.metaDescription, { full: true, textarea: true, rows: 3, help: 'Around 150–160 characters works best in search results.' }) +
            '</div>'
          ) +
          A.panel('Social links', 'Shown in the footer, mobile menu, and contact page.',
            '<div class="repeater" data-repeater="socials">' +
              socials.map(function (social, index) {
                return (
                  '<div class="repeater__row repeater__row--social" data-repeater-row>' +
                    '<label class="admin-field"><span>Label</span><input type="text" name="socials.' + index + '.label" value="' + A.attr(social.label) + '"></label>' +
                    '<label class="admin-field"><span>Handle</span><input type="text" name="socials.' + index + '.handle" value="' + A.attr(social.handle) + '"></label>' +
                    '<label class="admin-field"><span>URL</span><input type="url" name="socials.' + index + '.url" value="' + A.attr(social.url) + '"></label>' +
                    '<button type="button" class="repeater__remove" data-action="remove-row" aria-label="Remove this social link">' + A.icon('trash') + '</button>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
            '<button class="button button--outline button--small repeater__add" type="button" data-action="add-social">' + A.icon('plus') + ' Add social link</button>'
          ) +
          A.formActions('Saving updates the public site immediately.', 'Save settings') +
        '</form>' +

        '<div class="admin-grid-2" style="margin-top:1.25rem">' +
          '<form class="admin-form" data-form="password">' +
            A.panel('Password', 'Use at least 10 characters. You will stay signed in after changing it.',
              '<div class="form-grid">' +
                A.textField('Current password', 'currentPassword', '', { type: 'password', full: true }) +
                A.textField('New password', 'newPassword', '', { type: 'password', full: true }) +
                A.textField('Confirm new password', 'confirmPassword', '', { type: 'password', full: true }) +
              '</div>' +
              '<div style="margin-top:1.25rem">' + A.formActions('The password is hashed; it is never stored in plain text.', 'Change password') + '</div>'
            ) +
          '</form>' +
          A.panel('Backup & export', 'Download the written content as JSON.',
            '<p class="panel__note">The export contains every page, project, gallery record, image reference, and enquiry. Uploaded files remain in <code>/public/uploads</code>; the seeded photography remains in <code>/public/images/media</code>.</p>' +
            '<div style="margin-top:1.25rem"><a class="button button--outline" href="/api/admin/backup">' + A.icon('archive') + ' Download content backup</a></div>' +
            '<p class="panel__note" style="margin-top:1.25rem">For a complete backup, copy <code>data/</code> and <code>public/uploads/</code> to a safe place.</p>'
          ) +
        '</div>' +
      '</div>'
    );
  };
})(window.AKAdmin);
