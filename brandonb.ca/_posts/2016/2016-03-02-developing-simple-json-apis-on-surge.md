---
title: Developing Simple JSON APIs on Surge
date: 2016-03-02
---

Earlier this morning I read a post authored by another Surge user [Raymond Camden](http://www.raymondcamden.com/2016/03/01/adding-an-api-to-a-static-site/) on how one could leverage Jekyll to build JSON files to construct rudimentary read-only JSON APIs. It occurred to me that I had accomplished this recently on my own site with the [check-in map page](https://brandonb.ca/projects/checkins), thus inspiring me to start writing about it!

<!-- break -->

Let me state up front that the title of this post is also kind of loaded, and by saying `API` I mean just the `Read` part of the `CRUD (Create Read Update Delete)` model. This site is hosted on [Surge](https://surge.sh) which is a static-site hosting platform. Due to the nature of Surge and static sites, there is no "backend" to utilize a sripting language, so we're left with figuring out ways of authoring read-only JSON APIs. This is where Surge, being massively distributed across a powerful CDN, shines at serving JSON files that are cached and easily consumable. With all of this in mind, theoretically, one could build a static API backed by automated deploy scripts and it would be fairly scalable to a point.

Raymond talks about building JSON with `{% raw %}{% for … %}{% endraw %}` loops in Jekyll or by powering it with JSON files in the `_data` folder. These are Jekyll-specific methods and by any account is a completely legit way to do it. When implementing my "API" I started from a different slightly different angle because I was involving _another_ 3rd-party API to power my own. The decision I inevitably landed on was to build my "API" as a Gulp task which would be part of my build/deploy process, then leverage the Foursquare API to power my own "API" pre-deploy.

Initially, I had wanted to do all the work in the browser on the front-end when deciding to start this project. This meant the map data fetching would be async in the browser and there would be no backend, primarily because Surge doesn't provide one. The problem I ran into however was that the Foursquare API doesn't support front-end publishable API keys like MapBox does. In order to get data from the service you need an OAuth token, and anyone who's been on the internet for any length of time knows front-end based OAuth is non-existent. This would have posed a security loophole had I gone down that road of publishing my secret key on the Internet.

Faced with this hurdle, I had to rethink the implementation of data fetching from the Foursquare API and how it was going to happen on the front-end. It later dawned on me that one could just provide a prebuilt JSON file with the all of the data needed to power the map marker locations. Bingo!

<div class="u-text-center">
  <img src="http://i.imgur.com/MjlyUSt.gif" alt="Bringo!" />
  <br />
  <br />
</div>

The Gulp task was a pain in the ass to get going but with time I got it correct. It turns out calling HTTP endpoints with paged requests synchronously then writing to a file asynchronously is kind of a big pain. Below is the code I eventually rolled with, commented for better readability:

```js
// gulp_tasks/tasks/foursquare.js

import { writeFile, closeSync, openSync, mkdirSync, existsSync } from 'fs'
import gulp from 'gulp'
import log from 'fancy-log'
import chalk from 'chalk'
import request from 'sync-request'

// Get the Foursquare OAuth token that we've previously acquired from the API
const FOURSQUARE_OAUTH_TOKEN = process.env.FOURSQUARE_OAUTH_TOKEN

// Set the API Base URL, straight forward
const API_BASE_URL = 'https://api.foursquare.com/v2/users/self/checkins'

// Give the API a unique URL (the docs demonstrate this, though I'm not sure why)
// https://developer.foursquare.com/overview/auth
const API_ENDPOINT = `${API_BASE_URL}?oauth_token=${FOURSQUARE_OAUTH_TOKEN}&v=${Date.now()}`

const buildJSON = (buildPath, callback) => {
  let checkinItems = {}
  let folderPath = `${buildPath}/api`
  let filePath = `${folderPath}/foursquare.json`
  let errorMsg = '✗ Request to Foursquare failed'
  let successMsg = '✓ Hitting Foursquare API:'

  // Get Swarm checkins synchronously
  let res = request('GET', API_ENDPOINT)
  let data = JSON.parse(res.getBody('utf8'))
  if (data.meta.code !== 200) {
    log(chalk.red(errorMsg))
    return
  }

  // Create the `api` directory if it doesn't already exist
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath)
  }

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

    // Build a giant object of Venue ID => Venue + Checkins Array
    for (let checkin of checkinData.response.checkins.items) {
      let venue = checkin.venue

      if (!checkinItems.hasOwnProperty(venue.id)) {
        checkinItems[venue.id] = {
          venue: venue,
          checkins: [],
        }
      }

      checkinItems[venue.id]['checkins'].push(checkin)
    }

    // Sort dates of checkins, descending by date
    for (let venueId in checkinItems) {
      checkinItems[venueId]['checkins'].sort(function(a, b) {
        a = new Date(a.createdAt)
        b = new Date(b.createdAt)
        return a > b ? -1 : a < b ? 1 : 0
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
gulp.task('foursquare:dev', cb => {
  buildJSON('./build_dev', cb)
})

gulp.task('foursquare:prod', cb => {
  buildJSON('./build_prod', cb)
})
```

Output in my terminal looks something like this when the task is running:

```
[11:30:08] Starting 'foursquare:dev'…
[11:30:09] ✓ Hitting Foursquare API: https://api.foursquare.com/v2/users/self/checkins?oauth_token=OAUTHTOKEN&v=1456947006694&limit=250&offset=0
[11:30:11] ✓ Hitting Foursquare API: https://api.foursquare.com/v2/users/self/checkins?oauth_token=OAUTHTOKEN&v=1456947006694&limit=250&offset=250
[11:30:14] ✓ Hitting Foursquare API: https://api.foursquare.com/v2/users/self/checkins?oauth_token=OAUTHTOKEN&v=1456947006694&limit=250&offset=500
[11:30:16] ✓ Hitting Foursquare API: https://api.foursquare.com/v2/users/self/checkins?oauth_token=OAUTHTOKEN&v=1456947006694&limit=250&offset=750
[11:30:18] ✓ Hitting Foursquare API: https://api.foursquare.com/v2/users/self/checkins?oauth_token=OAUTHTOKEN&v=1456947006694&limit=250&offset=1000
[11:30:19] Finished 'foursquare:dev' after 10 s
```

The gist of the Gulp task is basically:

1.  Create a temporary file to write the JSON data to
2.  Get the total count of check-ins so we can page the API in the subsequent requests
3.  Page over the API, building an object that looks like
    ```javascript
    …
    {
      "Venue ID": {
        "venue:" "Venue object",
        "checkins:" ["Array of check-in objects for this venue"]
      }
    }
    …
    ```
4.  Sort the venue check-ins by the date, descending in time
5.  Write the final compiled object data to the JSON file

Once I was able to build the JSON file and have it output to my local build folder, I started on building the front-end map page. I won't go into details about how I implemented that section because it's in plain un-obfuscated JS inlined in the page on Github. You can view the source [here](https://github.com/brandonb927/brandonb.io/blob/master/_includes/foot.html#L7-L95) and the [JSON file](https://brandonb.ca/api/foursquare.json) that exists on my site (forewarning, the JSON file is pretty big and your browser might crash like mine did).

I'm constantly updating the look and feel of the Check-Ins page so check back periodically for updates 😁.
