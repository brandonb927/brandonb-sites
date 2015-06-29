gulp         = require('gulp')
duration     = require('gulp-duration')
sourcemaps   = require('gulp-sourcemaps')
imagemin     = require('gulp-imagemin')
minifycss    = require('gulp-minify-css')
minifyHTML   = require('gulp-minify-html')
plumber      = require('gulp-plumber')
rename       = require('gulp-rename')
size         = require('gulp-size')
uglify       = require('gulp-uglify')
runSequence  = require('run-sequence')
config       = require('../config/prod').optimize
sizeConfig   = require('../config/prod').size
errorHandler = require('../utils/errorHandler')

# Optimize image assets
gulp.task('optimize:images', () ->
  return gulp.src(config.images.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(imagemin(config.images.options))
    .pipe(duration('Optimizing images for production'))
    .pipe(gulp.dest(config.images.dest))
    .pipe(size(sizeConfig))
)

# Minify CSS styles
gulp.task('optimize:styles', () ->
  return gulp.src(config.styles.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(minifycss(config.styles.options))
    .pipe(duration('Optimizing and minifying CSS for production'))
    .pipe(gulp.dest(config.styles.dest))
    .pipe(size(sizeConfig))
)

# Optimize, minify and uglify JS
gulp.task('optimize:scripts', () ->
  return gulp.src(config.scripts.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(uglify(config.scripts.options))
    .pipe(duration('Optimizing, minifying and minifying JS for production'))
    .pipe(gulp.dest(config.scripts.dest))
    .pipe(size(sizeConfig))
)

# Optimize and minify HTML
gulp.task('optimize:html', () ->
  return gulp.src(config.html.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(minifyHTML(config.html.options))
    .pipe(duration('Optimizing and minifying HTML for production'))
    .pipe(gulp.dest(config.html.dest))
    .pipe(size(sizeConfig))
)

gulp.task('optimize', [
  'optimize:images'
  'optimize:styles'
  'optimize:scripts'
  'optimize:html'
])
