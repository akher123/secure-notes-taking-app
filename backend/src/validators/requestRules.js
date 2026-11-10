const { body } = require('express-validator');

const nameRule = body('name').trim().notEmpty().withMessage('Name is required');
const emailRule = body('email').trim().toLowerCase().isEmail().withMessage('Email is invalid');
const passwordRule = body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters');
const roleRule = body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin');
const interestsRule = body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array of strings');
const interestItemRule = body('interests.*')
    .optional()
    .isString()
    .withMessage('Interests must be an array of strings')
    .trim()
    .notEmpty()
    .withMessage('Interests must be an array of strings');

const registerRules = [nameRule, emailRule, passwordRule];

const loginRules = [
    emailRule,
    body('password').isString().notEmpty().withMessage('Password is required'),
];

const createUserRules = [nameRule, emailRule, passwordRule, roleRule, interestsRule, interestItemRule];

const updateUserRules = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().trim().toLowerCase().isEmail().withMessage('Email is invalid'),
    body('password')
        .optional()
        .isString()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    roleRule,
    interestsRule,
    interestItemRule,
    body().custom((value) => {
        const fields = ['name', 'email', 'password', 'role', 'interests'];
        if (!value || !fields.some((field) => value[field] !== undefined)) {
            throw new Error('No valid fields to update');
        }
        return true;
    }),
];

const createNoteRules = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
];

const updateNoteRules = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body().custom((value) => {
        if (!value || (value.title === undefined && value.content === undefined)) {
            throw new Error('No valid fields to update');
        }
        return true;
    }),
];

module.exports = {
    registerRules,
    loginRules,
    createUserRules,
    updateUserRules,
    createNoteRules,
    updateNoteRules,
};
