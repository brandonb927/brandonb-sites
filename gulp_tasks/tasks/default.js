import { argv } from 'yargs'
import gulp from 'gulp'
import runSequence from 'run-sequence'

// Build the development environment, and watch files for changes
gulp.task('default', callback => {
  // WE might not want to register the serviceworker for local dev.
  // Very hacky way to do this!
  process.env.SERVICEWORKER = argv.noserviceworker ? 'false' : 'true'
  if (argv.optimize) {
    runSequence('build:dev', 'optimize:inline:dev', 'browser_sync', 'watch', callback)
  } else {
    runSequence('build:dev', 'browser_sync', 'watch', callback)
  }
})
