import { writeFileSync, closeSync, openSync } from 'fs'
import gulp from 'gulp'
import gutil from 'gulp-util'
import request from 'sync-request'

import configDev from '../config/dev'
import configProd from '../config/prod'

const FOURSQUARE_OAUTH_TOKEN = process.env.FOURSQUARE_OAUTH_TOKEN
const API_BASE_URL = "https://api.foursquare.com/v2/users/self/checkins"
const API_ENDPOINT = `${API_BASE_URL}?oauth_token=${FOURSQUARE_OAUTH_TOKEN}&v=${Date.now()}`

const buildJSON = (buildPath, callback) => {
  let checkinItems = []
  let checkinVenueCountMap = {}
  let filePath = `${buildPath}/foursquare.json`

  // Get Swarm checkins
  let res = request('GET', API_ENDPOINT)
  let data = JSON.parse(res.getBody('utf8'))
  if (data.meta.code !== 200) {
    console.error('Request to Foursquare failed')
    return
  }

  // 'touch' the file first
  closeSync(openSync(filePath, 'w'))

  // Get the checkins and page through them
  let maxApiCheckins = 250
  let totalApiCheckins = data.response.checkins.count
  let totalApiCheckinPages = Math.ceil(totalApiCheckins / maxApiCheckins)
  let checkinOffset = 0

  let i = 0
  while (i < totalApiCheckinPages) {
    let API_URL = `${API_ENDPOINT}&limit=${maxApiCheckins}&offset=${checkinOffset}`
    gutil.log('--> Hitting Foursquare API:', API_URL)
    let result = request('GET', API_URL)
    let checkinData = JSON.parse(result.getBody('utf8'))
    if (checkinData.meta.code !== 200) {
      console.error('Request to Foursquare failed')
      return
    }

    checkinData.response.checkins.items.forEach((checkin, index) => {
      let venue = checkin.venue
      checkinItems.push(checkin)

      // Increment counter for this venue
      if (checkinVenueCountMap.hasOwnProperty(venue.id)) {
        checkinVenueCountMap[venue.id] += 1
      } else {
        checkinVenueCountMap[venue.id] = 1
      }
    })

    checkinOffset += maxApiCheckins
    i++
  }

  if (checkinItems.length === totalApiCheckins) {
    let data = JSON.stringify({
      checkinItems: checkinItems,
      checkinVenueCountMap: checkinVenueCountMap
    })
    writeFileSync(filePath, data, 'UTF-8')
    callback()
  }
}


// Generate Foursquare JSON file
gulp.task('foursquare:dev', (cb) => {
  buildJSON(configDev.jekyll.dest, cb)
})

gulp.task('foursquare:prod', (cb) => {
  buildJSON(configProd.jekyll.dest, cb)
})
