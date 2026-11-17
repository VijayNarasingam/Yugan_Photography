import express from 'express';
import {
  changePassword,
  requireAuthApi,
  requireCsrf,
  requireSameOrigin,
  rotateCsrfCookie,
  setSessionCookie,
} from '../auth.js';
import { contentStore, inquiryStore } from '../store.js';
import {
  deleteMediaFiles,
  photoUpload,
  processUploads,
} from '../uploads.js';
import {
  findMedia,
  imageUsage,
  mediaUsageCount,
} from '../media.js';
import {
  aboutPayload,
  contactDetailsPayload,
  contactPayload,
  galleryPayload,
  homePayload,
  photoPayload,
  projectPayload,
  sitePayload,
  text,
  ValidationError,
} from '../validate.js';
import { randomId } from '../util.js';

export const adminApiRoutes = express.Router();

adminApiRoutes.use(requireSameOrigin, requireAuthApi, requireCsrf);

function content() {
  return contentStore.get();
}

function respond(res, extra = {}, status = 200) {
  return res.status(status).json({
    ok: true,
    content: contentStore.get(),
    ...extra,
  });
}

function notFound(res, label) {
  return res.status(404).json({ error: `${label} was not found. It may have been removed in another tab.` });
}

function validateOrder(items, ids, label) {
  if (!Array.isArray(ids) || ids.length !== items.length || new Set(ids).size !== ids.length) {
    throw new ValidationError(`The ${label} order is out of date. Refresh the page and try again.`);
  }
  const valid = new Set(items.map((item) => item.id));
  if (ids.some((id) => !valid.has(id))) {
    throw new ValidationError(`The ${label} order includes an item that no longer exists. Refresh the page.`);
  }
}

function sortByOrder(items) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

adminApiRoutes.get('/bootstrap', (req, res) => {
  const c = content();
  const inquiries = [...(inquiryStore.get().inquiries || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const media = [...(c.media || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const usage = Object.fromEntries(media.map((item) => [item.id, mediaUsageCount(c, item.id)]));
  const stats = {
    projects: c.projects.length,
    visibleProjects: c.projects.filter((p) => p.visible).length,
    galleries: c.galleries.length,
    photos: c.galleries.reduce((sum, gallery) => sum + gallery.photos.length, 0),
    media: c.media.length,
    unreadInquiries: inquiries.filter((inquiry) => !inquiry.read).length,
  };
  res.json({
    ok: true,
    content: c,
    inquiries,
    media,
    usage,
    stats,
    csrfToken: res.locals.csrfToken,
  });
});

adminApiRoutes.put('/home', async (req, res, next) => {
  try {
    const nextHome = homePayload(req.body || {}, content());
    await contentStore.update((draft) => {
      draft.home = nextHome;
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/about', async (req, res, next) => {
  try {
    const nextAbout = aboutPayload(req.body || {}, content());
    await contentStore.update((draft) => {
      draft.about = nextAbout;
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/contact', async (req, res, next) => {
  try {
    const nextContact = contactPayload(req.body || {}, content());
    await contentStore.update((draft) => {
      draft.contact = nextContact;
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/contact-details', async (req, res, next) => {
  try {
    const details = contactDetailsPayload(req.body || {});
    await contentStore.update((draft) => {
      draft.site.email = details.email;
      draft.site.phone = details.phone;
      draft.site.location = details.location;
      draft.site.availability = details.availability;
      draft.site.socials = details.socials;
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/site', async (req, res, next) => {
  try {
    const nextSite = sitePayload(req.body || {}, content());
    await contentStore.update((draft) => {
      draft.site = nextSite;
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post('/projects', async (req, res, next) => {
  try {
    const c = content();
    const project = projectPayload(req.body || {}, c);
    project.order = Number.isInteger(Number(req.body?.order))
      ? Number(req.body.order)
      : Math.max(0, ...c.projects.map((p) => p.order ?? 0)) + 1;
    await contentStore.update((draft) => {
      draft.projects.push(project);
      draft.projects.sort((a, b) => a.order - b.order);
    });
    return respond(res, { project }, 201);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/projects/:id', async (req, res, next) => {
  try {
    const c = content();
    const existing = c.projects.find((p) => p.id === req.params.id);
    if (!existing) return notFound(res, 'Project');
    const nextProject = projectPayload(req.body || {}, c, existing);
    await contentStore.update((draft) => {
      const index = draft.projects.findIndex((p) => p.id === existing.id);
      draft.projects[index] = nextProject;
      draft.projects.sort((a, b) => a.order - b.order);
    });
    return respond(res, { project: nextProject });
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.delete('/projects/:id', async (req, res, next) => {
  try {
    const c = content();
    if (!c.projects.some((p) => p.id === req.params.id)) return notFound(res, 'Project');
    await contentStore.update((draft) => {
      draft.projects = draft.projects.filter((p) => p.id !== req.params.id);
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post('/projects/reorder', async (req, res, next) => {
  try {
    const c = content();
    validateOrder(c.projects, req.body?.ids, 'project');
    await contentStore.update((draft) => {
      const byId = new Map(draft.projects.map((p) => [p.id, p]));
      req.body.ids.forEach((id, index) => {
        byId.get(id).order = index;
      });
      draft.projects = sortByOrder(draft.projects);
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post('/galleries', async (req, res, next) => {
  try {
    const gallery = galleryPayload(req.body || {}, content());
    await contentStore.update((draft) => {
      draft.galleries.push(gallery);
    });
    return respond(res, { gallery }, 201);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/galleries/:id', async (req, res, next) => {
  try {
    const c = content();
    const existing = c.galleries.find((g) => g.id === req.params.id);
    if (!existing) return notFound(res, 'Gallery');
    const nextGallery = galleryPayload(req.body || {}, c, existing);
    await contentStore.update((draft) => {
      const index = draft.galleries.findIndex((g) => g.id === existing.id);
      draft.galleries[index] = nextGallery;
    });
    return respond(res, { gallery: nextGallery });
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.delete('/galleries/:id', async (req, res, next) => {
  try {
    const c = content();
    const gallery = c.galleries.find((g) => g.id === req.params.id);
    if (!gallery) return notFound(res, 'Gallery');
    const usedBy = c.projects.filter((p) => p.galleryId === gallery.id);
    if (usedBy.length) {
      return res.status(409).json({
        error: `“${gallery.title}” is still used by ${usedBy.map((p) => `“${p.title}”`).join(', ')}. Change or remove those projects first.`,
      });
    }
    await contentStore.update((draft) => {
      draft.galleries = draft.galleries.filter((g) => g.id !== gallery.id);
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post('/galleries/:id/photos', photoUpload.array('photos', 20), async (req, res, next) => {
  try {
    const c = content();
    const gallery = c.galleries.find((g) => g.id === req.params.id);
    if (!gallery) return notFound(res, 'Gallery');
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) return res.status(400).json({ error: 'Choose at least one image to upload.' });

    const { media, errors } = await processUploads(files);
    if (!media.length) {
      return res.status(422).json({
        error: errors[0]?.error || 'No images could be processed.',
        errors,
      });
    }

    await contentStore.update((draft) => {
      const target = draft.galleries.find((g) => g.id === gallery.id);
      draft.media.push(...media);
      let order = Math.max(-1, ...target.photos.map((p) => p.order ?? 0)) + 1;
      for (const item of media) {
        target.photos.push({
          id: randomId('ph'),
          mediaId: item.id,
          alt: item.alt,
          caption: '',
          ratio: 'natural',
          focalX: 50,
          focalY: 50,
          order,
        });
        order += 1;
      }
    });

    return respond(res, { uploaded: media, errors }, 201);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/galleries/:id/photos/:photoId', async (req, res, next) => {
  try {
    const c = content();
    const gallery = c.galleries.find((g) => g.id === req.params.id);
    if (!gallery) return notFound(res, 'Gallery');
    const existing = gallery.photos.find((p) => p.id === req.params.photoId);
    if (!existing) return notFound(res, 'Photo');
    const nextPhoto = photoPayload(req.body || {}, c, existing);
    await contentStore.update((draft) => {
      const target = draft.galleries.find((g) => g.id === gallery.id);
      const index = target.photos.findIndex((p) => p.id === existing.id);
      target.photos[index] = nextPhoto;
      target.photos.sort((a, b) => a.order - b.order);
    });
    return respond(res, { photo: nextPhoto });
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.delete('/galleries/:id/photos/:photoId', async (req, res, next) => {
  try {
    const c = content();
    const gallery = c.galleries.find((g) => g.id === req.params.id);
    if (!gallery) return notFound(res, 'Gallery');
    if (!gallery.photos.some((p) => p.id === req.params.photoId)) return notFound(res, 'Photo');
    await contentStore.update((draft) => {
      const target = draft.galleries.find((g) => g.id === gallery.id);
      target.photos = target.photos.filter((p) => p.id !== req.params.photoId);
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post('/galleries/:id/photos/reorder', async (req, res, next) => {
  try {
    const c = content();
    const gallery = c.galleries.find((g) => g.id === req.params.id);
    if (!gallery) return notFound(res, 'Gallery');
    validateOrder(gallery.photos, req.body?.ids, 'photo');
    await contentStore.update((draft) => {
      const target = draft.galleries.find((g) => g.id === gallery.id);
      const byId = new Map(target.photos.map((p) => [p.id, p]));
      req.body.ids.forEach((id, index) => {
        byId.get(id).order = index;
      });
      target.photos = sortByOrder(target.photos);
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post(
  '/galleries/:id/photos/:photoId/replace',
  photoUpload.single('photo'),
  async (req, res, next) => {
    try {
      const c = content();
      const gallery = c.galleries.find((g) => g.id === req.params.id);
      if (!gallery) return notFound(res, 'Gallery');
      const existing = gallery.photos.find((p) => p.id === req.params.photoId);
      if (!existing) return notFound(res, 'Photo');
      if (!req.file) return res.status(400).json({ error: 'Choose a replacement image.' });
      const { media, errors } = await processUploads([req.file]);
      if (!media.length) {
        return res.status(422).json({ error: errors[0]?.error || 'The image could not be processed.', errors });
      }
      const replacement = media[0];
      await contentStore.update((draft) => {
        draft.media.push(replacement);
        const target = draft.galleries.find((g) => g.id === gallery.id);
        const photo = target.photos.find((p) => p.id === existing.id);
        photo.mediaId = replacement.id;
        photo.alt = replacement.alt;
      });
      return respond(res, { uploaded: replacement });
    } catch (err) {
      return next(err);
    }
  },
);

adminApiRoutes.post('/media', photoUpload.array('photos', 20), async (req, res, next) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) return res.status(400).json({ error: 'Choose at least one image to upload.' });
    const { media, errors } = await processUploads(files);
    if (!media.length) {
      return res.status(422).json({ error: errors[0]?.error || 'No images could be processed.', errors });
    }
    await contentStore.update((draft) => {
      draft.media.push(...media);
    });
    return respond(res, { uploaded: media, errors }, 201);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.put('/media/:id', async (req, res, next) => {
  try {
    const c = content();
    const media = findMedia(c, req.params.id);
    if (!media) return notFound(res, 'Image');
    const alt = text(req.body?.alt, 'alt', 'Alt text', { max: 300 });
    await contentStore.update((draft) => {
      const target = draft.media.find((m) => m.id === media.id);
      target.alt = alt;
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.delete('/media/:id', async (req, res, next) => {
  try {
    const c = content();
    const media = findMedia(c, req.params.id);
    if (!media) return notFound(res, 'Image');
    const usages = imageUsage(c, media.id);
    if (usages.length) {
      return res.status(409).json({
        error: 'This image is still used on the site. Remove or replace it first.',
        usages,
      });
    }
    await deleteMediaFiles(media).catch((err) => {
      console.error('[media] Could not delete files:', err.message);
    });
    await contentStore.update((draft) => {
      draft.media = draft.media.filter((m) => m.id !== media.id);
    });
    return respond(res);
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post('/inquiries/:id/read', async (req, res, next) => {
  try {
    const inquiries = inquiryStore.get().inquiries || [];
    if (!inquiries.some((inquiry) => inquiry.id === req.params.id)) return notFound(res, 'Inquiry');
    await inquiryStore.update((draft) => {
      const inquiry = draft.inquiries.find((item) => item.id === req.params.id);
      if (inquiry) inquiry.read = true;
    });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.delete('/inquiries/:id', async (req, res, next) => {
  try {
    const inquiries = inquiryStore.get().inquiries || [];
    if (!inquiries.some((inquiry) => inquiry.id === req.params.id)) return notFound(res, 'Inquiry');
    await inquiryStore.update((draft) => {
      draft.inquiries = draft.inquiries.filter((item) => item.id !== req.params.id);
    });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

adminApiRoutes.post('/password', async (req, res, next) => {
  try {
    await changePassword(req.body?.currentPassword, req.body?.newPassword);
    setSessionCookie(req, res);
    rotateCsrfCookie(req, res);
    return res.json({ ok: true, message: 'Password updated. You are still signed in.' });
  } catch (err) {
    if (err.status === 422) {
      return res.status(422).json({ error: err.message, fields: { [err.field || 'password']: err.message } });
    }
    return next(err);
  }
});

adminApiRoutes.get('/backup', (req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="yugan-photography-content-${date}.json"`);
  res.send(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        site: 'Yugan Photography portfolio',
        content: contentStore.get(),
      },
      null,
      2,
    ),
  );
});
