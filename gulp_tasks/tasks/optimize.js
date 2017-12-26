import gulp from 'gulp'
import cssnano from 'gulp-cssnano'
import duration from 'gulp-duration'
import htmlmin from 'gulp-htmlmin'
import imagemin from 'gulp-imagemin'
import inlineCSS from 'gulp-inline-css'
import plumber from 'gulp-plumber'
import size from 'gulp-size'
import uglify from 'gulp-uglify'
import runSequence from 'run-sequence'

import configDev from '../config/dev'
import configProd from '../config/prod'
import errorHandler from '../utils/errorHandler'

// Optimize image assets
gulp.task('optimize:media:prod', () => {
  return gulp
    .src(configProd.optimize.media.src)
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(imagemin(configProd.optimize.media.options))
    .pipe(duration('Optimizing media for production'))
    .pipe(gulp.dest(configProd.optimize.media.dest))
    .pipe(size(configProd.size))
})

// Minify CSS styles
gulp.task('optimize:styles:prod', () => {
  return gulp
    .src(configProd.optimize.styles.src)
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(cssnano(configProd.optimize.styles.options))
    .pipe(duration('Optimizing and minifying CSS for production'))
    .pipe(gulp.dest(configProd.optimize.styles.dest))
    .pipe(size(configProd.size))
})

// Optimize, minify and uglify JS
gulp.task('optimize:scripts:prod', () => {
  return gulp
    .src(configProd.optimize.scripts.src)
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(uglify(configProd.optimize.scripts.options))
    .pipe(duration('Optimizing, minifying and minifying JS for production'))
    .pipe(gulp.dest(configProd.optimize.scripts.dest))
    .pipe(size(configProd.size))
})

// Optimize and minify HTML
gulp.task('optimize:html:prod', () => {
  return gulp
    .src(configProd.optimize.html.src)
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(htmlmin(configProd.optimize.html.options))
    .pipe(duration('Optimizing and minifying HTML for production'))
    .pipe(gulp.dest(configProd.optimize.html.dest))
    .pipe(size(configProd.size))
})

// Optimize and inline external assets
gulp.task('optimize:inlineCSS:prod', () => {
  return gulp
  .src(configProd.optimize.html.src)
  .pipe(plumber({errorHandler: errorHandler}))
  .pipe(inlineCSS({
    url: `file://${configProd.buildDir}/`,
  }))
  .pipe(duration('Inlining CSS into HTML for production'))
  .pipe(gulp.dest(configProd.optimize.html.dest))
})

// Optimize and inline external assets
gulp.task('optimize:inlineCSS:dev', () => {
  return gulp
    .src(configDev.optimize.html.src)
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(inlineCSS({
      url: `file://${configDev.buildDir}/`,
    }))
    .pipe(duration('Inlining CSS into HTML for development'))
    .pipe(gulp.dest(configDev.optimize.html.dest))
})

gulp.task('optimize:prod', (callback) => {
  runSequence(
    'optimize:media:prod',
    'optimize:styles:prod',
    'optimize:scripts:prod',
    'optimize:html:prod',
    'optimize:inlineCSS:prod',
    callback
  )
})
