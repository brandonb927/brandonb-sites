# Production config

path        = require("path")

baseConfig  = require("./base")

# Paths
src         = baseConfig.src.base
srcAssets   = baseConfig.src.assets
build       = path.resolve(src, "build_prod")
buildAssets = path.resolve(build, "assets")

prodBuildConfigFilename = path.resolve(src, "_config_prod.yml")
buildConfigFilename     = "#{baseConfig.jekyll.config},#{prodBuildConfigFilename}"


# Config
module.exports =
  deploy:
    src: build
    dest: build
    domain: "brandonb.io"
    s3:
      bucket: 'brandonb-io-images'
  delete:
    src: [
      build
    ]
  styles:
    src: "#{srcAssets}/styles/site.less"
    dest: "#{buildAssets}/styles"
    autoprefixer: baseConfig.autoprefixer
  scripts:
    src:
      coffee: "#{srcAssets}/scripts/*.coffee"
      js: "#{srcAssets}/scripts/*.js"
    dest: "#{buildAssets}/scripts"
    vendorPack: "vendor-pack.js"
    extraPack: "extra-pack.js"
    sitePack: "site-pack.js"
    options:
      debug: true
    vendor:
      src: [
        "#{srcAssets}/bower_components/picturefill/dist/picturefill.js"
      ]
  size:
    showFiles: true
  copy:
    images:
      src: "#{srcAssets}/images/**/*"
      dest: "#{buildAssets}/images"
  jekyll:
    src: src
    dest: build
    config: buildConfigFilename
  optimize:
    styles:
      src: [
        "#{buildAssets}/styles/**/*.css"
      ]
      dest: "#{buildAssets}/styles"
      options:
        keepSpecialComments: 0
    scripts:
      src: [
        "#{buildAssets}/js/**/*.js"
      ]
      dest: "#{buildAssets}/js"
      options: {}
    images:
      src: "#{srcAssets}/images/**/*"
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
