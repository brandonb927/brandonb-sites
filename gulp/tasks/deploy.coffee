argv         = require('yargs').argv
cp           = require('child_process')
path         = require('path')
gulp         = require('gulp')
gutil        = require('gulp-util')
plumber      = require('gulp-plumber')
runSequence  = require('run-sequence')
stylesConfig = require('../config/prod').styles
scriptConfig = require('../config/prod').scripts
deployConfig = require('../config/prod').deploy
errorHandler = require('../utils/errorHandler')

gulp.task('rev', () ->
  return gulp.src("#{deployConfig.src}/**/*.html")
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(rev(revOpts))
    .pipe(gulp.dest(deployConfig.dest))
)

# Upload a published build to the interwebs
gulp.task('surge-deploy', (callback) ->
  return cp.spawn(
    'surge'
    [
      deployConfig.src
      # "--domain=https://#{deployConfig.domain}"
    ]
    { stdio: 'inherit' }
  ).on('close', callback)
)

gulp.task('deploy', (callback) ->
  if argv.dryrun
    runSequence(
      'build:prod'
      [
        'optimize:scripts'
        'optimize:styles'
      ]
      'copy:images:prod'
      'optimize:html'
      callback
    )
  else
    runSequence(
      'build:prod'
      [
        'optimize:scripts'
        'optimize:styles'
      ]
      'copy:images:prod'
      'optimize:html'
      'surge-deploy'
      callback
    )
)
