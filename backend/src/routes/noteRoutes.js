const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const noteController = require('../controllers/noteController');
const { createNoteRules, updateNoteRules } = require('../validators/requestRules');

const router = express.Router();

router.use(auth);
router.get('/', noteController.listOwnNotes);
router.post('/', createNoteRules, validate, noteController.createNote);
router.get('/:id', noteController.getNote);
router.patch('/:id', updateNoteRules, validate, noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
