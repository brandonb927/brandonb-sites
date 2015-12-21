# Production config

path = require('path')
_ = require('lodash')

baseConfig = require('./base')

# Paths
src = baseConfig.src.base
srcAssets = baseConfig.src.assets
build = path.resolve(src, 'build_prod')
buildAssets = path.resolve(build, 'assets')

prodBuildConfigFilename = path.resolve(src, '_config_prod.yml')
buildConfigFilename = "#{baseConfig.jekyll.baseConfig},#{prodBuildConfigFilename}"


# Config
baseProdConfig =
  deploy:
    src: build
    dest: build
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
  optimize:
    styles:
      src: [
        "#{buildAssets}/styles/*.css"
      ]
      dest: "#{buildAssets}/styles"
      options:
        keepSpecialComments: 0
    scripts:
      src: [
        "#{buildAssets}/scripts/*.js"
      ]
      dest: "#{buildAssets}/scripts"
      options: {}
    images:
      src: "#{srcAssets}/images/*"
      dest: "#{srcAssets}/images"
      options:
        optimizationLevel: 3
        progessive: true
        interlaced: true
    html:
      src: "#{build}/**/*.html"
      dest: build
      options:
        collapseWhitespace: true
        conservativeCollapse: true

prodConfig = _.merge baseProdConfig, baseConfig

module.exports = prodConfig
