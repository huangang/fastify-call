'use strict'

const fastify = require('fastify')()
fastify.register(require('.'))

fastify.get('/t1', function (request, reply) {
  reply.send({ 'hello': 't1' })
})

fastify.get('/t2', function (request, reply) {
  return fastify.call('t1', { method: 'get', request, reply }).then((data) => {
    data.world = 't2'
    return reply.send(data)
  })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
