'use strict'

const fp = require('fastify-plugin')
const Emitter = require('component-emitter')

function fastifyCall (fastify, options, done) {
  fastify.register(require('fastify-routes'))
  let _request
  let _reply
  fastify.addHook('preHandler', (request, reply, done) => {
    _reply = reply
    _request = request
    done()
  })

  const event = new Emitter()
  // options = options || {}

  let callHandler = (path, params, method = 'get') => {
    if (typeof params === 'string') {
      let _method
      if (typeof method === 'object') {
        _method = Object.assign({}, method)
      }
      method = params
      params = _method || {}
    }
    method = method.toLowerCase()
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
      if (call && call[method]) {
        const route = [method, path].join('')
        const originSend = _reply.send
        const originCode = _reply.code
        const resetReply = () => {
          _reply.send = originSend
          _reply.code = originCode
        }
        _reply.send = (payload) => {
          resetReply()
          event.emit(route, payload)
        }
        _reply.code = (code) => {
          _reply.code = originCode
          if (parseInt(code) !== 200) {
            resolve = reject
          }
          return _reply.code(code)
        }
        let listener = (payload) => {
          resolve(payload)
        }
        event.once(route, listener)
        let callPromise = call[method].handler(_request, _reply)
        if (callPromise && typeof callPromise.then === 'function') {
          callPromise.then((payload) => {
            resetReply()
            event.off(route, listener)
            if (typeof payload !== 'undefined') {
              resolve(payload)
            }
          }).catch((err) => {
            resetReply()
            reject(err)
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
    call[method] = (path, params = {}) => {
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
