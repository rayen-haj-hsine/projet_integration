
// src/docs/openapi.js
const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'TripShare API',
        description: 'Carpooling backend – Sprint 1 (Auth, Trips, Reservations, Notifications)',
        version: '1.0.0'
    },
    servers: [
        { url: 'http://localhost:4000', description: 'Local dev' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        },
        schemas: {
            ApiStatus: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'ok' },
                    time: { type: 'string', format: 'date-time' }
                }
            },
            RegisterRequest: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                    name: { type: 'string', example: 'Driver A' },
                    email: { type: 'string', format: 'email', example: 'driver@example.com' },
                    password: { type: 'string', example: 'secret123' },
                    phone: { type: 'string', nullable: true, example: '+216 55 555 555' },
                    role: { type: 'string', enum: ['driver', 'passenger'], example: 'driver' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'driver@example.com' },
                    password: { type: 'string', example: 'secret123' }
                }
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Driver A' },
                    email: { type: 'string', example: 'driver@example.com' },
                    role: { type: 'string', enum: ['driver', 'passenger'] },
                    token: { type: 'string', description: 'JWT token' }
                }
            },
            TripCreateRequest: {
                type: 'object',
                required: ['departure_city', 'destination_city', 'departure_date', 'price', 'available_seats'],
                properties: {
                    departure_city: { type: 'string', example: 'Mahdia' },
                    destination_city: { type: 'string', example: 'Tunis' },
                    departure_date: { type: 'string', format: 'date-time', example: '2025-11-25T09:00:00Z' },
                    price: { type: 'number', format: 'float', example: 15.5 },
                    available_seats: { type: 'integer', example: 3 }
                }
            },
            TripListItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 42 },
                    driver_id: { type: 'integer', example: 1 },
                    departure_city: { type: 'string', example: 'Mahdia' },
                    destination_city: { type: 'string', example: 'Tunis' },
                    departure_date: { type: 'string', format: 'date-time' },
                    price: { type: 'number', format: 'float', example: 15.5 },
                    available_seats: { type: 'integer', example: 3 },
                    status: { type: 'string', enum: ['open', 'closed', 'cancelled'], example: 'open' }
                }
            },
            TripDetail: {
                allOf: [
                    { $ref: '#/components/schemas/TripListItem' },
                    {
                        type: 'object',
                        properties: {
                            driver_name: { type: 'string', example: 'Driver A' },
                            driver_phone: { type: 'string', example: '+216 55 555 555' }
                        }
                    }
                ]
            },
            PaginatedTrips: {
                type: 'object',
                properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 23 },
                    results: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/TripListItem' }
                    }
                }
            },
            ReservationCreateRequest: {
                type: 'object',
                required: ['trip_id'],
                properties: {
                    trip_id: { type: 'integer', example: 42 }
                }
            },
            ReservationItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 100 },
                    trip_id: { type: 'integer', example: 42 },
                    passenger_id: { type: 'integer', example: 5 },
                    status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'], example: 'pending' },
                    created_at: { type: 'string', format: 'date-time' },
                    departure_city: { type: 'string', example: 'Mahdia' },
                    destination_city: { type: 'string', example: 'Tunis' },
                    departure_date: { type: 'string', format: 'date-time' },
                    price: { type: 'number', format: 'float' },
                    passenger_name: { type: 'string', example: 'Passenger B' }
                }
            },
            NotificationItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    message: { type: 'string', example: 'Your reservation has been confirmed' },
                    type: { type: 'string', enum: ['confirmation', 'reminder', 'cancellation'] },
                    is_read: { type: 'integer', example: 0 },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'Invalid credentials' }
                }
            }
        }
    },
    tags: [
        { name: 'Health' },
        { name: 'Auth' },
        { name: 'Trips' },
        { name: 'Reservations' },
        { name: 'Notifications' }
    ],
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'API health check',
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiStatus' } } } }
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register user (driver/passenger)',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
                },
                responses: {
                    201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
                },
                responses: {
                    200: { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/trips': {
            get: {
                tags: ['Trips'],
                summary: 'Search trips',
                parameters: [
                    { name: 'departure_city', in: 'query', schema: { type: 'string' } },
                    { name: 'destination_city', in: 'query', schema: { type: 'string' } },
                    { name: 'from_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'to_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
                ],
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedTrips' } } } }
                }
            },
            post: {
                security: [{ bearerAuth: [] }],
                tags: ['Trips'],
                summary: 'Create trip (driver only)',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/TripCreateRequest' } } }
                },
                responses: {
                    201: { description: 'Created', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer', example: 42 } } } } } },
                    403: { description: 'Only drivers can create trips', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/trips/{id}': {
            get: {
                tags: ['Trips'],
                summary: 'Get trip details',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/TripDetail' } } } },
                    404: { description: 'Trip not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/reservations': {
            post: {
                security: [{ bearerAuth: [] }],
                tags: ['Reservations'],
                summary: 'Create reservation (passenger)',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ReservationCreateRequest' } } }
                },
                responses: {
                    201: { description: 'Created', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer', example: 100 }, status: { type: 'string', example: 'pending' } } } } } },
                    400: { description: 'Trip not open / no seats', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    409: { description: 'Duplicate reservation', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/reservations/me': {
            get: {
                security: [{ bearerAuth: [] }],
                tags: ['Reservations'],
                summary: 'List my reservations (role-aware)',
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ReservationItem' } } } } }
                }
            }
        },
        '/api/reservations/{id}/confirm': {
            patch: {
                security: [{ bearerAuth: [] }],
                tags: ['Reservations'],
                summary: 'Confirm reservation (driver of trip)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Confirmed', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer' }, status: { type: 'string', example: 'confirmed' } } } } } },
                    403: { description: 'Forbidden: not trip driver', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Reservation not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/reservations/{id}/cancel': {
            patch: {
                security: [{ bearerAuth: [] }],
                tags: ['Reservations'],
                summary: 'Cancel reservation (driver or passenger)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Cancelled', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer' }, status: { type: 'string', example: 'cancelled' } } } } } },
                    403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    404: { description: 'Reservation not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/notifications': {
            get: {
                security: [{ bearerAuth: [] }],
                tags: ['Notifications'],
                summary: 'List my notifications',
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/NotificationItem' } } } } }
                }
            }
        },
        '/api/notifications/{id}/read': {
            patch: {
                security: [{ bearerAuth: [] }],
                tags: ['Notifications'],
                summary: 'Mark notification read',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer' }, is_read: { type: 'integer', example: 1 } } } } } },
                    404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        }
    }
};

export default swaggerSpec;
