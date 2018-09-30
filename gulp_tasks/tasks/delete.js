import gulp from 'gulp'
import rimraf from 'rimraf'
import { resolve } from 'path'

import configDev from '../config/dev'
import configProd from '../config/prod'

// Remove folders and files specified in the config
gulp.task('delete:dev', callback => {
  rimraf(configDev.delete.src, callback)
})

gulp.task('delete:prod', callback => {
  rimraf(configProd.delete.src, callback)
})
