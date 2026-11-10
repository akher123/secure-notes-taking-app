const express = require('express');
const auth = require('../middleware/auth');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.use(auth);
router.get('/', noteController.listOwnNotes);
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNote);
router.patch('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
