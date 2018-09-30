import { writeFile, closeSync, openSync, mkdirSync, existsSync } from 'fs'
import gulp from 'gulp'
import gutil from 'gulp-util'
import request from 'sync-request'

import configDev from '../config/dev'
import configProd from '../config/prod'

// Set the Unsplash API key
const UNSPLASH_CLIENT_ID = process.env.UNSPLASH_CLIENT_ID

// Set the API Base URL, straight forward
const API_BASE_URL = 'https://api.unsplash.com/'

// Generate an API url
const generateApiUrl = path => {
  let fullUrl = `${API_BASE_URL}${path}?client_id=${UNSPLASH_CLIENT_ID}`

  // Make the fullUrl safe for logging to stdout, etc.
  let safeUrl = fullUrl.replace(UNSPLASH_CLIENT_ID, 'XXXXXX')

  gutil.log(gutil.colors.green('✓ Hitting Unsplash API:', safeUrl))

  return fullUrl
}

// Set the recent media path
const PATH_GET_MEDIA = 'users/brandonb927/photos'

const buildJSON = (buildPath, callback) => {
  let imageItems = {}
  let folderPath = `${buildPath}/api`
  let filePath = `${folderPath}/unsplash.json`

  // Get Unsplash photos
  let req = request('GET', generateApiUrl(PATH_GET_MEDIA))
  let images = JSON.parse(req.getBody('utf8'))

  images.forEach(item => {
    let req = request('GET', generateApiUrl(`photos/${item.id}`))
    let img = JSON.parse(req.getBody('utf8'))

    imageItems[img.id] = {
      url: img.links.html,
      images: {
        thumb: img.urls.thumb,
        small: img.urls.small,
        regular: img.urls.regular,
        full: img.urls.full,
      },
      height: img.height,
      width: img.width,
      description: img.description || '',
      location: img.location,
      categories: img.categories,
      likes: img.likes,
    }
  })

  if (!existsSync(folderPath)) {
    mkdirSync(folderPath)
  }

  closeSync(openSync(filePath, 'w'))

  let jsonData = JSON.stringify(imageItems)
  writeFile(filePath, jsonData, 'UTF-8', callback)
}

// Tasks to generate the Unsplash JSON data file
gulp.task('unsplash:dev', cb => {
  buildJSON(configDev.jekyll.dest, cb)
})

gulp.task('unsplash:prod', cb => {
  buildJSON(configProd.jekyll.dest, cb)
})
