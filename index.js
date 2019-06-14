'use strict'

const fp = require('fastify-plugin')
const EventEmitter = require('events').EventEmitter

function fastifyCall (fastify, options, done) {
  fastify.register(require('fastify-routes'))
  const event = new EventEmitter()
  options = options || {}
  let calls = {}

  fastify.addHook('onSend', (request, reply, payload, next) => {
    const route = [request.raw.method.toLocaleLowerCase() + request.raw.originalUrl].join('')
    if (calls[route]) {
      event.emit(route, payload, next)
    }
    next()
  })

  fastify.decorate('call', (path, { method, request, reply }) => {
    method = method.toLocaleLowerCase()
    if (path.substr(0, 1) !== '/') {
      path = ['/', path].join('')
    }
    const call = fastify.routes.get(path)
    const route = [request.raw.method.toLocaleLowerCase() + request.raw.originalUrl].join('')
    calls[route] = true
    call[method].handler(request, reply)
    return new Promise((resolve, reject) => {
      event.on(route, (payload, next) => {
        if (typeof payload === 'string') {
          try {
            payload = JSON.parse(payload)
          } catch (e) {}
        }
        next(resolve(payload))
      })
    })
  })
  done()
}

module.exports = fp(fastifyCall, {
  fastify: '>= 1.0.0',
  name: 'fastify-call'
})
