gulp           = require('gulp')
runSequence    = require('run-sequence')
copyConfigDev  = require('../config/dev').copy.images
copyConfigProd = require('../config/prod').copy.images


# Copy images
gulp.task('copy:images:dev', () ->
  return gulp.src(copyConfigDev.src)
    .pipe(gulp.dest(copyConfigDev.dest))
)

gulp.task('copy:images:prod', () ->
  return gulp.src(copyConfigProd.src)
    .pipe(gulp.dest(copyConfigProd.dest))
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
    callback
  )
)
