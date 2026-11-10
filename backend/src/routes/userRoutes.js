const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const userController = require('../controllers/userController');
const aggregationController = require('../controllers/aggregationController');
const { createUserRules, updateUserRules } = require('../validators/requestRules');

const router = express.Router();

router.use(auth);
router.get('/', authorize('admin'), userController.listUsers);
router.post('/', authorize('admin'), createUserRules, validate, userController.createUser);
router.get('/:id/posts', aggregationController.userPosts);
router.get('/:id', userController.getUser);
router.patch('/:id', authorize('admin'), updateUserRules, validate, userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
