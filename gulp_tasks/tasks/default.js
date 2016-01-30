import gulp from 'gulp'
import runSequence from 'run-sequence'

// Build the development environment, and watch files for changes
gulp.task('default', (callback) => {
  runSequence(
    'build:dev',
    'browser-sync',
    'foursquare:dev',
    'watch',
    callback
  )
})
