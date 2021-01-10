require('dotenv').config()

const _ = require('lodash')

const fs = require('fs')
const Flickr = require('flickr-sdk')

const DATA_FILE_PATH = './_data/flickr-data.json'
const MIN_DATE_TAKEN = '2019-01-01 00:00:00'

const CACHED_DATA = getCachedData()

var flickr = new Flickr(
  Flickr.OAuth.createPlugin(
    process.env.FLICKR_CONSUMER_KEY,
    process.env.FLICKR_CONSUMER_SECRET,
    process.env.FLICKR_OAUTH_TOKEN,
    process.env.FLICKR_OAUTH_TOKEN_SECRET
  )
)

// Use to get OAuth token
// async function oauthFlow() {
//   var oauth = new Flickr.OAuth(
//     process.env.FLICKR_CONSUMER_KEY,
//     process.env.FLICKR_CONSUMER_SECRET
//   )

//   const oauthReponse = await oauth.request('http://localhost:8888')
//   const { oauth_token: oauthToken } = oauthReponse.body
//   const authorizationUrl = await oauth.authorizeUrl(oauthToken)
//   open(authorizationUrl)
// }

function getCachedData() {
  // Check if the cached date file exists
  if (fs.existsSync(DATA_FILE_PATH)) {
    // Read the cached date file and query the most recent photo taken date
    return JSON.parse(fs.readFileSync(DATA_FILE_PATH))
  }

  return null
}

async function cacheLicenses() {
  const licensesResponse = await flickr.photos.licenses.getInfo()
  const { license } = licensesResponse.body.licenses

  const formattedLicenses = {}
  license.forEach(({ id, name: licenseName }) => {
    formattedLicenses[id] = licenseName
  })

  return formattedLicenses
}

async function getPhotos() {
  console.log('Retrieving photos from Flickr...')

  // Use a default minimum date to start with
  let minDateTaken = MIN_DATE_TAKEN

  const cachedData = CACHED_DATA

  // Check if the cached date file exists
  if (cachedData) {
    // Read the cached date file and query the most recent photo taken date
    const recentYear = cachedData[0]
    const recentMonth = Object.keys(recentYear.months)[0]
    const recentPhoto = recentYear.months[recentMonth][0]

    // Get the most recent date and add a day so when we query it doesn't retrieve old data
    const parsedDate = new Date(Date.parse(recentPhoto.date_taken))
    // parsedDate.setDate(parsedDate.getDate() + 1)

    // Reset the min_date_taken string to our most recent date
    minDateTaken = `${parsedDate.toISOString().substring(0, 10)} 00:00:00`
  }

  const photosResponse = await flickr.people.getPhotos({
    user_id: 'me',
    per_page: 500,
    extras: 'date_taken,description,license,tags,url_c,url_o',
    min_taken_date: minDateTaken,
    content_type: '1',
  })
  return photosResponse.body
}

async function getPhotoExifData(photoId) {
  const getDataByKey = (exifArray, key, raw = false) => {
    const exifDataItems = exifArray.filter(item => {
      return item.tag === key
    })

    if (exifDataItems.length > 1) {
      throw new Error('More than one item by that key!', exifDataItems)
    }
    return _.get(exifDataItems[0], `${raw ? 'raw' : 'clean'}._content`)
  }

  console.log(`  Getting EXIF data for photo ${photoId}`)
  const exifData = {}
  const exifResponse = await flickr.photos.getExif({
    photo_id: photoId,
  })
  const { camera, exif } = exifResponse.body.photo

  exifData.camera = camera || null
  if (!camera) return null

  exifData.lens = getDataByKey(exif, 'Lens', true)
  exifData.focalLength = getDataByKey(exif, 'FocalLength')
  exifData.focalLengthEquiv = getDataByKey(
    exif,
    'FocalLengthIn35mmFormat',
    true
  )
  exifData.iso = getDataByKey(exif, 'ISO', true)
  exifData.shutterSpeed = getDataByKey(exif, 'ExposureTime', true)
  exifData.aperture = getDataByKey(exif, 'FNumber')

  return exifData
}

async function fetchAndWriteFlickrData() {
  const { photos } = await getPhotos()

  const licenses = await cacheLicenses()

  const flickrData = []

  for (let i in photos.photo) {
    const {
      id,
      datetaken,
      description,
      license: licenseId,
      tags,
      title,
      url_o,
      url_c,
    } = photos.photo[i]

    const exif = await getPhotoExifData(id)

    let completeDescription = ''
    if (title) {
      if (title && description._content) {
        completeDescription = `${title}\n${description._content}`
      } else {
        completeDescription = title
      }
    }

    if (description._content) {
      completeDescription = description._content
    }

    flickrData.push({
      date_taken: new Date(datetaken),
      description: completeDescription,
      exif,
      id,
      license: licenses[licenseId],
      tags,
      src_original: url_o,
      src: url_c,
    })
  }

  const rebuiltData = {}
  for (let i in flickrData) {
    const photo = flickrData[i]
    const year = photo.date_taken.getFullYear()
    const monthName = photo.date_taken.toLocaleString('default', {
      month: 'long',
    })

    if (!rebuiltData.hasOwnProperty(year)) {
      rebuiltData[year] = {}
    }

    if (!rebuiltData[year].hasOwnProperty(monthName)) {
      rebuiltData[year][monthName] = []
    }

    const formattedDateTaken = photo.date_taken.toLocaleString('default', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    photo.date_taken = formattedDateTaken

    rebuiltData[year][monthName].push(photo)
  }

  const cachedData = CACHED_DATA
  const sortedData = []

  if (cachedData) {
    // Take the cached data and merge it into our rebuilt data
    // so we can create a new sorted data file
    cachedData.forEach(obj => {
      const cachedYear = obj.year

      if (!rebuiltData.hasOwnProperty(cachedYear)) {
        rebuiltData[cachedYear] = {}
      }

      const cachedMonths = Object.keys(obj.months)

      for (let cachedMonth of cachedMonths) {
        if (!rebuiltData[cachedYear].hasOwnProperty(cachedMonth)) {
          rebuiltData[cachedYear][cachedMonth] = obj.months[cachedMonth]
        } else {
          rebuiltData[cachedYear][cachedMonth].concat(obj.months[cachedMonth])
        }
      }
    })
  }

  Object.keys(rebuiltData)
    .reverse()
    .forEach(year => {
      sortedData.push({ year, months: rebuiltData[year] })
    })

  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(sortedData))

  console.log('Done!')
}

;(async () => {
  await fetchAndWriteFlickrData()
})()
