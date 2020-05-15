const Tape = require('tape')
const Hapi = require('@hapi/hapi')
const Plugin = require('../lib')

Tape('catalyst-render (bad init)', async (t) => {
  t.plan(1)
  const server = Hapi.server()
  try {
    await server.register([{ plugin: Plugin }])
    t.fail('no options failed to throw')
  } catch (err) {
    t.ok(err, 'no options passed does throw error')
  }
})

Tape('catalyst-render (init with resolveAssetHelper)', async (t) => {
  t.plan(7)
  const options = {
    routes: [],
    resolveAssetHelper: { name: 'apple', helper: (name) => name }
  }
  const server = {
    register ({ plugin }, options) {
      t.equals(plugin.pkg.name, '@hapi/vision', 'Vision passed')
      t.notOk(options, 'undefined options')
    },
    views (options) {
      t.ok(options.relativeTo.endsWith('/src/server'), 'serving from src/server')
      t.ok(options.engines.hbs, 'Handlebars registered')
      return {
        registerHelper (name, helper) {
          t.equals(name, 'apple', 'helper name passed')
          t.equals(typeof helper, 'function', 'helper function passed')
        }
      }
    },
    route (routes) {
      t.equal(routes.length, 0, 'empty routes')
    }
  }
  const { register } = Plugin.plugin
  await register(server, options)
})

Tape('catalyst-render (configuration/dev/default)', async (t) => {
  t.plan(5)
  const options = {
    routes: []
  }
  const server = {
    register ({ plugin }, options) {
      t.equals(plugin.pkg.name, '@hapi/vision', 'Vision passed')
      t.notOk(options, 'undefined options')
    },
    views (options) {
      t.ok(options.relativeTo.endsWith('/src/server'), 'serving from src/server')
      t.ok(options.engines.hbs, 'Handlebars registered')
    },
    route (routes) {
      t.equal(routes.length, 0, 'empty routes')
    }
  }
  const { register } = Plugin.plugin
  await register(server, options)
})

Tape('catalyst-render (configuration/prod)', async (t) => {
  t.plan(5)
  const options = {
    routes: []
  }
  const server = {
    register ({ plugin }, options) {
      t.equals(plugin.pkg.name, '@hapi/vision', 'Vision passed')
      t.notOk(options, 'undefined options')
    },
    views (options) {
      t.ok(options.relativeTo.endsWith('/build/server'), 'serving from build/server')
      t.ok(options.engines.hbs, 'Handlebars registered')
    },
    route (routes) {
      t.equal(routes.length, 0, 'empty routes')
    }
  }
  const { register } = Plugin.plugin
  process.env.NODE_ENV = 'production'
  await register(server, options)
  delete process.env.NODE_ENV
})

Tape('catalyst-render (views and vision options)', async (t) => {
  t.plan(7)
  const options = {
    routes: [],
    visionOptions: { isCached: true },
    viewsOptions: { partialsPath: 'src/server/templates/partials' }
  }
  const server = {
    register ({ plugin }, options) {
      t.equals(plugin.pkg.name, '@hapi/vision', 'Vision passed')
      t.ok(options, 'options passed')
      t.ok(options.isCached, 'isCached passed')
    },
    views (options) {
      t.ok(options.relativeTo.endsWith('/src/server'), 'serving from src/server')
      t.ok(options.engines.hbs, 'Handlebars registered')
      t.ok(options.partialsPath === 'src/server/templates/partials')
    },
    route (routes) {
      t.equal(routes.length, 0, 'empty routes')
    }
  }
  const { register } = Plugin.plugin
  await register(server, options)
})

Tape('catalyst-render (happy path)', async (t) => {
  t.plan(3)

  const options = {
    routes: [
      {
        route: {
          method: 'GET',
          path: '/test',
          handler (request, h) {
            const component = request.pre.component
            const template = request.pre.template
            return { template, component }
          }
        },
        component: { works: true },
        template: 'abc'
      }
    ]
  }

  const server = Hapi.server()
  await server.register([{ plugin: Plugin, options }])

  const { payload, statusCode } = await server.inject('/test')

  const data = JSON.parse(payload)

  t.assert(statusCode, 200, 'status code 200')
  t.assert(data.template, 'abc', 'template passes')
  t.assert(data.component.works, true, 'component passes')
})
