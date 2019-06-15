'use strict'

const fastify = require('fastify')()
fastify.register(require('.'))

fastify.get('/t1', function (request, reply) {
  reply.send({ 'hello': 'get t1' })
})

fastify.post('/t1', function (request, reply) {
  reply.send({ 'hello': 'post t1' })
})

fastify.put('/t1', function (request, reply) {
  reply.send({ 'hello': 'put t1' })
})

fastify.delete('/t1', function (request, reply) {
  reply.send({ 'hello': 'delete t1' })
})

fastify.get('/t2', function (request, reply) {
  return fastify.call.get('t1', { request, reply }).then((data) => {
    data.world = 't2'
    return reply.send(data)
  })
})

fastify.get('/t3', function (request, reply) {
  return fastify.call.post('t1', { request, reply }).then((data) => {
    data.world = 't3'
    return reply.send(data)
  })
})

fastify.get('/t4', function (request, reply) {
  return fastify.call.delete('t1', { request, reply }).then((data) => {
    data.world = 't4'
    return reply.send(data)
  })
})

fastify.get('/t5', function (request, reply) {
  return fastify.call.put('t1', { request, reply }).then((data) => {
    data.world = 't5'
    return reply.send(data)
  })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
