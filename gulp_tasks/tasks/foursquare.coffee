fs = require('fs')
gulp = require('gulp')
gutil = require('gulp-util')
request = require('sync-request')

configDev = require('../config/dev').jekyll
configProd = require('../config/prod').jekyll

buildJSON = (buildPath, callback) ->
  FOURSQUARE_OAUTH_TOKEN = process.env.FOURSQUARE_OAUTH_TOKEN
  API_BASE_URL = "https://api.foursquare.com/v2/users/self/checkins"
  API_ENDPOINT = "#{API_BASE_URL}?oauth_token=#{FOURSQUARE_OAUTH_TOKEN}&v=#{Date.now()}"
  checkinItems = []
  checkinVenueCountMap = {}
  filePath = "#{buildPath}/foursquare.json"

  # Get Swarm checkins
  res = request('GET', API_ENDPOINT)
  data = JSON.parse(res.getBody('utf8'))
  if data.meta.code isnt 200
    console.error 'Request to Foursquare failed'
    return

  fs.closeSync(fs.openSync(filePath, 'w'))

  # Get the checkins and page through them
  maxApiCheckins = 250
  totalApiCheckins = data.response.checkins.count
  totalApiCheckinPages = Math.ceil(totalApiCheckins / maxApiCheckins)
  checkinOffset = 0

  i = 0
  while i < totalApiCheckinPages
    API_URL = "#{API_ENDPOINT}&limit=#{maxApiCheckins}&offset=#{checkinOffset}"
    gutil.log '--> Hitting Foursquare API:', API_URL
    result = request('GET', API_URL)
    checkinData = JSON.parse(result.getBody('utf8'))
    if checkinData.meta.code isnt 200
      console.error 'Request to Foursquare failed'
      return

    checkinData.response.checkins.items.forEach (checkin, index) ->
      venue = checkin.venue
      checkinItems.push(checkin)

      # Increment counter for this venue
      if checkinVenueCountMap.hasOwnProperty(venue.id)
        checkinVenueCountMap[venue.id] += 1
      else
        checkinVenueCountMap[venue.id] = 1

    checkinOffset += maxApiCheckins
    i++

  if checkinItems.length is totalApiCheckins
    data = JSON.stringify {
      checkinItems: checkinItems
      checkinVenueCountMap: checkinVenueCountMap
    }
    fs.writeFileSync filePath, data, 'UTF-8'
    callback()


# Generate Foursquare JSON file
gulp.task('foursquare:dev', (cb) ->
  buildJSON(configDev.dest, cb)
)

gulp.task('foursquare:prod', (cb) ->
  buildJSON(configProd.dest, cb)
)
