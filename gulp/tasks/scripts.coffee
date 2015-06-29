reload       = require('browser-sync').reload
gulp         = require('gulp')
coffee       = require('gulp-coffee')
concat       = require('gulp-concat')
duration     = require('gulp-duration')
plumber      = require('gulp-plumber')
sourcemaps   = require('gulp-sourcemaps')
configDev    = require('../config/dev').scripts
configProd   = require('../config/prod').scripts
errorHandler = require('../utils/errorHandler')


gulp.task('scripts:vendor:dev', () ->
  return gulp.src(configDev.vendor.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(concat(configDev.vendorPack))
    .pipe(duration('Concatenating vendor scripts for development'))
    .pipe(gulp.dest(configDev.dest))
)

gulp.task('scripts:js:dev', () ->
  return gulp.src(configDev.src.js)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(concat(configDev.extraPack))
    .pipe(duration('Concatenating extra scripts for development'))
    .pipe(gulp.dest(configDev.dest))
)

# Compile coffeescript files
gulp.task('scripts:coffee:dev', ['scripts:vendor:dev'], () ->
  return gulp.src(configDev.src.coffee)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write())
    .pipe(duration('Compiling Coffeescript to JS for development'))
    .pipe(gulp.dest(configDev.dest))
    .pipe(reload({stream:true}))
)

gulp.task('scripts:vendor:prod', () ->
  return gulp.src(configProd.vendor.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(concat(configProd.vendorPack))
    .pipe(duration('Concatenating vendor scripts for production'))
    .pipe(gulp.dest(configProd.dest))
)

gulp.task('scripts:js:prod', () ->
  return gulp.src(configProd.src.js)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(concat(configProd.extraPack))
    .pipe(duration('Concatenating extra scripts for production'))
    .pipe(gulp.dest(configProd.dest))
)

# Compile coffeescript files
gulp.task('scripts:coffee:prod', ['scripts:vendor:prod'], () ->
  return gulp.src(configProd.src.coffee)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write())
    .pipe(duration('Compiling Coffeescript to JS for production'))
    .pipe(gulp.dest(configProd.dest))
)


# Main tasks
gulp.task('scripts:dev', ['scripts:coffee:dev', 'scripts:js:dev'], () ->
  return gulp.src([
      "#{configDev.dest}/*.js"
    ])
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat(configDev.sitePack))
    .pipe(sourcemaps.write())
    .pipe(duration('Concatenating minified scripts for development'))
    .pipe(gulp.dest(configDev.dest))
)

gulp.task('scripts:prod', ['scripts:coffee:prod', 'scripts:js:prod'], () ->
  return gulp.src([
      "#{configProd.dest}/*.js"
    ])
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat(configProd.sitePack))
    .pipe(sourcemaps.write())
    .pipe(duration('Concatenating minified scripts for production'))
    .pipe(gulp.dest(configProd.dest))
)
