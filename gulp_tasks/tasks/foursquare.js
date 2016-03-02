import { writeFile, closeSync, openSync } from 'fs'
import gulp from 'gulp'
import gutil from 'gulp-util'
import request from 'sync-request'

import configDev from '../config/dev'
import configProd from '../config/prod'

// Get the Foursquare OAuth token that we've previously acquired from the API
const FOURSQUARE_OAUTH_TOKEN = process.env.FOURSQUARE_OAUTH_TOKEN

// Set the API Base URL, straight forward
const API_BASE_URL = "https://api.foursquare.com/v2/users/self/checkins"

// Give the API a unique URL (the docs demonstrate this, though I'm not sure why)
// https://developer.foursquare.com/overview/auth
const API_ENDPOINT = `${API_BASE_URL}?oauth_token=${FOURSQUARE_OAUTH_TOKEN}&v=${Date.now()}`

const buildJSON = (buildPath, callback) => {
  let checkinItems = {}
  let filePath = `${buildPath}/foursquare.json`
  let errorMsg = '✗ Request to Foursquare failed'
  let successMsg = '✓ Hitting Foursquare API:'

  // Get Swarm checkins synchronously
  let res = request('GET', API_ENDPOINT)
  let data = JSON.parse(res.getBody('utf8'))
  if (data.meta.code !== 200) {
    gutil.log(gutil.colors.red(errorMsg))
    return
  }

  // 'touch' the file first so it exists when writing to it
  closeSync(openSync(filePath, 'w'))

  // Foursquare says you can only retrieve a max of 250 items per response, so we go with that
  let maxApiCheckins = 250

  // We want to use the total checkin count to use with paginatation math
  let totalApiCheckins = data.response.checkins.count

  // Get the total (ceiling) pages we can call to the api
  let totalApiCheckinPages = Math.ceil(totalApiCheckins / maxApiCheckins)

  // Start the paging offset at 0
  let checkinOffset = 0

  // Get the checkins and page through them
  let i = 0
  while (i < totalApiCheckinPages) {
    // Build the paging URL to use with the API call
    let API_URL = `${API_ENDPOINT}&limit=${maxApiCheckins}&offset=${checkinOffset}`
    gutil.log(gutil.colors.green(successMsg, API_URL))
    let result = request('GET', API_URL)
    let checkinData = JSON.parse(result.getBody('utf8'))
    if (checkinData.meta.code !== 200) {
      gutil.log(gutil.colors.red(errorMsg))
      return
    }

    // Build a giant object of Venue ID => Venue + Checkin
    for (let checkin of checkinData.response.checkins.items) {
      let venue = checkin.venue

      if (!checkinItems.hasOwnProperty(venue.id)) {
        checkinItems[venue.id] = {
          'venue': venue,
          'checkins': []
        }
      }

      checkinItems[venue.id]['checkins'].push(checkin)
    }

    // Sort dates of checkins, descending by date
    for (let venueId in checkinItems) {
      checkinItems[venueId]['checkins'].sort(function(a, b) {
        a = new Date(a.createdAt);
        b = new Date(b.createdAt);
        return a>b ? -1 : a<b ? 1 : 0;
      })
    }

    // Bump the offset to use for paging the API
    checkinOffset += maxApiCheckins
    i++
  }

  // Write the JSON data to the file finally
  let jsonData = JSON.stringify(checkinItems)
  writeFile(filePath, jsonData, 'UTF-8', callback)
}

// Tasks to generate the Foursquare JSON data file
gulp.task('foursquare:dev', (cb) => {
  buildJSON(configDev.jekyll.dest, cb)
})

gulp.task('foursquare:prod', (cb) => {
  buildJSON(configProd.jekyll.dest, cb)
})
