'use strict'

const fp = require('fastify-plugin')
const EventEmitter = require('events').EventEmitter

function fastifyCall (fastify, options, done) {
  fastify.register(require('fastify-routes'))
  const event = new EventEmitter()
  options = options || {}

  fastify.decorate('call', (path, { method, request, reply }) => {
    return new Promise((resolve, reject) => {
      if (path.substr(0, 1) !== '/') {
        path = ['/', path].join('')
      }
      const call = fastify.routes.get(path)
      method = method.toLocaleLowerCase()
      if (call && call[method]) {
        const route = [request.raw.method.toLocaleLowerCase(), request.raw.originalUrl].join('')
        const originSend = reply.send
        reply.send = (payload) => {
          return event.emit(route, payload)
        }
        event.once(route, async (payload) => {
          reply.send = originSend
          resolve(payload)
        })
        call[method].handler(request, reply)
      } else {
        // console.error(method, path + ' call not found')
        reject(new Error('call ' + method + ' ' + path + ' not found'))
      }
    })
  })
  done()
}

module.exports = fp(fastifyCall, {
  fastify: '>= 1.0.0',
  name: 'fastify-call'
})
