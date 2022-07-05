import { spawn } from 'child_process'
import path from 'path'

import { fromIni } from '@aws-sdk/credential-provider-ini'
import browsersync from 'browser-sync'
import del from 'del'
import gulp from 'gulp'
import autoprefixer from 'gulp-autoprefixer'
import awspublish from 'gulp-awspublish'
import babel from 'gulp-babel'
import cssnano from 'gulp-cssnano'
import duration from 'gulp-duration'
import htmlmin from 'gulp-htmlmin'
import imagemin from 'gulp-imagemin'
import inline from 'gulp-inline-source'
import less from 'gulp-less'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'
import size from 'gulp-size'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import ngrok from 'ngrok'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import configDev from './gulp_tasks/config/dev.js'
import configProd from './gulp_tasks/config/prod.js'
import errorHandler from './gulp_tasks/utils/errorHandler.js'

const argv = yargs(hideBin(process.argv)).argv

// We might not want to register the serviceworker for local dev.
// Very hacky way to do this!
process.env.SERVICEWORKER = argv.noserviceworker ? 'false' : 'true'

/**
 * Browsersync
 */
const bsServer = browsersync.create()
let ngrokURL = null
let browsersyncLocalURL = null
let browsersyncExternalURL = null

export function browser_sync(cb) {
  const bsOptions = Object.assign({}, configDev.browsersync, {
    // callbacks: {
    //   ready: async (_, bs) => {
    //     browsersyncLocalURL = bs.options.getIn(['urls', 'local'])
    //     browsersyncExternalURL = bs.options.getIn(['urls', 'external'])
    //     ngrokURL = await ngrok.connect(bs.options.get('port'))
    //     console.log(`Your ngrok URL is:`)
    //     console.log(`└── ${ngrokURL}`)
    //   },
    // },
  })
  bsServer.init(bsOptions)
  cb()
}

/**
 * Copy media and other files
 */
export function copy_media_dev() {
  return gulp
    .src(configDev.copy.media.src)
    .pipe(gulp.dest(configDev.copy.media.dest))
}

export function copy_media_prod() {
  return gulp
    .src(configProd.copy.media.src)
    .pipe(gulp.dest(configProd.copy.media.dest))
}

export function copy_fonts_dev() {
  return gulp
    .src(configDev.copy.fonts.src)
    .pipe(gulp.dest(configDev.copy.fonts.dest))
}

export function copy_fonts_prod() {
  return gulp
    .src(configProd.copy.fonts.src)
    .pipe(gulp.dest(configProd.copy.fonts.dest))
}

export function copy_api_data_dev() {
  return gulp
    .src(configDev.copy.apiData.src)
    .pipe(gulp.dest(configDev.copy.apiData.dest))
}

export function copy_api_data_prod() {
  return gulp
    .src(configProd.copy.apiData.src)
    .pipe(gulp.dest(configProd.copy.apiData.dest))
}

export function copy_surgeignore_prod() {
  return gulp
    .src(configProd.copy.surgeignore.src)
    .pipe(gulp.dest(configProd.copy.surgeignore.dest))
}

export const copy_dev = gulp.series(
  copy_fonts_dev,
  copy_api_data_dev,
  copy_media_dev
)

export const copy_prod = gulp.series(
  copy_fonts_prod,
  copy_api_data_prod,
  copy_media_prod,
  copy_surgeignore_prod
)

/**
 * Clean folders and files specified in the config
 */
function clean_dev() {
  return del(configDev.delete.src)
}

function clean_prod() {
  return del(configProd.delete.src)
}

/**
 * Optimize
 */
function optimize_media_prod() {
  return gulp
    .src(configProd.optimize.media.src)
    .pipe(plumber({ errorHandler }))
    .pipe(imagemin(configProd.optimize.media.options))
    .pipe(duration('Optimizing media for production'))
    .pipe(gulp.dest(configProd.optimize.media.dest))
    .pipe(size(configProd.size))
}

function optimize_styles_prod() {
  return gulp
    .src(configProd.optimize.styles.src)
    .pipe(plumber({ errorHandler }))
    .pipe(cssnano(configProd.optimize.styles.options))
    .pipe(duration('Optimizing and minifying CSS for production'))
    .pipe(gulp.dest(configProd.optimize.styles.dest))
    .pipe(size(configProd.size))
}

function optimize_scripts_prod() {
  return gulp
    .src(configProd.optimize.scripts.src)
    .pipe(plumber({ errorHandler }))
    .pipe(terser(configProd.optimize.scripts.options))
    .pipe(duration('Optimizing, minifying and minifying JS for production'))
    .pipe(gulp.dest(configProd.optimize.scripts.dest))
    .pipe(size(configProd.size))
}

function optimize_html_prod() {
  return gulp
    .src(configProd.optimize.html.src)
    .pipe(plumber({ errorHandler }))
    .pipe(htmlmin(configProd.optimize.html.options))
    .pipe(duration('Optimizing and minifying HTML for production'))
    .pipe(gulp.dest(configProd.optimize.html.dest))
    .pipe(size(configProd.size))
}

function optimize_inline_prod() {
  return gulp
    .src(configProd.optimize.html.src)
    .pipe(plumber({ errorHandler }))
    .pipe(
      inline({
        rootpath: configProd.buildDir,
      })
    )
    .pipe(duration('Inlining CSS into HTML for production'))
    .pipe(gulp.dest(configProd.optimize.html.dest))
}

export const optimize_prod = gulp.series(
  // gulp.parallel(optimize_media_prod, optimize_styles_prod, optimize_scripts_prod),
  optimize_media_prod,
  optimize_styles_prod,
  optimize_scripts_prod,
  optimize_html_prod,
  optimize_inline_prod
)

/**
 * Scripts
 */
export function scripts_dev() {
  return gulp
    .src(configDev.scripts.src)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(duration('Compiling ES6 js for development'))
    .pipe(gulp.dest(configDev.scripts.dest))
    .pipe(bsServer.stream())
}

export function scripts_prod() {
  return gulp
    .src(configProd.scripts.src)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(duration('Compiling ES6 js for production'))
    .pipe(gulp.dest(configProd.scripts.dest))
}

/**
 * Styles
 */
export function styles_dev() {
  return gulp
    .src(configDev.styles.src)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer(configDev.styles.autoprefixer))
    .pipe(duration('Compiling LESS and vendor prefixing CSS for development'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(configDev.styles.dest))
    .pipe(bsServer.stream())
}

export function styles_prod() {
  return gulp
    .src(configProd.styles.src)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer(configProd.styles.autoprefixer))
    .pipe(duration('Compiling LESS and vendor prefixing CSS for production'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(configProd.styles.dest))
}

/**
 * Run the build
 */
export const build_dev = gulp.series(
  clean_dev,
  jekyll_build_dev,
  gulp.parallel(styles_dev, scripts_dev, copy_dev)
)

export const build_prod = gulp.series(
  clean_prod,
  jekyll_build_prod,
  gulp.parallel(styles_prod, scripts_prod, copy_prod)
)

export function generate_share_images() {
  return spawn(
    'node',
    ['gulp_tasks/generate-share-images.js'],
    { stdio: 'inherit' }
  )
}

/**
 * Deploy
 */
function surge_deploy() {
  return spawn(
    'surge',
    [
      configProd.deploy.src,
      `--domain=http${configProd.deploy.secureDomain ? 's' : ''}://${
        configProd.deploy.domain
      }`,
    ],
    { stdio: 'inherit' }
  )
}

function s3_media() {
  let publisher = awspublish.create(
    {
      region: configProd.deploy.s3.region,
      params: {
        Bucket: configProd.deploy.s3.bucketMedia,
      },
      credentials: fromIni({ profile: 'personal' }),
    },
    {
      'Cache-Control': 'max-age=315360000, no-transform, public',
    }
  )

  return gulp
    .src(configProd.media.src)
    .pipe(
      rename(filePath => {
        filePath.dirname = path.join(configProd.deploy.domain, filePath.dirname)
      })
    )
    .pipe(publisher.publish())
    .pipe(publisher.cache())
    .pipe(duration('Uploading media to S3'))
    .pipe(awspublish.reporter())
}

export const deploy_dryrun = gulp.series(build_prod, generate_share_images, optimize_prod)

export const deploy = gulp.series(
  build_prod,
  generate_share_images,
  optimize_prod,
  s3_media,
  surge_deploy
)

/**
 * Jekyll
 */
function jekyll_build_dev(cb) {
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

  return spawn('bundle', args, { stdio: 'inherit' }).on('close', cb)
}

function jekyll_build_prod(cb) {
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

  return spawn('bundle', args, { stdio: 'inherit' }).on('close', cb)
}

/**
 * Watch
 */
export function watch() {
  gulp.watch(
    configDev.watch.jekyll,
    gulp.series(
      jekyll_build_dev,
      /*
      function browsersync_reload(cb) {
        bsServer.reload()
        console.log(`** Reminder **`)
        console.log(`BrowserSync URLs`)
        console.log(`├── ${browsersyncLocalURL}`)
        console.log(`└── ${browsersyncExternalURL}`)
        console.log(`ngrok URL`)
        console.log(`└── ${ngrokURL}`)
        cb()
      }
      */
    )
  )
  gulp.watch(configDev.watch.styles, styles_dev)
  gulp.watch(configDev.watch.scripts, scripts_dev)
}

/**
 * Build the development environment and watch files for changes
 */
export default gulp.series(build_dev, browser_sync, watch)
