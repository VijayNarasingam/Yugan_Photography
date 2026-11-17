import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CSRF_COOKIE,
  DATA_DIR,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from './config.js';
import { readJson, writeJsonAtomic } from './store.js';
import { parseCookies, randomId, safeEqual } from './util.js';

const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const SECRET_FILE = path.join(DATA_DIR, 'session-secret');

let authCache = null;
let secretCache = null;

function isSecureRequest(req) {
  return Boolean(req.secure || req.get('x-forwarded-proto') === 'https');
}

async function loadSecret() {
  if (secretCache) return secretCache;
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const existing = (await fs.readFile(SECRET_FILE, 'utf8')).trim();
    if (existing.length >= 64) {
      secretCache = existing;
      return secretCache;
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  secretCache = crypto.randomBytes(64).toString('hex');
  await fs.writeFile(SECRET_FILE, secretCache, { encoding: 'utf8', mode: 0o600 });
  return secretCache;
}

export async function ensureAuth() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await loadSecret();

  const existing = await readJson(AUTH_FILE, null);
  if (existing) {
    if (!existing.username || !existing.passwordHash) {
      throw new Error('data/auth.json is incomplete. Restore it or delete it to re-seed.');
    }
    authCache = existing;
    return authCache;
  }

  let password = process.env.ADMIN_PASSWORD;
  let generated = false;
  if (!password) {
    password = crypto.randomBytes(15).toString('base64url');
    generated = true;
  }

  const now = new Date().toISOString();
  const auth = {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: await bcrypt.hash(password, 12),
    sessionVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
  await writeJsonAtomic(AUTH_FILE, auth);
  authCache = auth;

  if (generated) {
    const note = [
      'Yugan Photography studio — initial administrator credentials',
      '',
      `Username: ${auth.username}`,
      `Password: ${password}`,
      '',
      'This file is generated once. Sign in at /admin/login and change the password.',
      'Delete this file after saving the password somewhere safe.',
      '',
    ].join('\n');
    await fs.writeFile(path.join(DATA_DIR, 'initial-admin.txt'), note, 'utf8');
    console.warn('[auth] No ADMIN_PASSWORD was set. A random password was generated.');
    console.warn('[auth] Read data/initial-admin.txt, sign in, then change the password.');
  } else {
    console.log(`[auth] Administrator account ready for “${auth.username}”.`);
  }
  return auth;
}

export function getAuth() {
  if (!authCache) throw new Error('Authentication has not been initialised');
  return authCache;
}

export async function verifyLogin(username, password) {
  const auth = getAuth();
  const usernameOk = safeEqual(String(username ?? '').trim(), auth.username);
  const passwordOk = await bcrypt.compare(String(password ?? ''), auth.passwordHash);
  return usernameOk && passwordOk;
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', secretCache).update(payloadB64).digest('base64url');
}

export function createSessionToken() {
  const auth = getAuth();
  const now = Date.now();
  const payload = {
    sub: auth.username,
    sv: auth.sessionVersion,
    iat: now,
    exp: now + SESSION_TTL_MS,
    n: randomId('s'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { token: `${payloadB64}.${sign(payloadB64)}`, expires: new Date(payload.exp) };
}

export function readSession(req) {
  if (!secretCache || !authCache) return null;
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const payloadB64 = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!safeEqual(signature, sign(payloadB64))) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || payload.exp < Date.now()) return null;
  if (payload.sub !== authCache.username) return null;
  if (payload.sv !== authCache.sessionVersion) return null;
  return payload;
}

export function setSessionCookie(req, res) {
  const { token, expires } = createSessionToken();
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecureRequest(req),
    path: '/',
    expires,
  });
}

export function clearSessionCookie(req, res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecureRequest(req),
    path: '/',
  });
}

export function rotateCsrfCookie(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: isSecureRequest(req),
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
  res.locals.csrfToken = token;
  if (req.cookies) req.cookies[CSRF_COOKIE] = token;
  return token;
}

export function attachSecurityContext(req, res, next) {
  req.cookies = parseCookies(req.headers.cookie);
  let csrfToken = req.cookies[CSRF_COOKIE];
  if (!csrfToken || !/^[a-f0-9]{64}$/.test(csrfToken)) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      sameSite: 'strict',
      secure: isSecureRequest(req),
      path: '/',
      maxAge: SESSION_TTL_MS,
    });
    req.cookies[CSRF_COOKIE] = csrfToken;
  }
  res.locals.csrfToken = csrfToken;
  req.session = readSession(req);
  res.locals.isAdmin = Boolean(req.session);
  res.locals.adminUsername = req.session?.sub || '';
  next();
}

export function requireAuthPage(req, res, next) {
  if (req.session) return next();
  const nextUrl = encodeURIComponent(req.originalUrl || '/admin');
  return res.redirect(`/admin/login?next=${nextUrl}`);
}

export function requireAuthApi(req, res, next) {
  if (req.session) return next();
  return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
}

export function requireCsrf(req, res, next) {
  const methods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (!methods.has(req.method)) return next();
  const cookieToken = req.cookies?.[CSRF_COOKIE] || '';
  const supplied =
    req.get('x-csrf-token') ||
    (req.body && typeof req.body._csrf === 'string' ? req.body._csrf : '');
  if (!cookieToken || !supplied || !safeEqual(cookieToken, supplied)) {
    const wantsJson = req.path.startsWith('/api/') || req.get('accept')?.includes('application/json');
    if (wantsJson) return res.status(403).json({ error: 'Security token expired. Refresh the page and try again.' });
    return res.status(403).send('Security token expired. Refresh the page and try again.');
  }
  return next();
}

export function requireSameOrigin(req, res, next) {
  const methods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (!methods.has(req.method)) return next();
  const source = req.get('origin') || req.get('referer');
  if (!source) return next();
  try {
    const url = new URL(source);
    if (url.host === req.get('host')) return next();
  } catch {
    // fall through
  }
  return res.status(403).json({ error: 'Request origin was not recognised.' });
}

export async function changePassword(currentPassword, nextPassword) {
  const auth = getAuth();
  const currentOk = await bcrypt.compare(String(currentPassword ?? ''), auth.passwordHash);
  if (!currentOk) {
    const err = new Error('Your current password is not correct.');
    err.status = 422;
    err.field = 'currentPassword';
    throw err;
  }
  if (String(nextPassword ?? '').length < 10) {
    const err = new Error('Use at least 10 characters for the new password.');
    err.status = 422;
    err.field = 'newPassword';
    throw err;
  }
  if (String(nextPassword).length > 200) {
    const err = new Error('That password is too long.');
    err.status = 422;
    err.field = 'newPassword';
    throw err;
  }
  auth.passwordHash = await bcrypt.hash(String(nextPassword), 12);
  auth.sessionVersion = Number(auth.sessionVersion || 1) + 1;
  auth.updatedAt = new Date().toISOString();
  await writeJsonAtomic(AUTH_FILE, auth);
  authCache = auth;
  return auth;
}
