gulp        = require('gulp')
cp          = require('child_process')
notify      = require('browser-sync').notify
reload      = require('browser-sync').reload
configDev   = require('../config/dev').jekyll
configProd  = require('../config/prod').jekyll


# Build the Jekyll site
gulp.task('jekyll-build:dev', (callback) ->
  notify('Compiling Jekyll for development')

  return cp.spawn(
    'jekyll'
    [
      'build'
      '-f'
      "--source=#{configDev.src}"
      "--destination=#{configDev.dest}"
      "--config=#{configDev.config}"
    ]
    { stdio: 'inherit' }
  ).on('close', callback)
)

gulp.task('jekyll-build:prod', (callback) ->
  notify('Compiling Jekyll for production')

  return cp.spawn(
    'jekyll'
    [
      'build'
      '-f'
      "--source=#{configProd.src}"
      "--destination=#{configProd.dest}"
      "--config=#{configProd.config}"
    ]
    { stdio: 'inherit' }
  ).on('close', callback)
)

# Jekyll site rebuild + browser reload
gulp.task('jekyll-rebuild', ['jekyll-build:dev'], reload)
