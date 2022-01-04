# @vrbo/catalyst-render
[![NPM Version](https://img.shields.io/npm/v/@vrbo/catalyst-render.svg?style=flat-square)](https://www.npmjs.com/package/@vrbo/catalyst-render)
![](https://github.com/ExpediaGroup/catalyst-render/workflows/Node_CI/badge.svg)
[![Dependency Status](https://david-dm.org/expediagroup/catalyst-render.svg?theme=shields.io)](https://david-dm.org/expediagroup/catalyst-render)
[![NPM Downloads](https://img.shields.io/npm/dm/@vrbo/catalyst-render.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@vrbo/catalyst-render)

*   [Introduction](#introduction)
*   [Usage](#usage)
*   [Api](#api)
*   [Development](#development)
*   [Further Reading](#further-reading)

## Introduction
A Hapi.js plugin that works with the [catalyst-server](https://github.com/expediagroup/catalyst-server) to aid in server-side rendering using Handlebars and React. It allows you to relate a Handlebars template and a React component to a route. This route will automatically be registered with the server and will decorate `request.pre.component` with the react component and the `request.pre.template` with the template.  It will also register @hapi/vision and server views with Handlebars rendering for the page scaffolding

## Usage

Install:
```
npm install @vrbo/catalyst-render
```

Register the plugin in the application's manifest:

```json
...
"register": {
    "catalyst-render": {
        "plugin": "require:@vrbo/catalyst-render",
        "options": {
            "routes": [{
                "route": "require:./routes/application.js",
                "component": "require:../components/App/server.js",
                "template": "./templates/welcome.hbs"
            }]
        }
    }
}
...
```

The `require:./routes/application.js` points to a route file that exports a [Hapi.js route object](https://hapijs.com/tutorials/routing) and will look something like this (with a very basic render):

```javascript
module.exports = {
    method: 'GET',
    path: '/',
    options: {
        handler(request, h){
            const template = request.pre.template;
            const Component = request.pre.component;
            const body = ReactDOMServer.renderToString(<Component/>);
            return h.view(template, { body })
        },
        id: 'root'
    }
}
```

## API

### Register the plugin `server.register(server, options)`

| Param | Type | Description |
| --- | --- |  --- |
| server | <code>object</code> | Hapi.js server |
| options | <code>object</code> | Overriding options |
| options.routes | <code>array</code> | A list of [route](###route) objects to register on server. |
| [options.viewsOptions] | <code>object</code> | Options to add to (or override) when on `server.views` method is called for adding things like partials ,, layouts, helpers and others. |
| [options.visionOptions] | <code>object</code> | Proxy for options when registering [@hapi/vision](https://www.npmjs.com/package/@hapi/vision). |
| [options.resolveAssetHelper] | <code>object</code> | A Handlebars helper to help resolve static assets, as in publishing to a CDN. |
| options.resolveAssetHelper.name | <code>string</code> | Name of helper. |
| options.resolveAssetHelper.helper | <code>function</code> | Helper function. |

### Route
This is an object for registering routes, React components, and templates

| Property | Type | Description |
| --- | --- |  --- |
| route | <code>object</code> | [Hapi.js route object](https://hapijs.com/tutorials/routing) to register on server. |
| component | <code>object</code> | A React component to render.  _Available as `request.pre.component` in handler in above route._ |
| template | <code>array</code> | A Handlebars template to use to render page scaffold.  _Available as `request.pre.template` in handler in above route._ |


## Further Reading

*   [License](LICENSE)
*   [Code of conduct](CODE_OF_CONDUCT.md)
*   [Contributing](CONTRIBUTING.md)
*   [Changelog](CHANGELOG.md)
