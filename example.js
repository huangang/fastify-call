'use strict'

const fastify = require('fastify')()
fastify.register(require('.'))

fastify.get('/t1', function (request, reply) {
  reply.send({ 'hello': 'get t1' })
})

fastify.post('/t1', async (request, reply) => {
  return Object.assign({ 'hello': 'post t1' }, request.body)
})

fastify.put('/t1', async (request, reply) => {
  reply.code(500).send(Object.assign({ 'hello': 'put t1' }, request.body))
})

fastify.delete('/t1', async (request, reply) => {
  return reply.send({ 'hello': 'delete t1' })
})

fastify.get('/t2', function (request, reply) {
  return fastify.call.get('t1').then((data) => {
    console.log('call t2')
    data.world = 't2'
    return reply.send(data)
  })
})

fastify.get('/t22', function (request, reply) {
  return fastify.call.get('t2')
})

fastify.get('/t3', function (request, reply) {
  return fastify.call.post('t1', { a: 1, b: 2 }).then((data) => {
    data.world = 't3'
    return reply.send(data)
  })
})

fastify.get('/t4', function (request, reply) {
  return fastify.call.put('t1').then((data) => {
    data.world = 't4'
    return reply.send(data)
  }).catch((err) => {
    console.error('t4 error', err)
    err.error = 'error'
    return reply.send(err)
  })
})

fastify.get('/t5', function (request, reply) {
  return fastify.call.delete('t1').then((data) => {
    data.world = 't5'
    return reply.send(data)
  })
})

fastify.get('/t6', function (request, reply) {
  return fastify.call.post('t1', { a: 3 })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
