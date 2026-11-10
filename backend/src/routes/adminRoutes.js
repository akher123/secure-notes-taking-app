const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.get('/notes', auth, authorize('admin'), noteController.listAllNotes);

module.exports = router;
