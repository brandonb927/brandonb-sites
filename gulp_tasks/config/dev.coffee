# Development config

fs = require('fs')
path = require('path')
url = require('url')
_ = require('lodash')

baseConfig = require('./base')

# Paths
src = baseConfig.src.base
srcAssets = baseConfig.src.assets
build = path.resolve(src, 'build_dev')
buildAssets = path.resolve(build, 'assets')

devBuildConfigFilename = path.resolve(src, '_config_dev.yml')
buildConfigFilename = "#{baseConfig.jekyll.baseConfig},#{devBuildConfigFilename}"


# Config
baseDevConfig =
  browsersync:
    server:
      baseDir: build
      middleware: [
        (req, res, next) -> # middleware for clean, extensionless URLs
          uri = url.parse(req.url)

          if uri.pathname.length > 1 and \
              path.extname(uri.pathname) is '' and \
              fs.existsSync("#{path.join(build, uri.pathname)}.html")
            req.url = "#{uri.pathname}.html#{uri.search or ''}"

          next()
      ]
    port: 8888
    ui:
      port: 9001
    open: false
  delete:
    src: [
      build
    ]
  styles:
    src: "#{srcAssets}/styles/site.less"
    dest: "#{buildAssets}/styles"
  scripts:
    src:
      coffee: "#{srcAssets}/scripts/*.coffee"
      js: "#{srcAssets}/scripts/*.js"
    dest: "#{buildAssets}/scripts"
  copy:
    images:
      src: "#{srcAssets}/images/*"
      dest: "#{buildAssets}/images"
  jekyll:
    src: src
    dest: build
    config: buildConfigFilename

devConfig = _.merge baseDevConfig, baseConfig

module.exports = devConfig
