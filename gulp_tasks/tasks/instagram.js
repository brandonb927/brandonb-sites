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
const API_BASE_URL = "https://api.instagram.com/v1/users/self/media/recent"

const API_ENDPOINT = `${API_BASE_URL}?access_token=${INSTAGRAM_OAUTH_TOKEN}`
const LOGGED_API_ENDPOINT = `${API_BASE_URL}?access_token=XXXXXX`

const buildJSON = (buildPath, callback) => {
  let imageItems = {}
  let folderPath = `${buildPath}/api`
  let filePath = `${folderPath}/instagram.json`
  let errorMsg = '✗ Request to Instagram failed'
  let successMsg = '✓ Hitting Instagram API:'

  // Get recent Instagram photos
  gutil.log(gutil.colors.green(successMsg, LOGGED_API_ENDPOINT))

  let res = request('GET', API_ENDPOINT)
  let response = JSON.parse(res.getBody('utf8'))

  if (response.meta.code !== 200) {
    gutil.log(gutil.colors.red(errorMsg))
    return
  }

  for (let item of response.data) {
    if (item.type === 'image') {
      imageItems[item.id] = {
        url: item.link,
        image: item.images.standard_resolution.url,
        caption: item.caption.text,
        tags: item.tags,
        likes: item.likes.count,
      }
    }
    else if (item.type === 'image') {
      imageItems[item.id] = {
        url: item.link,
        image: item.videos.standard_resolution.url,
        caption: item.caption.text,
        tags: item.tags,
        likes: item.likes.count,
      }
    }

  }

  // Create the `api` directory if it doesn't already exist
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath)
  }

  // 'touch' the file first so it exists when writing to it
  closeSync(openSync(filePath, 'w'))

  // // Instagram says you can only retrieve a max of 250 items per response, so we go with that
  // let maxApiRequests = 250
  //
  // // We want to use the total checkin count to use with paginatation math
  // let totalApiCheckins = data.response.checkins.count
  //
  // // Get the total (ceiling) pages we can call to the api
  // let totalApiCheckinPages = Math.ceil(totalApiCheckins / maxApiRequests)
  //
  // // Start the paging offset at 0
  // let paginationOffset = 0
  //
  // // Get the checkins and page through them
  // let i = 0
  // while (i < totalApiCheckinPages) {
  //   // Build the paging URL to use with the API call
  //   let API_URL = `${API_ENDPOINT}&limit=${maxApiRequests}&offset=${paginationOffset}`
  //   let result = request('GET', API_URL)
  //   let responseData = JSON.parse(result.getBody('utf8'))
  //
  //   let LOGGED_API_URL = `${LOGGED_API_ENDPOINT}&limit=${maxApiRequests}&offset=${paginationOffset}`
  //   gutil.log(gutil.colors.green(successMsg, LOGGED_API_URL))
  //
  //   if (responseData.meta.code !== 200) {
  //     gutil.log(gutil.colors.red(errorMsg))
  //     return
  //   }
  //
  //   // Build a giant object of image data
  //   for (let checkin of checkinData) {
  //     let venue = checkin.venue
  //
  //     if (!imageItems.hasOwnProperty(venue.id)) {
  //       imageItems[venue.id] = {
  //         'venue': venue,
  //         'checkins': []
  //       }
  //     }
  //
  //     imageItems[venue.id]['checkins'].push(checkin)
  //   }
  //
  //   // Sort dates of checkins, descending by date
  //   for (let venueId in imageItems) {
  //     imageItems[venueId]['checkins'].sort(function(a, b) {
  //       a = new Date(a.createdAt);
  //       b = new Date(b.createdAt);
  //       return a>b ? -1 : a<b ? 1 : 0;
  //     })
  //   }
  //
  //   // Bump the offset to use for paging the API
  //   paginationOffset += maxApiRequests
  //   i++
  // }

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
