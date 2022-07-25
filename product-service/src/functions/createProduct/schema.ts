export default {
    type: 'object',
    properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        count: { type: 'number' },
        price: { type: 'number' },
    },
    required: ['title', 'price', 'count'],
} as const;