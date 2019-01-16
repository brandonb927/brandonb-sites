import { readFileSync } from 'fs'
import { argv } from 'yargs'
import cp from 'child_process'
import path from 'path'
import gulp from 'gulp'
import awspublish from 'gulp-awspublish'
import duration from 'gulp-duration'
import rename from 'gulp-rename'
import runSequence from 'run-sequence'

import mediaConfig from '../config/prod'
import deployConfig from '../config/prod'

const awsConfig = JSON.parse(readFileSync(`${process.env.HOME}/.aws.json`))

const s3MediaConfig = {
  accessKeyId: awsConfig.key,
  secretAccessKey: awsConfig.secret,
  region: deployConfig.deploy.s3.region,
  params: {
    Bucket: deployConfig.deploy.s3.bucketMedia,
  },
}

// Upload a published build to the interwebs
gulp.task('surge_deploy', callback => {
  return cp
    .spawn(
      'surge',
      [
        deployConfig.deploy.src,
        `--domain=http${deployConfig.deploy.secureDomain ? 's' : ''}://${
          deployConfig.deploy.domain
        }`,
      ],
      { stdio: 'inherit' }
    )
    .on('close', callback)
})

gulp.task('s3_media', () => {
  let publishOptions = {
    headers: {
      'Cache-Control': 'max-age=315360000, no-transform, public',
    },
  }

  let publisher = awspublish.create(s3MediaConfig)

  return gulp
    .src(mediaConfig.copy.media.src)
    .pipe(
      rename(filePath => {
        filePath.dirname = path.join(
          deployConfig.deploy.domain,
          filePath.dirname
        )
      })
    )
    .pipe(publisher.publish(publishOptions))
    .pipe(publisher.cache())
    .pipe(duration('Uploading media to S3'))
    .pipe(awspublish.reporter())
})

gulp.task('deploy', callback => {
  if (argv.dryrun) {
    runSequence(
      'build:prod',
      ['optimize:scripts:prod', 'optimize:styles:prod'],
      'optimize:inline:prod',
      'third_party:prod',
      callback
    )
  } else {
    runSequence(
      'build:prod',
      ['optimize:scripts:prod', 'optimize:styles:prod'],
      'optimize:inline:prod',
      'third_party:prod',
      'surge_deploy',
      's3_media',
      callback
    )
  }
})
