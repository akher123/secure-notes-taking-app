const noteService = require('../services/noteService');

function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function sendError(res, error) {
    const status = error.status || 500;
    if (status >= 500) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(status).json({ message: error.message });
}

async function listOwnNotes(req, res) {
    try {
        const result = await noteService.listOwnNotes(req.user.id, req.query);
        return res.json(result);
    } catch (error) {
        return sendError(res, error);
    }
}

async function listAllNotes(req, res) {
    try {
        const result = await noteService.listAllNotes(req.query);
        return res.json(result);
    } catch (error) {
        return sendError(res, error);
    }
}

async function createNote(req, res) {
    try {
        const title = readString(req.body?.title);
        const content = readString(req.body?.content);
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const note = await noteService.createNote(req.user.id, { title, content });
        return res.status(201).json(note);
    } catch (error) {
        return sendError(res, error);
    }
}

async function getNote(req, res) {
    try {
        const note = await noteService.getNote(req.user, req.params.id);
        return res.json(note);
    } catch (error) {
        return sendError(res, error);
    }
}

async function updateNote(req, res) {
    try {
        const updates = {};
        if (req.body?.title !== undefined) {
            const title = readString(req.body.title);
            if (!title) {
                return res.status(400).json({ message: 'Title cannot be empty' });
            }
            updates.title = title;
        }
        if (req.body?.content !== undefined) {
            const content = readString(req.body.content);
            if (!content) {
                return res.status(400).json({ message: 'Content cannot be empty' });
            }
            updates.content = content;
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const note = await noteService.updateNote(req.user, req.params.id, updates);
        return res.json(note);
    } catch (error) {
        return sendError(res, error);
    }
}

async function deleteNote(req, res) {
    try {
        await noteService.deleteNote(req.user, req.params.id);
        return res.status(204).send();
    } catch (error) {
        return sendError(res, error);
    }
}

module.exports = {
    listOwnNotes,
    listAllNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote,
};
