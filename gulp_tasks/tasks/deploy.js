import { readFileSync } from 'fs'
import { argv } from 'yargs'
import cp from 'child_process'
import gulp from 'gulp'
import awspublish from 'gulp-awspublish'
import inlinesource from 'gulp-inline-source'
import duration from 'gulp-duration'
import plumber from 'gulp-plumber'
import runSequence from 'run-sequence'

import imagesConfig from '../config/prod'
import deployConfig from '../config/prod'
import errorHandler from '../utils/errorHandler'

const awsConfig = JSON.parse(readFileSync(`${process.env.HOME}/.aws.json`))
awsConfig.bucket = deployConfig.deploy.s3.bucket
awsConfig.region = 'us-east-1'

const s3Config = {
  accessKeyId: awsConfig.key,
  secretAccessKey: awsConfig.secret,
  region: awsConfig.region,
  params:{
    'Bucket': awsConfig.bucket
  }
}

const deployHtmlPath = `${deployConfig.deploy.src}/**/*.html`

// Upload a published build to the interwebs
gulp.task('surge-deploy', (callback) => {
  return cp.spawn(
    'surge',
    [
      deployConfig.deploy.src,
      `--domain=https://${deployConfig.deploy.domain}`
    ],
    { stdio: 'inherit' }
  ).on('close', callback)
})

gulp.task('s3-deploy', () => {
  let options = {
    headers: {
      'Cache-Control': 'max-age=315360000, no-transform, public'
    }
  }

  let publisher = awspublish.create(s3Config)

  return gulp.src(imagesConfig.copy.images.src)
             .pipe(publisher.publish())
             .pipe(publisher.cache())
             .pipe(duration('Uploading images to S3'))
             .pipe(awspublish.reporter())
})

gulp.task('inlinesource', () => {
  let options = {
    compress: false
  }

  return gulp.src(deployHtmlPath)
             .pipe(inlinesource(options))
             .pipe(duration('Inlining styles and scripts'))
             .pipe(gulp.dest(deployConfig.deploy.dest))
})

gulp.task('deploy', (callback) => {
  if (argv.dryrun) {
    runSequence(
      'build:prod',
      [
        'optimize:scripts',
        'optimize:styles',
      ],
      'inlinesource',
      'optimize:html',
      [
        'foursquare:prod',
        'instagram:prod'
      ],
      callback
    )
  } else {
    runSequence(
      'build:prod',
      [
        'optimize:scripts',
        'optimize:styles'
      ],
      'inlinesource',
      'optimize:html',
      [
        'foursquare:prod',
        'instagram:prod'
      ],
      'surge-deploy',
      's3-deploy',
      callback
    )
  }
})
