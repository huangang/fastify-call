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
  return fastify.call('t1', { method: 'get', request, reply }).then((data) => {
    data.world = 't2'
    return reply.send(data)
  })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```