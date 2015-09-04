path = require("path")

base = path.normalize("#{__dirname}/../..")

# Export the base config
baseConfig =
  src:
    base: base
    assets: path.resolve(base, "_assets")
  deploy:
    domain: 'brandonb.io'
    s3:
      bucket: 'brandonb-io-images'
  jekyll:
    baseConfig: path.resolve(base, "_config.yml")
  styles:
    autoprefixer:
      cascade: true
      browsers: [
        "last 2 versions"
        "ie 9"
        "opera 12.1"
        "ios 6"
        "android 4"
      ]
  size:
    showFiles: true

baseConfig.watch =
  jekyll: [
    "#{baseConfig.src.base}/*.yml"
    "#{baseConfig.src.base}/_data/**/*.{json,yml}"
    "#{baseConfig.src.base}/{index,404}.html"
    "#{baseConfig.src.base}/{_includes,_layouts,_pages,_posts}/**/*.{md,html}"
  ]
  styles: "#{baseConfig.src.assets}/styles/**/*.less"
  scripts: "#{baseConfig.src.assets}/scripts/**/*.{js,coffee}"
  images: "#{baseConfig.src.assets}/images/**/*"

baseConfig.scripts =
  sitePack: 'site-pack.js'
  vendorPack: 'vendor-pack.js'
  site: 'site.js'
  options:
    debug: true
  vendor:
    src: [
      "node_modules/picturefill/dist/picturefill.js"
      "node_modules/zepto/zepto.min.js"
    ]

module.exports = baseConfig
