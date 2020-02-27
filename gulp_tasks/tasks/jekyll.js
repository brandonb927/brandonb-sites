import { argv } from 'yargs'
import gulp from 'gulp'
import cp from 'child_process'

import configDev from '../config/dev'
import configProd from '../config/prod'

import { server } from './browser_sync'

// Build the Jekyll site
gulp.task('jekyll-build:dev', callback => {
  let args = [
    'exec',
    'jekyll',
    'build',
    `--source=${configDev.jekyll.src}`,
    `--destination=${configDev.jekyll.dest}`,
    `--config=${configDev.jekyll.config}`,
    `--trace`,
  ]

  // Activate the profiler if needed
  if (argv.profile) {
    args = args.concat('--profile')
  }

  return cp.spawn('bundle', args, { stdio: 'inherit' }).on('close', callback)
})

gulp.task('jekyll-build:prod', callback => {
  let args = [
    'exec',
    'jekyll',
    'build',
    `--source=${configProd.jekyll.src}`,
    `--destination=${configProd.jekyll.dest}`,
    `--config=${configProd.jekyll.config}`,
  ]

  // Activate the profiler if needed
  if (argv.profile) {
    args = args.concat('--profile')
  }

  return cp.spawn('bundle', args, { stdio: 'inherit' }).on('close', callback)
})

// Jekyll site rebuild + browser reload
gulp.task('jekyll-rebuild', ['jekyll-build:dev'], done => {
  server.reload()
  done()
})
