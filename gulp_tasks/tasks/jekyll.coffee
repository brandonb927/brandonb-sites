argv        = require('yargs').argv
gulp        = require('gulp')
cp          = require('child_process')
notify      = require('browser-sync').notify
reload      = require('browser-sync').reload
configDev   = require('../config/dev').jekyll
configProd  = require('../config/prod').jekyll


# Build the Jekyll site
gulp.task('jekyll-build:dev', (callback) ->
  notify('Compiling Jekyll for development')

  args = [
    'exec'
    'jekyll'
    'build'
    "--source=#{configDev.src}"
    "--destination=#{configDev.dest}"
    "--config=#{configDev.config}"
  ]

  # Activate the profiler if needed
  if argv.profile
    args = args.concat('--profile')

  return cp.spawn(
    'bundle'
    args
    { stdio: 'inherit' }
  ).on('close', callback)
)

gulp.task('jekyll-build:prod', (callback) ->
  notify('Compiling Jekyll for production')

  args = [
    'exec'
    'jekyll'
    'build'
    "--source=#{configProd.src}"
    "--destination=#{configProd.dest}"
    "--config=#{configProd.config}"
  ]

  # Activate the profiler if needed
  if argv.profile
    args = args.concat('--profile')

  return cp.spawn(
    'bundle'
    args
    { stdio: 'inherit' }
  ).on('close', callback)
)

# Jekyll site rebuild + browser reload
gulp.task('jekyll-rebuild', ['jekyll-build:dev'], reload)
