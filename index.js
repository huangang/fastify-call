'use strict'

const fp = require('fastify-plugin')

function isPromise (func) {
  return func && typeof func.then === 'function'
}

function fastifyCall (fastify, options, done) {
  let routes = new Map()
  fastify.addHook('onRoute', (routeOptions) => {
    const { method, schema, url, logLevel, prefix, bodyLimit, handler, preHandler } = routeOptions
    const _method = Array.isArray(method) ? method : [method]

    _method.forEach(method => {
      const key = method.toLowerCase()
      const route = { method, schema, url, logLevel, prefix, bodyLimit, handler, preHandler }

      if (routes.has(url)) {
        let current = routes.get(url)
        routes.set(url, Object.assign(current, { [key]: route }))
      } else {
        routes.set(url, { [key]: route })
      }
    })
  })

  let _request
  let _reply
  fastify.addHook('preHandler', (request, reply, done) => {
    _reply = reply
    _request = request
    done()
  })

  // options = options || {}

  let call = (path, params, method = 'get') => {
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
    return new Promise(async (resolve, reject) => {
      if (path.substr(0, 1) !== '/') {
        path = ['/', path].join('')
      }
      const call = routes.get(path)
      if (call && call[method]) {
        const originSend = _reply.send
        const originCode = _reply.code
        let reset = false
        const resetReply = () => {
          if (reset) {
            return
          }
          _reply.send = originSend
          _reply.code = originCode
          reset = true
        }
        _reply.send = (payload) => {
          // console.log('path %s method %s payload %j', path, method, payload)
          resetReply()
          resolve(payload)
        }
        _reply.code = (code) => {
          _reply.code = originCode
          code >= 400 && (resolve = reject) // code gte 400 should reject result
          return _reply.code(code)
        }
        let done = () => {
          let callHandler = call[method].handler(_request, _reply)
          if (isPromise(callHandler)) {
            callHandler.then((payload) => {
              resetReply()
              if (typeof payload !== 'undefined') {
                resolve(payload)
              }
            }).catch((err) => {
              resetReply()
              reject(err)
            })
          }
        }
        if (call[method].preHandler) {
          let preHandler = call[method].preHandler(_request, _reply, () => {})
          // if (Object.prototype.toString.call(preHandler) === '[object AsyncFunction]') {
          //   await preHandler(_request, _reply, () => {})
          //   done()
          // } else {
          //   preHandler(_request, _reply, done)
          // }
          if (isPromise(preHandler)) {
            preHandler.then(() => {
              done()
            })
          } else {
            done()
          }
        } else {
          done()
        }
      } else {
        // console.error(method, path + ' call not found')
        reject(new Error('call ' + method + ' ' + path + ' not found'))
      }
    })
  }

  const METHODS = ['get', 'post', 'delete', 'put', 'head', 'options', 'patch']
  METHODS.forEach((method) => {
    call[method] = (path, params = {}) => {
      return call(path, params, method)
    }
  })

  fastify.decorate('call', call)

  done()
}

module.exports = fp(fastifyCall, {
  fastify: '>= 1.1.0',
  name: 'fastify-call'
})
