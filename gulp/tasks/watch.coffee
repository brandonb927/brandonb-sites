gulp        = require('gulp')
runSequence = require('run-sequence')
config      = require('../config/dev').watch

# Run the jekyll build, browsersync server,
# and watch files for changes
gulp.task('watch', (callback) ->
  gulp.watch(config.jekyll,  ['jekyll-rebuild'])
  gulp.watch(config.styles,  ['styles:dev'])
  gulp.watch(config.scripts, ['scripts:dev'])
  gulp.watch(config.images,  ['copy:images:dev'])
)
