import express from 'express';
import {
  CSRF_COOKIE,
  SITE_URL,
} from '../config.js';
import {
  clearSessionCookie,
  requireCsrf,
  requireSameOrigin,
  rotateCsrfCookie,
  setSessionCookie,
  verifyLogin,
} from '../auth.js';
import { loginLimiter, minutesUntil } from '../rate-limit.js';
import { safeEqual } from '../util.js';

export const authRoutes = express.Router();

function safeNext(value) {
  const raw = String(value || '');
  if (!/^\/admin(?:\/|$)/.test(raw) || raw.startsWith('//')) return '/admin';
  if (raw.startsWith('/admin/login')) return '/admin';
  return raw;
}

function renderLogin(req, res, { status = 200, error = '', username = '', next = '/admin' } = {}) {
  return res.status(status).render('admin/login', {
    pageTitle: 'Studio access — Yugan Photography',
    metaDescription: 'Private studio access.',
    noindex: true,
    bodyClass: 'admin-login-body',
    extraCss: '/css/admin.css',
    loginError: error,
    username,
    next: safeNext(next),
    siteUrl: SITE_URL,
  });
}

authRoutes.get('/login', (req, res) => {
  if (req.session) return res.redirect('/admin');
  return renderLogin(req, res, { next: req.query.next || '/admin' });
});

authRoutes.post('/login', requireSameOrigin, async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.[CSRF_COOKIE] || '';
    const suppliedToken = String(req.body?._csrf || '');
    if (!cookieToken || !suppliedToken || !safeEqual(cookieToken, suppliedToken)) {
      return renderLogin(req, res, {
        status: 403,
        error: 'Your security token expired. Refresh the page and try again.',
        username: String(req.body?.username || ''),
        next: req.body?.next,
      });
    }

    const key = req.ip || 'unknown';
    const limit = loginLimiter.consume(key);
    if (!limit.allowed) {
      return renderLogin(req, res, {
        status: 429,
        error: `Too many sign-in attempts. Try again in about ${minutesUntil(limit.retryAfterMs)} minutes.`,
        username: String(req.body?.username || ''),
        next: req.body?.next,
      });
    }

    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const ok = await verifyLogin(username, password);
    if (!ok) {
      return renderLogin(req, res, {
        status: 401,
        error: 'That username or password is not correct.',
        username,
        next: req.body?.next,
      });
    }

    loginLimiter.reset(key);
    setSessionCookie(req, res);
    rotateCsrfCookie(req, res);
    return res.redirect(303, safeNext(req.body?.next));
  } catch (err) {
    return next(err);
  }
});

authRoutes.post('/logout', requireCsrf, (req, res) => {
  clearSessionCookie(req, res);
  rotateCsrfCookie(req, res);
  return res.redirect(303, '/admin/login');
});
