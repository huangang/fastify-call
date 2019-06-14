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
    return fastify.call('t1', { method: 'get', request, reply }).then((data) => {
      t.equal(data.hello, 't1')
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
      res.resume()
      res.on('end', () => {
        t.pass('res ended successfully')
        t.end()
      })
    })
  })
})
