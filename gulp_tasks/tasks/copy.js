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

gulp.task('copy:fonts:dev', () => {
  return gulp
    .src(configDev.copy.fonts.src)
    .pipe(gulp.dest(configDev.copy.fonts.dest))
})

gulp.task('copy:fonts:prod', () => {
  return gulp
    .src(configProd.copy.fonts.src)
    .pipe(gulp.dest(configProd.copy.fonts.dest))
})

gulp.task('copy:api_data:dev', () => {
  return gulp
    .src(configDev.copy.apiData.src)
    .pipe(gulp.dest(configDev.copy.apiData.dest))
})

gulp.task('copy:api_data:prod', () => {
  return gulp
    .src(configProd.copy.apiData.src)
    .pipe(gulp.dest(configProd.copy.apiData.dest))
})

gulp.task('copy:surgeignore:prod', () => {
  return gulp
    .src(configProd.copy.surgeignore.src)
    .pipe(gulp.dest(configProd.copy.surgeignore.dest))
})

gulp.task('copy:dev', callback => {
  runSequence('copy:fonts:dev', 'copy:api_data:dev', 'copy:media:dev', callback)
})

gulp.task('copy:prod', callback => {
  runSequence('copy:fonts:prod', 'copy:api_data:prod', 'copy:media:prod', 'copy:surgeignore:prod', callback)
})
