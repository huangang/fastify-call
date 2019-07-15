# fastify-call

Fastify plugin to call self method.

[![Build Status](https://travis-ci.org/huangang/fastify-call.svg?branch=master)](https://travis-ci.org/huangang/fastify-call)
[![NPM version](https://img.shields.io/npm/v/fastify-call.svg?style=flat)](https://www.npmjs.com/package/fastify-call)
## Install
```
npm i fastify-call --save
```
## Usage

```js
'use strict'

const fastify = require('fastify')()

fastify.register(require('fastify-call'))

fastify.get('/t1', function (request, reply) {
  reply.send({ 'hello': 't1' })
})

fastify.get('/t2', function (request, reply) {
  return fastify.call('t1').then((data) => {
    data.world = 't2'
    return reply.send(data)
  })
})

fastify.get('/t3', function (request, reply) {
  return fastify.call.post('t1', { a: 1 }).then((data) => {
    data.world = 't3'
    return reply.send(data)
  })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```

## Notice
if your service use too many `fastify-call`, suggestion use `async await` and with `try ··· catch ···`      
like [this]('./example.js#L112')