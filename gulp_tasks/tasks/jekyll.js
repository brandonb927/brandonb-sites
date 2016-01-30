import { argv } from 'yargs'
import gulp from 'gulp'
import cp from 'child_process'
import { notify, reload } from 'browser-sync'

import configDev from '../config/dev'
import configProd from '../config/prod'

// Build the Jekyll site
gulp.task('jekyll-build:dev', (callback) => {
  notify('Compiling Jekyll for development')

  let args = [
    'exec',
    'jekyll',
    'build',
    `--source=${configDev.jekyll.src}`,
    `--destination=${configDev.jekyll.dest}`,
    `--config=${configDev.jekyll.config}`
  ]

  // Activate the profiler if needed
  if (argv.profile) {
    args = args.concat('--profile')
  }

  return cp.spawn(
    'bundle',
    args,
    { stdio: 'inherit' }
  ).on('close', callback)
})

gulp.task('jekyll-build:prod', (callback) => {
  notify('Compiling Jekyll for production')

  let args = [
    'exec',
    'jekyll',
    'build',
    `--source=${configProd.src}`,
    `--destination=${configProd.dest}`,
    `--config=${configProd.config}`
  ]

  // Activate the profiler if needed
  if (argv.profile) {
    args = args.concat('--profile')
  }

  return cp.spawn(
    'bundle',
    args,
    { stdio: 'inherit' }
  ).on('close', callback)
})

// Jekyll site rebuild + browser reload
gulp.task('jekyll-rebuild', ['jekyll-build:dev'], reload)
