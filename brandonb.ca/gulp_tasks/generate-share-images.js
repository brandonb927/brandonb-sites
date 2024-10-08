import { readFile, writeFile } from 'fs/promises'
import { createCanvas, loadImage } from 'canvas'
import { JSDOM } from 'jsdom'
import { mkdirp } from 'mkdirp'

const BUILD_ROOT = './build_prod'
const outputDir = 'build_prod/assets/media/share'

;(async () => {
  // Start by creating the output directory if not exists
  await mkdirp(outputDir)

  // Get all post URLs from the archive page
  const html = await readFile(`${BUILD_ROOT}/archive.html`)
  const dom = new JSDOM(html)
  const links = dom.window.document.querySelectorAll(
    '.archive-content-feed-item-title'
  )

  for (let link of links) {
    const url = `https://brandonb.ca/${link.getAttribute('href').replace('/', '')}`
    const urlWithoutProtocol = url.replace('https://', '')
    const segments = urlWithoutProtocol.split('/')
    const postSlug = segments[segments.length - 1]
    const postHtml = await readFile(`${BUILD_ROOT}/${postSlug}.html`)
    const postDom = new JSDOM(postHtml)

    const logoImagePath = './_assets/media/avatar20_256.jpg'
    const canvasWidth = 1200
    const canvasHeight = 630
    const lineHeight = 72
    const fontSize = 54

    const generateContent = (context, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ')
      let line = ''

      for (let n = 0; n < words.length; n++) {
        const textLength = line + words[n] + ' '
        const metrics = context.measureText(textLength)
        const textWidth = metrics.width
        if (textWidth > maxWidth && n > 0) {
          context.fillStyle = '#fff'
          context.fillText(line, 10 + x, y)

          line = words[n] + ' '
          y += lineHeight
        } else {
          line = textLength
        }
      }

      context.fillStyle = '#fff'
      context.fillText(line, 10 + x, y)
    }

    const stringToColour = str => {
      var hash = 0
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      var colour = '#'
      for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xff
        colour += ('00' + value.toString(16)).substr(-2)
      }
      return colour
    }

    const title = postDom.window.document
      .querySelector('title')
      .textContent.split(' | ')[0]
    const datePublished = postDom.window.document
      .querySelector('meta[name=date]')
      .getAttribute('content')
    const docDateModified =
      postDom.window.document.querySelector('meta[name=revised]')
    const dateModified = docDateModified
      ? docDateModified.getAttribute('content')
      : null
    const canvas = createCanvas(canvasWidth, canvasHeight)
    const context = canvas.getContext('2d')

    // Generate background colour
    context.fillStyle = '#222'
    context.fillRect(0, 0, canvasWidth, canvasHeight)

    // Set some global image stuff
    context.textBaseline = 'top'
    context.textAlign = 'center'

    // Generate text background
    context.fillStyle = stringToColour(postSlug)
    context.fillRect(
      0,
      canvasHeight / 3 - lineHeight / 3,
      canvasWidth,
      canvasHeight / 3 + 60
    )

    // Write title text
    context.font = `bold ${fontSize}px Cascadia Code`
    generateContent(
      context,
      title,
      canvasWidth / 2,
      canvasHeight / 3,
      canvasWidth,
      lineHeight
    )

    let metadata = `Published ${datePublished}`
    if (dateModified) {
      metadata = `${metadata} | Revised ${dateModified}`
    }

    // Write published date
    context.fillStyle = '#fff'
    context.font = 'bold 30px Cascadia Code'
    context.fillText(metadata, canvasWidth / 2, 380)

    // Write the url of the post
    context.fillStyle = '#fff'
    context.font = 'bold 26px Cascadia Code'
    context.fillText(urlWithoutProtocol, canvasWidth / 2, 520)

    // Insert logo image at the top
    loadImage(logoImagePath).then(async image => {
      // draw our circle mask
      context.beginPath()
      context.arc(
        canvasWidth / 2,
        110,
        100 * 0.5, // radius
        0, // start angle
        2 * Math.PI // end angle
      )
      context.clip()
      context.drawImage(image, canvasWidth / 2 - 50, 50, 100, 100)

      const buffer = canvas.toBuffer('image/png')
      await writeFile(`${outputDir}/post-${postSlug}.png`, buffer)
    })
  }
})()
