gulp           = require('gulp')
runSequence    = require('run-sequence')
copyConfigDev  = require('../config/dev').copy
copyConfigProd = require('../config/prod').copy


# Copy images
gulp.task('copy:images:dev', () ->
  return gulp.src(copyConfigDev.images.src)
    .pipe(gulp.dest(copyConfigDev.images.dest))
)

gulp.task('copy:images:prod', () ->
  return gulp.src(copyConfigProd.images.src)
    .pipe(gulp.dest(copyConfigProd.images.dest))
)

gulp.task('copy:surgeignore:prod', () ->
  return gulp.src(copyConfigProd.surgeignore.src)
    .pipe(gulp.dest(copyConfigProd.surgeignore.dest))
)

gulp.task('copy:dev', (callback) ->
  runSequence(
    'copy:images:dev'
    callback
  )
)

gulp.task('copy:prod', (callback) ->
  runSequence(
    'copy:images:prod'
    'copy:surgeignore:prod'
    callback
  )
)
