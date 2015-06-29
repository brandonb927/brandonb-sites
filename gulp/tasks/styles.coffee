notify       = require('browser-sync').notify
reload       = require('browser-sync').reload
gulp         = require('gulp')
autoprefixer = require('gulp-autoprefixer')
duration     = require('gulp-duration')
less         = require('gulp-less')
plumber      = require('gulp-plumber')
sourcemaps   = require('gulp-sourcemaps')
configDev    = require('../config/dev').styles
configProd   = require('../config/prod').styles
errorHandler = require('../utils/errorHandler')


# Compile LESS into CSS, and add vendor prefixes
gulp.task('styles:dev', () ->
  notify('Compiling styles for development')

  return gulp.src(configDev.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer(configDev.autoprefixer))
    .pipe(duration('Compiling LESS and vendor prefixing CSS for development'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(configDev.dest))
    .pipe(reload({stream:true}))
)

gulp.task('styles:prod', () ->
  notify('Compiling styles for production')

  return gulp.src(configProd.src)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer(configProd.autoprefixer))
    .pipe(duration('Compiling LESS and vendor prefixing CSS for production'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(configProd.dest))
)
