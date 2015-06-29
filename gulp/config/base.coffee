path = require("path")

base = path.normalize("#{__dirname}/../..")

# Export the base config
module.exports =
  src:
    base: base
    assets: path.resolve(base, "_assets")
  jekyll:
    config: path.resolve(base, "_config.yml")
  autoprefixer:
    cascade: true
    browsers: [
      "last 2 versions"
      "ie 9"
      "opera 12.1"
      "ios 6"
      "android 4"
    ]
