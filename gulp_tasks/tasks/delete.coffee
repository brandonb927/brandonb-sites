gulp        = require('gulp')
del         = require('del')
configDev   = require('../config/dev').delete
configProd  = require('../config/prod').delete

# Remove folders and files specified in the config
gulp.task('delete:dev', (callback) ->
  del(configDev.src, { force: true }, callback)
)

gulp.task('delete:prod', (callback) ->
  del(configProd.src, { force: true }, callback)
)
