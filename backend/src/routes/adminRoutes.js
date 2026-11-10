const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const noteController = require('../controllers/noteController');
const aggregationController = require('../controllers/aggregationController');

const router = express.Router();

router.get('/notes', auth, authorize('admin'), noteController.listAllNotes);
router.get(
    '/analytics/users-by-interest',
    auth,
    authorize('admin'),
    aggregationController.usersByInterest
);

module.exports = router;
