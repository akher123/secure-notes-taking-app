const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Secure Note-Taking API',
        version: '1.0.0',
        description:
            'JWT authentication with Bearer tokens. Use Authorize and paste the token from POST /api/auth/login (the token value only, without the Bearer prefix).',
    },
    servers: [
        {
            url: '/',
        },
    ],
    tags: [
        { name: 'Auth' },
        { name: 'Users' },
        { name: 'Notes' },
        { name: 'Admin' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Paste the JWT from login. Swagger adds the Authorization: Bearer header.',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    code: { type: 'string' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                    interests: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Note: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            PaginationMeta: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    paths: {
        '/api/health': {
            get: {
                tags: ['Auth'],
                summary: 'Health check',
                security: [],
                responses: {
                    200: { description: 'API is running' },
                },
            },
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a user',
                description: 'Role is always user. A client-supplied admin role is ignored.',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', example: 'Amina' },
                                    email: { type: 'string', format: 'email', example: 'amina@example.com' },
                                    password: { type: 'string', minLength: 6, example: 'secret12' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Created',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                    },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login',
                description: 'Copy the returned token into Authorize.',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'rahim@example.com' },
                                    password: { type: 'string', example: 'test123' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Token and user',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                    },
                    401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Current user',
                responses: {
                    200: { description: 'User', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    401: { description: 'Missing or invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/api/users': {
            get: {
                tags: ['Users'],
                summary: 'List users',
                description: 'Admin only. Sorted by createdAt descending.',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
                ],
                responses: {
                    200: { description: 'Paginated users' },
                    403: { description: 'Forbidden' },
                },
            },
            post: {
                tags: ['Users'],
                summary: 'Create a user',
                description: 'Admin only. Password is hashed.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    role: { type: 'string', enum: ['user', 'admin'] },
                                    interests: { type: 'array', items: { type: 'string' } },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    409: { description: 'Email already registered' },
                },
            },
        },
        '/api/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get a user',
                description: 'Admin, or the user themself.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'User', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    403: { description: 'Forbidden' },
                    404: { description: 'Not found' },
                },
            },
            patch: {
                tags: ['Users'],
                summary: 'Update a user',
                description: 'Admin only.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    role: { type: 'string', enum: ['user', 'admin'] },
                                    interests: { type: 'array', items: { type: 'string' } },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Updated user' },
                    404: { description: 'Not found' },
                },
            },
            delete: {
                tags: ['Users'],
                summary: 'Delete a user',
                description: 'Admin only.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    204: { description: 'Deleted' },
                    404: { description: 'Not found' },
                },
            },
        },
        '/api/users/{id}/posts': {
            get: {
                tags: ['Users'],
                summary: 'Posts for a user',
                description: 'One aggregation with $lookup. Any authenticated user.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'User document with posts array' },
                    404: { description: 'User not found' },
                },
            },
        },
        '/api/notes': {
            get: {
                tags: ['Notes'],
                summary: 'List my notes',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
                ],
                responses: {
                    200: { description: 'Paginated notes owned by the caller' },
                },
            },
            post: {
                tags: ['Notes'],
                summary: 'Create a note',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'content'],
                                properties: {
                                    title: { type: 'string', example: 'Interview notes' },
                                    content: { type: 'string', example: 'Indexes and aggregations.' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } },
                },
            },
        },
        '/api/notes/{id}': {
            get: {
                tags: ['Notes'],
                summary: 'Get a note',
                description: 'Owner or admin. Another user receives 404.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Note' },
                    404: { description: 'Not found' },
                },
            },
            patch: {
                tags: ['Notes'],
                summary: 'Update a note',
                description: 'Owner or admin.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    content: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Updated note' },
                    404: { description: 'Not found' },
                },
            },
            delete: {
                tags: ['Notes'],
                summary: 'Delete a note',
                description: 'Owner or admin.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    204: { description: 'Deleted' },
                    404: { description: 'Not found' },
                },
            },
        },
        '/api/admin/notes': {
            get: {
                tags: ['Admin'],
                summary: 'List every note',
                description: 'Admin only.',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
                ],
                responses: {
                    200: { description: 'Paginated notes' },
                    403: { description: 'Forbidden' },
                },
            },
        },
        '/api/admin/analytics/users-by-interest': {
            get: {
                tags: ['Admin'],
                summary: 'Users grouped by interest',
                description: 'Admin only. One User.aggregate() call.',
                responses: {
                    200: { description: 'Groups of users by interest' },
                    403: { description: 'Forbidden' },
                },
            },
        },
    },
};

module.exports = openApiSpec;
