# Development config

path        = require("path")

baseConfig  = require("./base")

# Paths
src         = baseConfig.src.base
srcAssets   = baseConfig.src.assets
build       = path.resolve(src, 'build_dev')
buildAssets = path.resolve(build, 'assets')

devBuildConfigFilename = path.resolve(src, "_config_dev.yml")
buildConfigFilename    = "#{baseConfig.jekyll.config},#{devBuildConfigFilename}"


# Config
module.exports =
  browsersync:
    server:
      baseDir: build
    port: 8888
    ui:
      port: 9001
    open: false
    notify:
      styles: ["padding: 12px; font-family: sans-serif; position: fixed; font-size: 14px; z-index: 10000; left: 50%; bottom: 0; width: 200px; margin: 0; margin-left: -100px; border-top-left-radius: 3px; border-top-right-radius: 3px; color: #fff; text-align: center; background-color: rgba(0, 0, 0, .65);"]
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
  copy:
    images:
      src: "#{srcAssets}/images/**/*"
      dest: "#{buildAssets}/images"
  jekyll:
    src: src
    dest: build
    config: buildConfigFilename
  watch:
    jekyll: [
      "#{src}/*.yml"
      "#{src}/_data/**/*.{json,yml}"
      "#{src}/{index,404}.html"
      "#{src}/{_includes,_layouts,_pages,_posts}/**/*.{md,html}"
    ]
    styles: "#{srcAssets}/styles/**/*.less"
    scripts: "#{srcAssets}/scripts/**/*.{js,coffee}"
    images: "#{srcAssets}/images/**/*"
