'use strict'
const test = require('tap').test
const simple = require('simple-get')

test('call self', function (t) {
  const fastify = require('fastify')()

  fastify.register(require('.'))

  fastify.get('/t1', {
    preHandler: (request, reply, done) => {
      console.log('preHandler get t1')
      done()
    },
    handler: (request, reply) => {
      reply.send({ hello: 'get t1' })
    }
  })

  fastify.post('/t1', {
    preHandler: async (request, reply) => {
      console.log('preHandler post t1')
    },
    handler: async (request, reply) => {
      return Object.assign({ hello: 'post t1' }, request.body)
    }
  })

  fastify.put('/t1', async (request, reply) => {
    reply.code(500).send(Object.assign({ hello: 'put t1' }, request.body))
  })

  fastify.delete('/t1', async (request, reply) => {
    return reply.send({ hello: 'delete t1' })
  })

  fastify.get('/t2', function (request, reply) {
    return fastify.call.get('t1').then((data) => {
      t.pass('call t2')
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
      // console.error('t4 error', err)
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
    const res = await fastify.call.get('t8')
    res.world = 't9'
    return res
  })

  fastify.get('/t10', async (request, reply) => {
    return fastify.call('t8')
  })

  fastify.post('/t11', async (request, reply) => {
    throw new Error('t11 error')
  })

  fastify.get('/t12', async (request, reply) => {
    return fastify.call('/t11', 'post', { a: 1, b: 2 })
  })

  fastify.get('/t13', async (request, reply) => {
    return reply.code(500).send({ hello: 't13' })
  })

  fastify.get('/t14', async (request, reply) => {
    return fastify.call('/t13', 'get')
  })

  fastify.get('/t100', async (request, reply) => {
    return fastify.call('t1000')
  })

  fastify.listen(0, async err => {
    t.error(err)
    const port = fastify.server.address().port
    t.pass(`server listening on ${port}`)

    await t.test('t2', t => {
      t.plan(3)
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

    console.log('t2')
    await t.test('t3', t => {
      t.plan(7)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t3',
        json: true
      }, (err, response, body) => {
        t.error(err)
        // console.log(response.statusCode)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.hello, 'post t1')
        t.equal(body.world, 't3')
        t.equal(body.a, 1)
        t.equal(body.b, 2)
        t.pass('pass t3')
      })
    })
    console.log('t3')
    await t.test('t4', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t4',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.error, 'error')
        t.pass('pass t4')
      })
    })
    console.log('t4')
    await t.test('t5', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t5',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't5')
        t.pass('pass t5')
      })
    })
    console.log('t5')
    await t.test('t6', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t6',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.hello, 'post t1')
        t.pass('pass t6')
      })
    })
    console.log('t6')
    await t.test('t7', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t7',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't2')
        t.pass('pass t7')
      })
    })
    console.log('t7')
    await t.test('t8', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t8',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't2')
        t.pass('pass t8')
      })
    })
    console.log('t8')
    await t.test('t9', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t9',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't9')
        t.pass('pass t9')
      })
    })
    console.log('t9')

    await t.test('t10', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t10',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.equal(body.world, 't2')
        t.pass('pass t10')
      })
    })
    console.log('t10')

    await t.test('t12', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t12',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 500)
        t.equal(body.message, 't11 error')
        t.pass('pass t12')
      })
    })
    console.log('t12')

    await t.test('t14', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t14',
        json: true
      }, (err, response, body) => {
        console.log(body)
        t.error(err)
        t.strictEqual(response.statusCode, 500)
        t.equal(body.hello, 't13')
        t.pass('pass t14')
      })
    })
    console.log('t14')

    await t.test('t100', t => {
      t.plan(4)
      simple.concat({
        method: 'GET',
        url: 'http://localhost:' + port + '/t100',
        json: true
      }, (err, response, body) => {
        t.error(err)
        t.strictEqual(response.statusCode, 500)
        t.equal(body.message, 'call get /t1000 not found')
        t.pass('pass t100')
      })
    })
    console.log('t100')

    fastify.close().then(() => {
      t.endAll()
    })
  })
})
