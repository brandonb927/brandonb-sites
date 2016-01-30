import gulp from 'gulp'
import runSequence from 'run-sequence'

// Run the build
gulp.task('build:dev', (callback) => {
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
})

gulp.task('build:prod', (callback) => {
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
})
