const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Auth
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// User management (protect these)
router.get('/', protect, userCtrl.listUsers);
router.get('/:id', protect, userCtrl.getUser);
router.put('/:id', protect, userCtrl.updateUser);
router.delete('/:id', protect, userCtrl.deleteUser);

// Check access
router.get('/:userId/check-access', protect, userCtrl.checkUserAccess);

// Bulk updates
router.post('/bulk/update-same', protect, userCtrl.bulkUpdateSame);
router.post('/bulk/update-different', protect, userCtrl.bulkUpdateDifferent);

module.exports = router;
