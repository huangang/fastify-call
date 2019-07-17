'use strict'

const fastify = require('fastify')()
fastify.register(require('.'))

fastify.get('/t1', {
  preHandler: (request, reply, done) => {
    // console.log('preHandler get t1')
    done()
  },
  handler: (request, reply) => {
    reply.send({ hello: 'get t1' })
  }
})

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

fastify.post('/t1', {
  preHandler: async (request, reply, done) => {
    // console.log('222')
    await sleep(1000)
    // console.log('preHandler post t1')
    done && done()
    return 1
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
    // console.log('call t2')
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
  return fastify.call('/t13', 'post')
})

fastify.get('/t15', async (request, reply) => {
  // fastify.call.get('t2').then((data) => {
  //   console.log('t2', data)
  // }).catch((err) => {
  //   console.error('t2 error', err)
  // })
  // fastify.call.get('t3').then((data) => {
  //   console.log('t3', data)
  // }).catch((err) => {
  //   console.error('t4 error', err)
  // })
  // fastify.call.get('t4').then((data) => {
  //   console.log('t4', data)
  // }).catch((err) => {
  //   console.error('t4 error', err)
  // })
  // fastify.call.get('t5').then((data) => {
  //   console.log('t5', data)
  // }).catch((err) => {
  //   console.error('t5 error', err)
  // })
  try { await fastify.call.get('t2') } catch (err) {}
  try { await fastify.call.get('t3') } catch (err) {}
  try { await fastify.call.get('t4') } catch (err) {}
  try { await fastify.call.get('t5') } catch (err) {}
  return fastify.call.get('t6')
})

fastify.get('/t100', async (request, reply) => {
  return fastify.call('t1000')
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
