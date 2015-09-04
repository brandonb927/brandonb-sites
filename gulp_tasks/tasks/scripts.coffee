runSequence = require('run-sequence')
reload = require('browser-sync').reload
gulp = require('gulp')
coffee = require('gulp-coffee')
concat = require('gulp-concat-util')
duration = require('gulp-duration')
plumber = require('gulp-plumber')
sourcemaps = require('gulp-sourcemaps')
baseConfig = require('../config/base')
configDev = require('../config/dev').scripts
configProd = require('../config/prod').scripts
errorHandler = require('../utils/errorHandler')


# Dev tasks
gulp.task('scripts:vendor:dev', () ->
  return gulp.src(configDev.vendor.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(concat(configDev.vendorPack, sep: ';'))
    .pipe(duration('Concatenating vendor scripts for development'))
    .pipe(gulp.dest(configDev.dest))
)

# Compile coffeescript files
gulp.task('scripts:coffee:dev', () ->
  return gulp.src(configDev.src.coffee)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write())
    .pipe(duration('Compiling Coffeescript to JS for development'))
    .pipe(gulp.dest(configDev.dest))
    .pipe(reload({stream:true}))
)

# Main tasks
gulp.task('scripts:build:dev', () ->
  return gulp.src([
      "#{configDev.dest}/#{baseConfig.scripts.vendorPack}"
      "#{configDev.dest}/#{baseConfig.scripts.site}"
    ])
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init(loadMaps: true))
    .pipe(concat(configDev.sitePack, sep: ';'))
    .pipe(sourcemaps.write())
    .pipe(duration('Concatenating minified scripts for development'))
    .pipe(gulp.dest(configDev.dest))
)

# Prod tasks
gulp.task('scripts:vendor:prod', () ->
  return gulp.src(configProd.vendor.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(concat(configProd.vendorPack, sep: ';'))
    .pipe(duration('Concatenating vendor scripts for production'))
    .pipe(gulp.dest(configProd.dest))
)

# Compile coffeescript files
gulp.task('scripts:coffee:prod', () ->
  return gulp.src(configProd.src.coffee)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write())
    .pipe(duration('Compiling Coffeescript to JS for production'))
    .pipe(gulp.dest(configProd.dest))
)

gulp.task('scripts:build:prod', () ->
  return gulp.src([
      "#{configProd.dest}/#{baseConfig.scripts.vendorPack}"
      "#{configProd.dest}/#{baseConfig.scripts.site}"
    ])
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init(loadMaps: true))
    .pipe(concat(configProd.sitePack, sep: ';'))
    .pipe(sourcemaps.write())
    .pipe(duration('Concatenating minified scripts for production'))
    .pipe(gulp.dest(configProd.dest))
)

# Main tasks
gulp.task('scripts:dev', (callback) ->
  runSequence(
    'scripts:vendor:dev'
    'scripts:coffee:dev'
    'scripts:build:dev'
    callback
  )
)

gulp.task('scripts:prod', (callback) ->
  runSequence(
    'scripts:vendor:prod'
    'scripts:coffee:prod'
    'scripts:build:prod'
    callback
  )
)
