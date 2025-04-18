const express = require('express');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { createLink, updateLink, deleteLink, deleteMultipleLinks, bulkUploadLinks, getLinkStats, redirectToLink, verifyLinkPassword } = require('../controllers/linkController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', isAuthenticated, createLink);
router.post('/:id', isAuthenticated, updateLink);
router.post('/:id/delete', isAuthenticated, deleteLink);
router.post('/delete', isAuthenticated, deleteMultipleLinks);
router.post('/bulk-upload', isAuthenticated, upload.single('file'), bulkUploadLinks);
router.get('/:id/stats', isAuthenticated, getLinkStats);
router.get('/:shortId', redirectToLink);
router.post('/:shortId/verify', verifyLinkPassword);

module.exports = router;
