import gulp from 'gulp'
import duration from 'gulp-duration'
import sourcemaps from 'gulp-sourcemaps'
import imagemin from 'gulp-imagemin'
import minifycss from 'gulp-minify-css'
import minifyHTML from 'gulp-minify-html'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'
import size from 'gulp-size'
import uglify from 'gulp-uglify'
import runSequence from 'run-sequence'

import config from '../config/prod'
import sizeConfig from '../config/prod'
import errorHandler from '../utils/errorHandler'

// Optimize image assets
gulp.task('optimize:images', () => {
  return gulp.src(config.optimize.images.src)
             .pipe(plumber({errorHandler:errorHandler}))
             .pipe(imagemin(config.optimize.images.options))
             .pipe(duration('Optimizing images for production'))
             .pipe(gulp.dest(config.optimize.images.dest))
             .pipe(size(sizeConfig.size))
})

// Minify CSS styles
gulp.task('optimize:styles', () => {
  return gulp.src(config.optimize.styles.src)
             .pipe(plumber({errorHandler:errorHandler}))
             .pipe(minifycss(config.optimize.styles.options))
             .pipe(duration('Optimizing and minifying CSS for production'))
             .pipe(gulp.dest(config.optimize.styles.dest))
             .pipe(size(sizeConfig.size))
})

// Optimize, minify and uglify JS
gulp.task('optimize:scripts', () => {
  return gulp.src(config.optimize.scripts.src)
             .pipe(plumber({errorHandler:errorHandler}))
             .pipe(uglify(config.optimize.scripts.options))
             .pipe(duration('Optimizing, minifying and minifying JS for production'))
             .pipe(gulp.dest(config.optimize.scripts.dest))
             .pipe(size(sizeConfig.size))
})

// Optimize and minify HTML
gulp.task('optimize:html', () => {
  return gulp.src(config.optimize.html.src)
             .pipe(plumber({errorHandler:errorHandler}))
             .pipe(minifyHTML(config.optimize.html.options))
             .pipe(duration('Optimizing and minifying HTML for production'))
             .pipe(gulp.dest(config.optimize.html.dest))
             .pipe(size(sizeConfig.size))
})

gulp.task('optimize', [
  'optimize:images',
  'optimize:styles',
  'optimize:scripts',
  'optimize:html'
])
