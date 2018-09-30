import gulp from  'gulp'
import autoprefixer from  'gulp-autoprefixer'
import duration from  'gulp-duration'
import less from  'gulp-less'
import plumber from  'gulp-plumber'
import sourcemaps from 'gulp-sourcemaps'

import configDev from '../config/dev'
import configProd from '../config/prod'
import errorHandler from '../utils/errorHandler'
import { server } from './browser_sync'

// Compile LESS into CSS, and add vendor prefixes
gulp.task('styles:dev', () => {
  return gulp
    .src(configDev.styles.src)
    .pipe(plumber({errorHandler:errorHandler}))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer(configDev.styles.autoprefixer))
    .pipe(duration('Compiling LESS and vendor prefixing CSS for development'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(configDev.styles.dest))
    .pipe(server.stream())
})

gulp.task('styles:prod', () => {
  return gulp
    .src(configProd.styles.src)
    .pipe(plumber({errorHandler:errorHandler}))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer(configProd.styles.autoprefixer))
    .pipe(duration('Compiling LESS and vendor prefixing CSS for production'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(configProd.styles.dest))
})
