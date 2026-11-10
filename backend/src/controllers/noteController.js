const noteService = require('../services/noteService');

async function listOwnNotes(req, res) {
    const result = await noteService.listOwnNotes(req.user.id, req.query);
    return res.json(result);
}

async function listAllNotes(req, res) {
    const result = await noteService.listAllNotes(req.query);
    return res.json(result);
}

async function createNote(req, res) {
    const note = await noteService.createNote(req.user.id, {
        title: req.body.title,
        content: req.body.content,
    });
    return res.status(201).json(note);
}

async function getNote(req, res) {
    const note = await noteService.getNote(req.user, req.params.id);
    return res.json(note);
}

async function updateNote(req, res) {
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.content !== undefined) updates.content = req.body.content;
    const note = await noteService.updateNote(req.user, req.params.id, updates);
    return res.json(note);
}

async function deleteNote(req, res) {
    await noteService.deleteNote(req.user, req.params.id);
    return res.status(204).send();
}

module.exports = {
    listOwnNotes,
    listAllNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote,
};
