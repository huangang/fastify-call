'use strict'
const test = require('tap').test
const simple = require('simple-get')

test('call self', function (t) {
  const fastify = require('fastify')()
  t.tearDown(fastify.close.bind(fastify))

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

  fastify.get('/t7', function (request, reply) {
    return fastify.call.get('t2')
  })

  fastify.get('/t8', async (request, reply) => {
    return fastify.call.get('t2')
  })

  fastify.get('/t9', async (request, reply) => {
    let res = await fastify.call.get('t8')
    res.world = 't9'
    return res
  })

  t.tearDown(fastify.close.bind(fastify))

  fastify.listen(0, err => {
    t.error(err)
    const port = fastify.server.address().port
    console.log(`server listening on ${port}`)

    t.test('t2', t => {
      t.plan(2)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t2',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't2')
      })
    })

    t.test('t3', t => {
      t.plan(3)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t3',
        json: true
      }, (err, response, body) => {
        t.error(err)
        console.log(body)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.hello, 'post t1')
        t.equal(body.world, 't3')
        t.equal(body.a, 1)
        t.equal(body.b, 2)
        console.log('pass t3')
      })
    })

    t.test('t4', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t4',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 500)
        t.equal(body.error, 'error')
        t.end()
        console.log('pass t4')
      })
    })

    t.test('t5', t => {
      t.plan(5)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t5',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't5')
        t.end()
        console.log('pass t5')
      })
    })

    t.test('t6', t => {
      t.plan(6)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t6',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.hello, 'post t1')
        t.end()
        console.log('pass t6')
      })
    })

    t.test('t7', t => {
      t.plan(7)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t7',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't2')
        t.end()
        console.log('pass t7')
      })
    })

    t.test('t8', t => {
      t.plan(8)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t8',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't2')
        t.end()
        console.log('pass t8')
      })
    })

    t.test('t9', t => {
      t.plan(9)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t8',
        json: true
      }, (err, response, body) => {
        console.log('t9')
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't9')
        console.log('pass t9')
        t.end()
        t.tearDown(fastify.close.bind(fastify))
      })
    })
  })
})
