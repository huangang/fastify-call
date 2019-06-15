'use strict'

const fastify = require('fastify')()
fastify.register(require('.'))

fastify.get('/t1', function (request, reply) {
  reply.send({ 'hello': 'get t1' })
})

fastify.post('/t1', function (request, reply) {
  reply.send(Object.assign({ 'hello': 'put t1' }, request.body))
})

fastify.put('/t1', function (request, reply) {
  reply.send(Object.assign({ 'hello': 'put t1' }, request.body))
})

fastify.delete('/t1', function (request, reply) {
  reply.send({ 'hello': 'delete t1' })
})

fastify.get('/t2', function (request, reply) {
  return fastify.call.get('t1').then((data) => {
    data.world = 't2'
    return reply.send(data)
  })
})

fastify.get('/t3', function (request, reply) {
  return fastify.call.post('t1', { a: 1, b: 2 }).then((data) => {
    data.world = 't3'
    return reply.send(data)
  })
})

fastify.get('/t4', function (request, reply) {
  return fastify.call.delete('t1').then((data) => {
    data.world = 't4'
    return reply.send(data)
  })
})

fastify.get('/t5', function (request, reply) {
  return fastify.call.put('t1').then((data) => {
    data.world = 't5'
    return reply.send(data)
  })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
