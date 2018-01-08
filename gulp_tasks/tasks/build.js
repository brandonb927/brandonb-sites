import { argv } from 'yargs'
import gulp from 'gulp'
import runSequence from 'run-sequence'

// Run the build
gulp.task('build:dev', (callback) => {
  if (argv.optimize) {
    runSequence(
      'delete:dev',
      'jekyll-build:dev',
      [
        'styles:dev',
        'scripts:dev',
        'copy:dev'
      ],
      'optimize:inline:dev',
      callback
    )
  } else {
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
  }
})

gulp.task('build:prod', (callback) => {
  if (argv.optimize) {
    runSequence(
      'delete:prod',
      'jekyll-build:prod',
      [
        'styles:prod',
        'scripts:prod',
        'copy:prod'
      ],
      'optimize:prod',
      callback
    )
  } else {
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
  }
})
