import gulp from 'gulp'
import runSequence from 'run-sequence'
import configDev from '../config/dev'
import configProd from '../config/prod'

// Copy images
gulp.task('copy:images:dev', () => {
  return gulp.src(configDev.copy.images.src)
             .pipe(gulp.dest(configDev.copy.images.dest))
})

gulp.task('copy:images:prod', () => {
  return gulp.src(configProd.copy.images.src)
             .pipe(gulp.dest(configProd.copy.images.dest))
})

gulp.task('copy:surgeignore:prod', () => {
  return gulp.src(configProd.copy.surgeignore.src)
             .pipe(gulp.dest(configProd.copy.surgeignore.dest))
})

gulp.task('copy:dev', (callback) => {
  runSequence(
    'copy:images:dev',
    callback
  )
})

gulp.task('copy:prod', (callback) => {
  runSequence(
    'copy:images:prod',
    'copy:surgeignore:prod',
    callback
  )
})
