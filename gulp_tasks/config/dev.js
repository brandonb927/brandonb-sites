// Development config
import { existsSync } from 'fs'
import { extname, join, resolve } from 'path'
import { parse } from 'url'
import { merge } from 'lodash'

import baseConfig from './base'

// Paths
const src = baseConfig.src.base
const srcAssets = baseConfig.src.assets
const build = resolve(src, 'build_dev')
const buildAssets = resolve(build, 'assets')

const devBuildConfigFilename = resolve(src, '_config_dev.yml')
const buildConfigFilename = `${
  baseConfig.jekyll.baseConfig
},${devBuildConfigFilename}`

// Config
const baseDevConfig = {
  buildDir: build,
  browsersync: {
    server: {
      baseDir: build,
      middleware: [
        (req, res, next) => {
          // middleware for clean, extensionless URLs
          let uri = parse(req.url)
          if (
            uri.pathname.length > 1 &&
            extname(uri.pathname) === '' &&
            existsSync(`${join(build, uri.pathname)}.html`)
          ) {
            req.url = `${uri.pathname}.html${uri.search || ''}`
          }
          next()
        },
      ],
    },
    port: 8888,
    ui: {
      port: 9001,
    },
    open: false,
  },
  delete: {
    src: build,
  },
  styles: {
    src: `${srcAssets}/styles/site.less`,
    dest: `${buildAssets}/styles`,
  },
  scripts: {
    src: `${srcAssets}/scripts/*.js`,
    dest: `${buildAssets}/scripts`,
  },
  copy: {
    media: {
      src: `${srcAssets}/media/**/*`,
      dest: `${buildAssets}/media`,
    },
  },
  jekyll: {
    src: src,
    dest: build,
    config: buildConfigFilename,
  },
  optimize: {
    html: {
      src: `${build}/**/*.html`,
      dest: build,
    },
  },
}

const devConfig = merge(baseDevConfig, baseConfig)

export default devConfig
