require('dotenv').config()

const _ = require('lodash')

const fs = require('fs')
const Flickr = require('flickr-sdk')

var flickr = new Flickr(
  Flickr.OAuth.createPlugin(
    process.env.FLICKR_CONSUMER_KEY,
    process.env.FLICKR_CONSUMER_SECRET,
    process.env.FLICKR_OAUTH_TOKEN,
    process.env.FLICKR_OAUTH_TOKEN_SECRET
  )
)

async function oauthFlow() {
  var oauth = new Flickr.OAuth(
    process.env.FLICKR_CONSUMER_KEY,
    process.env.FLICKR_CONSUMER_SECRET
  )

  const oauthReponse = await oauth.request('http://localhost:8888')
  const { oauth_token: oauthToken } = oauthReponse.body

  const authorizationUrl = await oauth.authorizeUrl(oauthToken)

  open(authorizationUrl)
}

async function getPhotos() {
  console.log('Retrieving photos from Flickr...')

  const photosResponse = await flickr.people.getPhotos({
    user_id: 'me',
    per_page: 500,
    extras: 'date_taken,description,tags,url_c,url_o',
    min_taken_date: '2019-01-01 00:00:00',
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
  const flickrData = []

  for (let i in photos.photo) {
    const { id, datetaken, description, tags, url_o, url_c } = photos.photo[i]

    const exif = await getPhotoExifData(id)

    flickrData.push({
      id,
      description: description._content,
      tags,
      src_original: url_o,
      src: url_c,
      date_taken: new Date(datetaken),
      exif,
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

  const sortedData = []
  Object.keys(rebuiltData)
    .reverse()
    .forEach(year => {
      sortedData.push({ year, months: rebuiltData[year] })
    })

  fs.writeFileSync('./_data/flickr-data.json', JSON.stringify(sortedData))

  console.log('Done!')
}

;(async () => {
  await fetchAndWriteFlickrData()
})()
