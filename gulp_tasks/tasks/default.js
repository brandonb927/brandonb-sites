import { argv } from 'yargs'
import gulp from 'gulp'
import runSequence from 'run-sequence'

// Build the development environment, and watch files for changes
gulp.task('default', (callback) => {
  if (argv.update_apis) {
    runSequence(
      'build:dev',
      'browser-sync',
      'foursquare:dev',
      'instagram:dev',
      'watch',
      callback
    )
  } else {
    runSequence(
      'build:dev',
      'browser-sync',
      'watch',
      callback
    )
  }

})
