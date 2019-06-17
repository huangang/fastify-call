'use strict'

const fp = require('fastify-plugin')
const EventEmitter = require('events').EventEmitter

function fastifyCall (fastify, options, done) {
  fastify.register(require('fastify-routes'))
  let _request
  let _reply
  fastify.addHook('preHandler', (request, reply, done) => {
    _reply = reply
    _request = request
    done()
  })

  const event = new EventEmitter()
  options = options || {}

  let callHandler = (path, params, method = 'get') => {
    if (method === 'post' || method === 'put') {
      _request.body = params
    } else {
      _request.query = params
    }
    return new Promise((resolve, reject) => {
      if (path.substr(0, 1) !== '/') {
        path = ['/', path].join('')
      }
      const call = fastify.routes.get(path)
      method = method.toLocaleLowerCase()
      if (call && call[method]) {
        const route = [_request.raw.method.toLocaleLowerCase(), _request.raw.originalUrl].join('')
        const originSend = _reply.send
        _reply.send = (payload) => {
          _reply.send = originSend
          event.emit(route, payload)
        }
        let listener = (payload) => {
          resolve(payload)
        }
        event.once(route, listener)
        let callPromise = call[method].handler(_request, _reply)
        if (callPromise && typeof callPromise.then === 'function') {
          callPromise.then((payload) => {
            _reply.send = originSend
            event.off(route, listener)
            listener(payload)
          })
        }
      } else {
        // console.error(method, path + ' call not found')
        reject(new Error('call ' + method + ' ' + path + ' not found'))
      }
    })
  }

  let call = (path, params, method = 'get') => {
    return callHandler(path, params, method)
  }

  const METHODS = ['get', 'post', 'delete', 'put', 'head', 'options', 'patch']
  METHODS.forEach((method) => {
    call[method] = (path, params) => {
      return callHandler(path, params, method)
    }
  })

  fastify.decorate('call', call)

  done()
}

module.exports = fp(fastifyCall, {
  fastify: '>= 1.1.0',
  name: 'fastify-call'
})
