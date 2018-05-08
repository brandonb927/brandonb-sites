import { argv } from 'yargs'
import gulp from 'gulp'
import runSequence from 'run-sequence'

// Build the development environment, and watch files for changes
gulp.task('default', callback => {
  // WE might not want to register the serviceworker for local dev.
  // Very hacky way to do this!
  process.env.SERVICEWORKER = argv.noserviceworker ? 'false' : 'true'
  runSequence(
    'build:dev',
    'browser_sync',
    'third_party:dev',
    'watch',
    callback
  )
})

gulp.task('third_party:dev', callback => {
  if (argv.thirdparty) {
    runSequence(
      'foursquare:dev',
      'unsplash:dev',
      callback
    )
  } else {
    callback()
  }
})

gulp.task('third_party:prod', callback => {
  runSequence(
    'foursquare:prod',
    'unsplash:prod',
    callback
  )
})
