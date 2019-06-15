'use strict'
const test = require('tap').test
const http = require('http')

test('call self', function (t) {
  const fastify = require('fastify')()
  t.tearDown(fastify.close.bind(fastify))

  fastify.register(require('.'))

  fastify.get('/t1', function (request, reply) {
    reply.send({ 'hello': 't1' })
  })
  fastify.get('/t2', function (request, reply) {
    return fastify.call.get('t1').then((data) => {
      data.world = 't2'
      t.equal(data.hello, 't1')
      return reply.send(data)
    })
  })

  fastify.get('/t3', function (request, reply) {
    return fastify.call.post('t1').then((data) => {
      data.world = 't3'
      t.equal(data.hello, 't1')
      return reply.send(data)
    })
  })

  fastify.get('/t4', function (request, reply) {
    return fastify.call.delete('t1').then((data) => {
      data.world = 't4'
      t.equal(data.hello, 't1')
      return reply.send(data)
    })
  })

  fastify.get('/t5', function (request, reply) {
    return fastify.call.put('t1').then((data) => {
      data.world = 't5'
      t.equal(data.hello, 't1')
      return reply.send(data)
    })
  })

  fastify.listen(0, err => {
    if (err) throw err
    console.log(`server listening on ${fastify.server.address().port}`)

    http.get({
      protocol: 'http:',
      hostname: 'localhost',
      port: fastify.server.address().port,
      path: '/t2'
    }, (res) => {
      t.equal(res.statusCode, 200)
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.resume()
      res.on('end', () => {
        data = JSON.parse(data)
        t.equal(data.world, 't2')
        t.pass('res ended successfully')
        t.end()
      })
    })
  })
})
