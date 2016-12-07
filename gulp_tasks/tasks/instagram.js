import {
    writeFile,
    closeSync,
    openSync,
    mkdirSync,
    existsSync
} from 'fs'
import gulp from 'gulp'
import gutil from 'gulp-util'
import request from 'sync-request'

import configDev from '../config/dev'
import configProd from '../config/prod'

// Get the Instagram OAuth token that we've previously acquired from the API
const INSTAGRAM_OAUTH_TOKEN = process.env.INSTAGRAM_OAUTH_TOKEN

// Set the API Base URL, straight forward
const API_BASE_URL = "https://api.instagram.com/v1/"

// Log messaging
const ERROR_MSG = '✗ Request to Instagram failed'
const SUCCESS_MSG = '✓ Hitting Instagram API:'

// Generate an API url
const generateApiUrl = (url) => {
  let full_url =  `${API_BASE_URL}${url}?access_token=${INSTAGRAM_OAUTH_TOKEN}`

  // Make the full_url safe for logging to stdout, etc.
  let safe_url = full_url.replace(INSTAGRAM_OAUTH_TOKEN, 'XXXXXX')

  gutil.log(gutil.colors.green(SUCCESS_MSG, safe_url))

  return full_url
}

// Set the recent media path
const PATH_GET_RECENT_MEDIA = 'users/self/media/recent'

const buildJSON = (buildPath, callback) => {
  let imageItems = {}
  let folderPath = `${buildPath}/api`
  let filePath = `${folderPath}/instagram.json`

  // Get recent Instagram photos
  let recentMediaRequest = request('GET', generateApiUrl(PATH_GET_RECENT_MEDIA))
  let recentMediaResponse = JSON.parse(recentMediaRequest.getBody('utf8'))

  if (recentMediaResponse.meta.code !== 200) {
    gutil.log(gutil.colors.red(ERROR_MSG))
    return
  }

  for (let media of recentMediaResponse.data) {
    // TODO: Add comments in the future?
    if (media.type === 'image') {
      imageItems[media.id] = {
        type: media.type,
        url: media.link,
        image: media.images.standard_resolution.url,
        height: media.images.standard_resolution.height,
        width: media.images.standard_resolution.width,
        caption: media.caption.text,
        tags: media.tags,
        likes: media.likes.count,
      }
    }
    else if (media.type === 'video') {
      imageItems[media.id] = {
        type: media.type,
        url: media.link,
        video: media.videos.standard_resolution.url,
        caption: media.caption.text,
        tags: media.tags,
        likes: media.likes.count,
      }
    }

  }

  // Create the `api` directory if it doesn't already exist
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath)
  }

  // 'touch' the file first so it exists when writing to it
  closeSync(openSync(filePath, 'w'))

  // Write the JSON data to the file finally
  let jsonData = JSON.stringify(imageItems)
  writeFile(filePath, jsonData, 'UTF-8', callback)
}

// Tasks to generate the Instagram JSON data file
gulp.task('instagram:dev', (cb) => {
  buildJSON(configDev.jekyll.dest, cb)
})

gulp.task('instagram:prod', (cb) => {
  buildJSON(configProd.jekyll.dest, cb)
})
