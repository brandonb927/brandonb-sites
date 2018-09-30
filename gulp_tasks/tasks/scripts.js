import runSequence from 'run-sequence'
import gulp from 'gulp'
import babel from 'gulp-babel'
import duration from 'gulp-duration'
import plumber from 'gulp-plumber'
import sourcemaps from 'gulp-sourcemaps'

import { server } from './browser_sync'
import configDev from '../config/dev'
import configProd from '../config/prod'
import errorHandler from '../utils/errorHandler'

gulp.task('scripts:js:dev', () => {
  return gulp
    .src(configDev.scripts.src)
    .pipe(plumber({errorHandler:errorHandler}))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(duration('Compiling ES6 js for development'))
    .pipe(gulp.dest(configDev.scripts.dest))
    .pipe(server.stream())
})

// Compile babel js files
gulp.task('scripts:js:prod', () => {
  return gulp
    .src(configProd.scripts.src)
    .pipe(plumber({errorHandler:errorHandler}))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(duration('Compiling ES6 js for production'))
    .pipe(gulp.dest(configProd.scripts.dest))
})


// Main tasks
gulp.task('scripts:dev', (callback) => {
  runSequence(
    'scripts:js:dev',
    callback
  )
})

gulp.task('scripts:prod', (callback) => {
  runSequence(
    'scripts:js:prod',
    callback
  )
})
