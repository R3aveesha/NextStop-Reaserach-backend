const express = require('express');
const router = express.Router();
const authController = require('../../controllers/Admin/adminAuthController');
const { protect } = require('../../middleware/Admin/adminAuthMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.delete('/profile', protect, authController.deleteProfile);
module.exports = router;
