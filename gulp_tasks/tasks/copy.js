import gulp from 'gulp'
import runSequence from 'run-sequence'
import configDev from '../config/dev'
import configProd from '../config/prod'

// Copy media
gulp.task('copy:media:dev', () => {
  return gulp
    .src(configDev.copy.media.src)
    .pipe(gulp.dest(configDev.copy.media.dest))
})

gulp.task('copy:media:prod', () => {
  return gulp
    .src(configProd.copy.media.src)
    .pipe(gulp.dest(configProd.copy.media.dest))
})

gulp.task('copy:apis:dev', () => {
  return gulp
    .src(configProd.copy.apis.src)
    .pipe(gulp.dest(configProd.copy.apis.dest))
})

gulp.task('copy:apis:prod', () => {
  return gulp
    .src(configProd.copy.apis.src)
    .pipe(gulp.dest(configProd.copy.apis.dest))
})

gulp.task('copy:surgeignore:prod', () => {
  return gulp
    .src(configProd.copy.surgeignore.src)
    .pipe(gulp.dest(configProd.copy.surgeignore.dest))
})

gulp.task('copy:dev', callback => {
  runSequence('copy:media:dev', callback)
})

gulp.task('copy:prod', callback => {
  runSequence('copy:media:prod', 'copy:surgeignore:prod', callback)
})
