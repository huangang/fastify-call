'use strict'

const fp = require('fastify-plugin')

function isJson (text) {
  return (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@') // eslint-disable-line no-useless-escape
    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']') // eslint-disable-line no-useless-escape
    .replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
}

function fastifyCall (fastify, options, done) {
  // options = options || {}
  let headers
  fastify.addHook('onRequest', (request, reply, done) => {
    headers = request.headers
    done()
  })

  const call = (path, params, method = 'get') => {
    if (!path) {
      throw new Error(`'path is ${path}`)
    }
    if (typeof params === 'string') {
      let _method
      if (typeof method === 'object') {
        _method = Object.assign({}, method)
      }
      method = params
      params = _method || {}
    }
    method = method.toLowerCase()
    let query = {}
    let payload = {}
    if (method === 'post' || method === 'put') {
      payload = params
    } else {
      query = params
    }
    return fastify.inject({
      method,
      url: path,
      query: query,
      payload: payload,
      headers
    }).then(response => {
      let payload = response.payload
      isJson(payload) && (payload = JSON.parse(payload))
      if (response.statusCode >= 400) {
        throw payload
      }
      return payload
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
