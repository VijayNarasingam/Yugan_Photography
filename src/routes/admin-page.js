import express from 'express';
import { requireAuthPage } from '../auth.js';

export const adminPageRoutes = express.Router();

adminPageRoutes.get('/', requireAuthPage, (req, res) => {
  res.render('admin/index', {
    pageTitle: 'Studio — Yugan Photography',
    metaDescription: 'Private studio administration.',
    noindex: true,
    bodyClass: 'admin-body',
    extraCss: '/css/admin.css',
    adminUsername: req.session.sub,
  });
});
