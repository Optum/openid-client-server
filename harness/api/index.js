const fastify = require('fastify')

const port = Number.parseInt(process.env.OPENID_RIG_API_PORT || '3000', 10)

const app = fastify({
    // 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
    logger: {level: 'error'}
})

const booksJsonSchema = {
    type: 'array',
    items: {
        type: 'object',
        required: ['title', 'author'],
        properties: {
            title: {type: 'string'},
            author: {type: 'string'}
        }
    }
}

const books = [
    {
        title: 'Hamlet',
        author: 'William Shakespeare'
    },
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald'
    },
    {
        title: 'War and Peace',
        author: 'Leo Tolstoy'
    }
]

app.get(
    '/',
    {
        schema: {
            response: {
                200: {type: 'string'}
            }
        }
    },
    (_request, reply) => {
        reply.status(200).send('OK')
    }
)

app.get(
    '/books',
    {
        schema: {
            response: {
                200: booksJsonSchema
            }
        }
    },
    (_request, reply) => {
        reply.status(200).send(books)
    }
)

app.listen(port, (error, address) => {
    if (error) throw error
    console.log(`🚀  API ready at ${address}`)
})
