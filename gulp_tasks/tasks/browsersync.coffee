gulp        = require('gulp')
browsersync = require('browser-sync')
config      = require('../config/dev').browsersync

gulp.task('browser-sync', () ->
  browsersync(config)
)
