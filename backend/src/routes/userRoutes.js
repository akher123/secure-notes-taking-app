const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const userController = require('../controllers/userController');
const aggregationController = require('../controllers/aggregationController');

const router = express.Router();

router.use(auth);
router.get('/', authorize('admin'), userController.listUsers);
router.post('/', authorize('admin'), userController.createUser);
router.get('/:id/posts', aggregationController.userPosts);
router.get('/:id', userController.getUser);
router.patch('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
