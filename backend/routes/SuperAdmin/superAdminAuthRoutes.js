const express = require('express');
const router = express.Router();
const controller = require('../../controllers/SuperAdmin/superAdminAuthController');
const { protect } = require('../../middleware/SuperAdmin/superAdminAuthMiddleware');

router.post('/login', controller.login);
router.get('/profile', protect, controller.profile);

module.exports = router;
