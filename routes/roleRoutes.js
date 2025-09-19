const express = require('express');
const router = express.Router();
const roleCtrl = require('../controllers/roleController');
const { protect } = require('../middlewares/authMiddleware');

// Public create/list/get could be unprotected depending on requirement. Protecting some endpoints as example.
router.post('/', protect, roleCtrl.createRole);
router.get('/', protect, roleCtrl.listRoles);
router.get('/:id', protect, roleCtrl.getRole);
router.put('/:id', protect, roleCtrl.updateRole);
router.delete('/:id', protect, roleCtrl.deleteRole);

// Add unique access module
router.post('/:id/access/add', protect, roleCtrl.addAccessModule);
// Remove access module
router.post('/:id/access/remove', protect, roleCtrl.removeAccessModule);

module.exports = router;
