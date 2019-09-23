'use strict'

const fp = require('fastify-plugin')

function isJson (text) {
  return (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@') // eslint-disable-line no-useless-escape
    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']') // eslint-disable-line no-useless-escape
    .replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
}

function fastifyCall (fastify, opts, done) {
  const call = (options = { }) => {
    let path
    let params
    let method
    let headers
    if (typeof options === 'string') {
      path = options
      params = {}
      method = 'get'
      headers = {}
    } else if (typeof options === 'object') {
      path = options.path
      params = options.params || {}
      method = options.method || 'get'
      headers = options.headers || {}
      for (var prop in headers) {
        headers[prop.toLowerCase()] = headers[prop]
        delete headers[prop]
      }
    } else {
      throw new Error('call options error')
    }
    if (!path) {
      throw new Error(`'path is ${path}`)
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
    call[method] = (path, params = {}, headers = {}) => {
      if (typeof path === 'object') {
        path = path.path
        params = path.params || {}
        headers = path.headers || {}
      }
      return call({ path, params, headers, method })
    }
  })

  fastify.decorate('call', call)

  done()
}

module.exports = fp(fastifyCall, {
  fastify: '>= 1.1.0',
  name: 'fastify-call'
})
