import gulp from 'gulp'
import browsersync from 'browser-sync'
import config from '../config/dev'

gulp.task('browser-sync', () => {
  browsersync(config.browsersync)
})
