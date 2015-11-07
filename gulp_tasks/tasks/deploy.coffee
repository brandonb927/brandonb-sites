fs           = require('fs')
argv         = require('yargs').argv
cp           = require('child_process')
path         = require('path')
gulp         = require('gulp')
awspublish   = require('gulp-awspublish')
inlinesource = require('gulp-inline-source')
gutil        = require('gulp-util')
plumber      = require('gulp-plumber')
runSequence  = require('run-sequence')
imagesConfig = require('../config/prod').copy.images
stylesConfig = require('../config/prod').styles
scriptConfig = require('../config/prod').scripts
deployConfig = require('../config/prod').deploy
errorHandler = require('../utils/errorHandler')

awsConfig = JSON.parse(fs.readFileSync("#{process.env.HOME}/.aws.json"))
awsConfig.bucket = deployConfig.s3.bucket
awsConfig.region = 'us-east-1'

s3Config =
  accessKeyId: awsConfig.key
  secretAccessKey: awsConfig.secret
  region: awsConfig.region
  params:
    Bucket: awsConfig.bucket

deployHtmlPath = "#{deployConfig.src}/**/*.html"


gulp.task('rev', () ->
  return gulp.src(deployHtmlPath)
    .pipe(plumber(errorHandler:errorHandler))
    .pipe(rev(revOpts))
    .pipe(gulp.dest(deployConfig.dest))
)

# Upload a published build to the interwebs
gulp.task('surge-deploy', (callback) ->
  return cp.spawn(
    'surge'
    [
      deployConfig.src
      "--domain=https://#{deployConfig.domain}"
    ]
    { stdio: 'inherit' }
  ).on('close', callback)
)

gulp.task('s3-deploy', () ->
  options =
    headers:
      'Cache-Control': 'max-age=315360000, no-transform, public'

  publisher = awspublish.create(s3Config)

  return gulp.src(imagesConfig.src)
    .pipe(publisher.publish())
    .pipe(publisher.cache())
    .pipe(awspublish.reporter())
)

gulp.task('inlinesource', () ->
  options =
    compress: false

  return gulp.src(deployHtmlPath)
      .pipe(inlinesource(options))
      .pipe(gulp.dest(deployConfig.dest))
)

gulp.task('deploy', (callback) ->
  if argv.dryrun
    runSequence(
      'build:prod'
      [
        'optimize:scripts'
        'optimize:styles'
      ]
      'inlinesource'
      'optimize:html'
      callback
    )
  else
    runSequence(
      'build:prod'
      [
        'optimize:scripts'
        'optimize:styles'
      ]
      'inlinesource'
      'optimize:html'
      'surge-deploy'
      's3-deploy'
      callback
    )
)
