const mongoose = require('mongoose');
const Note = require('../models/Note');
const { parsePagination, buildMeta } = require('../utils/pagination');

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function toPublicNote(note) {
    return {
        id: note._id,
        userId: note.userId,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
    };
}

async function listNotes(filter, query) {
    const { page, limit, skip } = parsePagination(query);
    const [total, notes] = await Promise.all([
        Note.countDocuments(filter),
        Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return {
        data: notes.map(toPublicNote),
        meta: buildMeta(page, limit, total),
    };
}

function listOwnNotes(userId, query) {
    return listNotes({ userId }, query);
}

function listAllNotes(query) {
    return listNotes({}, query);
}

async function createNote(userId, { title, content }) {
    const note = await Note.create({ userId, title, content });
    return toPublicNote(note);
}

async function findAccessibleNote(requester, id) {
    if (!mongoose.isValidObjectId(id)) {
        throw httpError(404, 'Note not found');
    }

    const note = await Note.findById(id);
    if (!note) {
        throw httpError(404, 'Note not found');
    }

    const isOwner = String(note.userId) === String(requester.id);
    if (requester.role !== 'admin' && !isOwner) {
        throw httpError(404, 'Note not found');
    }

    return note;
}

async function getNote(requester, id) {
    const note = await findAccessibleNote(requester, id);
    return toPublicNote(note);
}

async function updateNote(requester, id, updates) {
    const note = await findAccessibleNote(requester, id);
    if (updates.title !== undefined) note.title = updates.title;
    if (updates.content !== undefined) note.content = updates.content;
    await note.save();
    return toPublicNote(note);
}

async function deleteNote(requester, id) {
    const note = await findAccessibleNote(requester, id);
    await note.deleteOne();
}

module.exports = {
    listOwnNotes,
    listAllNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote,
};
