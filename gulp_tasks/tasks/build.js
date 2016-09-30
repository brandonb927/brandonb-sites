import { argv } from 'yargs'
import gulp from 'gulp'
import runSequence from 'run-sequence'

// Run the build
gulp.task('build:dev', (callback) => {
  if (argv.update_apis) {
    runSequence(
      'delete:dev',
      'jekyll-build:dev',
      [
        'styles:dev',
        'scripts:dev',
        'copy:dev'
      ],
      callback
    )
  } else {
    runSequence(
      'jekyll-build:dev',
      [
        'styles:dev',
        'scripts:dev',
        'copy:dev'
      ],
      callback
    )
  }
})

gulp.task('build:prod', (callback) => {
  if (argv.update_apis) {
    runSequence(
      'delete:prod',
      'jekyll-build:prod',
      [
        'styles:prod',
        'scripts:prod',
        'copy:prod'
      ],
      callback
    )
  } else {
    runSequence(
      'jekyll-build:prod',
      [
        'styles:prod',
        'scripts:prod',
        'copy:prod'
      ],
      callback
    )
  }
})
