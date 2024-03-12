---
title: Setup Sonarr and Radarr to notify via SMS with Twilio Runtime
date: 2018-04-10
---

So you read my post on setting up the [ultimate media server for movies and tv shows]({{ site.url }}{% post_url /2017/2017-08-10-ultimate-media-server-setup %}) and you're in awe over how amazing a feeling it is to automate something that is such a pain to manage manually. You might also wonder what it would be like to get notifications when episodes or movies are downloaded. I came up with a rather non-obvious solution that might pique your interest: getting download, etc. notifications via text message.

<!-- break -->

One of the somewhat buried features of Sonarr and Radarr is the ability to notify you when episodes or movies have been grabbed, downloaded, upgraded, and renamed. There are a few options for these: email, twitter DMs, various push notification services, and webhooks, to name a few. Email notifications work in a pinch but you can't customize the content, and some of the various push notifications are cost prohibitive for a project like this. What that leaves you with is using webhooks to notify you, but how does one even begin to utilize this feature?

## Enter Twilio

[Twilio](https://www.twilio.com) is a developer-centric platform for integrating programmable voice and SMS into your products and projects. If you haven't yet, [create a Twilio account](https://www.twilio.com/try-twilio) and buy a local phone number to use for Programmable SMS. If you've got an account and a phone number already, great!

### Twilio Runtime Functions

Over the last few years Twilio has really expanded their services, one of which is providing a "serverless" environment like [AWS Lambda](https://aws.amazon.com/lambda/) hosted on their platform called [Functions](https://www.twilio.com/console/runtime/functions/manage).

> Twilio Functions is a serverless environment to empower developers like you to quickly and easily create production-grade event-driven applications that scale with your business.

[Twilio Functions](https://www.twilio.com/functions) is a very inexpensive solution, so much so that at the time of writing your first 10K invocations are free, then $0.0001/invocation thereafter. I'd be _very surprised_ if you went over the 10K free tier within a year for this project. You do pay $0.0075 CAD (at the time of writing) per SMS sent plus \$1 CAD/month for each phone number you send from, however the overall cost is negligible in the long run.

Below is a summarization of how the flow works:

![How Twilio Runtime Functions work, workflow diagram](https://s3.amazonaws.com/com.twilio.prod.twilio-docs/images/Screen_Shot_2017-07-13_at_12.55.39_PM.width-500.png)

_NOTE_: I don't think that Twilio Runtime was designed to work in the way I'm proposing it be used. In the future this method may not work as mentioned here so your mileage may vary.

#### Create a new Runtime Function

At this point head over to the [Runtime Functions](https://www.twilio.com/console/runtime/functions/manage) console page. From there, create a new Function, then select `Blank Template`.

Once in the Function editor, set the Function Name and set the Path to whatever endpoint you want to use (for this post I use `/notifier`) to execute your function.

Take a look at the code editor on the page as this is where your handler will be written to deal with an incoming webhook request and send a text message. Since this handler is a serverless function, you'll be writing it in Javascript.

##### Example

A very basic handler that returns a `200 OK` on request and logs out the `context` and `event` objects looks like this:

```js
exports.handler = function(context, event, callback) {
  console.log('Got the message')
  console.log(context)
  console.log(event)

  // Providing neither error or response will result in a 200 OK
  callback()
}
```

#### Configuration and Handler Setup

You can [configure your Runtime Functions](https://www.twilio.com/console/runtime/functions/configure) to include a pre-initialized Twilio client in the `context` object, the npm package dependencies, and even environment variables available to the handler. You'll want to take a look at the [Function execution docs](https://www.twilio.com/docs/runtime/functions/invocation) to learn all of the details about how to construct your handler, as well as some examples to get you started.

What I eventually came up to handle webhook events from Sonarr and Radarr in one handler is below. You can take this chunk of code and paste it verbatim into your Function editor and click Save to get started quickly, but try to reason about it before you blindly copy-paste code from the internet 🙂.

```js
const get = require('lodash/get')

const EVENT_DOWNLOAD = 'Download'
const EVENT_UPGRADE = 'Upgrade'

const getMovieMessage = event => {
  const { eventType, movie, release } = event

  let message = `Radarr: `
  switch (eventType) {
    case EVENT_DOWNLOAD:
      message += `${movie.title} is ready to watch in ${release.quality}`
      break
    case EVENT_UPGRADE:
      message += `${movie.title} has upgraded to ${release.quality}`
      break
    default:
      message += `Message for '${eventType}' event is not defined`
      break
  }

  return message
}

const getTVShowMessage = event => {
  const { eventType, episodes, series } = event

  let epTitles = []
  episodes.forEach(episode => {
    const { title, seasonNumber, episodeNumber } = episode
    epTitles.push(`${title} (S${seasonNumber}E${episodeNumber})`)
  })

  let message = `Sonarr: `
  switch (eventType) {
    case EVENT_DOWNLOAD:
      message += `${series.title} has episodes '${epTitles.join(
        ', '
      )}' ready to watch`
      break
    case EVENT_UPGRADE:
      message += `${series.title} have upgraded episodes '${epTitles.join(
        ', '
      )}' ready to watch`
      break
    default:
      message += `Message for '${eventType}' event is not defined`
      break
  }

  return message
}

exports.handler = function(context, event, callback) {
  console.log('Got the message! Parsing now...')

  const eventType = get(event, 'eventType', null)
  if (eventType === null) {
    // Probably not a request we care about, just 200 OK
    callback()
  }

  const client = context.getTwilioClient()
  let messageBody

  // Check if we're parsing a Radarr or Sonarr event
  const movie = get(event, 'movie', null)
  if (movie !== null) {
    // Radarr event
    messageBody = getMovieMessage(event)
  } else {
    // Sonarr event
    messageBody = getTVShowMessage(event)
  }

  console.log('Parsed and built the message, sending a text.')

  client.messages.create(
    {
      to: process.env.TO_NUM,
      from: process.env.FROM_NUM,
      body: messageBody,
    },
    function(err, res) {
      console.log("We're done!")
      callback()
    }
  )
}
```

#### Testing The Function Endpoint

Below are some test commands I used to simulate a webhook hitting my Function. When you've got your function setup and deployed, you can test it out by copying your personal Runtime HTTP url from the Function page and replacing `https://secret-runtime-slug.twil.io/notifier` in the below examples:

```shell
# Single TV show episode
echo '{"episodes":[{"id":123,"episodeNumber":1,"seasonNumber":1,"title":"Test title","qualityVersion":0}],"eventType":"Test","series":{"id":1,"title":"Test Title","path":"C:\\testpath","tvdbId":1234}}' \
  | http POST https://secret-runtime-slug.twil.io/notifier

# Multiple TV show episodes
echo '{"episodes":[{"id":123,"episodeNumber":1,"seasonNumber":1,"title":"Test title","qualityVersion":0},{"id":456,"episodeNumber":9,"seasonNumber":4,"title":"Another test title","qualityVersion":0},{"id":789,"episodeNumber":23,"seasonNumber":10,"title":"Yet another test title","qualityVersion":0}],"eventType":"Test","series":{"id":1,"title":"Test Title","path":"C:\\testpath","tvdbId":1234}}' \
  | http POST https://secret-runtime-slug.twil.io/notifier

# Movie
echo '{"remoteMovie":{"tmdbId":1234,"imdbId":"5678","title":"Test title","year":1970},"release":{"quality":"Test Quality","qualityVersion":1,"releaseGroup":"Test Group","releaseTitle":"Test Title","indexer":"Test Indexer","size":9999999},"eventType":"Test","movie":{"id":1,"title":"Test Title","releaseDate":"1970-01-01","folderPath":"C:\\testpath"}}' \
  | http POST https://secret-runtime-slug.twil.io/notifier
```

_Note_: I'm using [`httpie`](https://httpie.org) where `http` is used. The payloads used for these test calls are ripped straight from the data that both Sonarr and Radarr send when configuring a webhook notification in their respective app UI so you can use them as-is instead of using the "Test" button in their UI.

Below is a screenshot of what it looks like when receiving a text in  Messages:
{% responsive_image path:_assets/media/posts/2018-04-setup-sonarr-radarr-notify-sms-with-twilio-messages.png alt:" Messages Twilio SMS conversation" %}

As you can see, I can receive these notification messages on not only my phone but also my Mac! This ensures that at least one of my devices will receive a notification somewhere but at minimum I'll get them on my phone.
