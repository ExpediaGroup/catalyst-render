/*
Copyright 2019 Expedia Group, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const Path = require('path')
const Handlebars = require('handlebars')
const Vision = require('@hapi/vision')
const Joi = require('@hapi/joi')
const debug = require('debug')('catalyst-render')
const { name, version } = require('../package.json')

const internals = {
  schema: Joi.object().keys({
    routes: Joi.array().items(
      Joi.object().keys({
        route: Joi.object().required().description('Proxy for Hapi.js route object'),
        component: Joi.any().required().description('React component to render'),
        template: Joi.string().required().description('Handlebars template to use')
      })
    ).required(),
    resolveAssetHelper: Joi.object().keys(
      {
        name: Joi.string().required(),
        helper: Joi.func().required()
      }
    ).optional().description('A Handlebars helper to resolve static asset paths'),
    viewsOptions: Joi.object().optional().description('Handlebars view options to merge/override defaults in server.views'),
    visionOptions: Joi.object().optional().description('Options to override when registering vision')
  })
}

async function register (server, options) {
  const { routes, viewsOptions, visionOptions, resolveAssetHelper } = await internals.schema.validateAsync(options)
  const isProd = (process.env.NODE_ENV || 'development').toLocaleLowerCase() === 'production'
  const relativeTo = Path.join(process.cwd(), isProd ? 'build' : 'src', 'server')
  const defaultViewsOptions = { relativeTo: relativeTo, engines: { hbs: Handlebars } }

  debug('Registering vision for rendering views.')
  await server.register(Vision, visionOptions)
  // Setup Handlebars for our base page template, simple Handlebars setup if none given
  const views = { ...defaultViewsOptions, ...(viewsOptions || {}) }
  const viewManager = server.views(views)
  if (resolveAssetHelper) {
    const { name, helper } = resolveAssetHelper
    viewManager.registerHelper(name, helper)
  }

  debug('Building routes')
  const serverRoutes = []
  for (const { route, template, component } of routes) {
    // do not over write the options
    route.options = route.options || {}

    // do not over write the pre
    route.options.pre = route.options.pre || []

    // add template and component on the request pre
    route.options.pre.push({ method: () => { return template }, assign: 'template' })
    route.options.pre.push({ method: () => { return component }, assign: 'component' })

    serverRoutes.push(route)
  }
  server.route(serverRoutes)
}

exports.plugin = { name, version, register }
