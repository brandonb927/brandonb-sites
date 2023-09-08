---
title: Live-Streaming Battlesnake on a Budget
date: 2019-03-13
---

_This is cross-posted from it's [original source](https://medium.com/battlesnake) in which I authored._

This post will illustrate how I engineered and hosted the Twitch live-stream for the [2019 Battlesnake Victoria](https://medium.com/r/?url=https%3A%2F%2Fplay.battlesnake.com) event... on a _very_ tight budget.

<!-- break -->

---

It was an intense tournament between some of the best and brightest developers in Victoria, all vying for a piece of the over \$14,000 in prize money. The competition was fierce and atmosphere was alive with cheers and applause. Battlesnake Victoria has always been an in-person competition ever since it started, but for the last 2 years we've also live-streamed it on [Twitch](https://twitch.tv/BattlesnakeOfficial).

This year's live-stream had some very targeted goals. We knew we wanted to capture:

1. The live tournament games shown on the projector screens.
2. The audio and video of the shout-casting crew.
3. Audio from the stage microphones (MCs on-stage).
4. Audio from the in-room DJ.
5. Audience reactions.

{% picture src:2019-03-live-streaming-battlesnake-on-a-budget-1.gif alt:"The Beginner Division had over 110 teams this year!" %}

## The Twitch Live-Stream Setup

The planning process for the live-stream began with sketches of the physical setup we'd use inside the conference centre. Once we had a plan, we'd start acquiring the streaming equipment required.

### Setting Up The Day Before

The day before the tournament I coordinated with the AV tech crew at the conference centre about what specific equipment was necessary to capture both the microphone/stage and DJ music audio feeds separately. We knew we needed separate feeds so we could strip the music from our videos afterwards and avoid any copyright claims when the final cut was uploaded to Youtube. This is mainly due to one [song in particular](https://www.youtube.com/watch?v=Q-i1XZc8ZwA), beloved by the Battlesnake community that has unfortunately caused copyright concerns in the past.

Fortunately the AV techs knew exactly what I wanted and were able to help make this work inside the conference AV setup.

Another big concern was that the stream needed a reliable internet connection. We'd had unreliable wifi in the past at this venue, despite their reassuring everything would be okay for our streaming needs. I wasn't going to take the chance, and made sure that we had at least one hardwired ethernet line available for the streaming laptop.

> Shout-out to the AV techs who were onsite the day of the event! They were incredibly helpful in solving out technical issues with short notice - sometimes minutes before something would happen on stage that required it!

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-2.jpg alt:"The livestream hardware setup." %}

### Shout-Casting Table

The past few years the Battlesnake tournament has included on-stage "[shout casters](https://medium.com/broadcastgg/introduction-to-shoutcasting-definitions-and-goals-e0c2e571782b)" and this year would be no exception. However, this year we also wanted them interacting with the live-stream audience as well. Constructing a setup where the casters could address the room _and_ the live-stream audience seemed daunting, but actually turned out to be fairly simple.

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-3.jpg alt:"A behind the scenes shot of the casting table, and our setup for running the tournament." %}

The final setup included semi-professional LED lighting panels, light stands, and a webcam with a 25ft USB cable extender that plugged directly into the laptop used to run the stream. (See? Simple!)

{% picture src:2019-03-live-streaming-battlesnake-on-a-budget-4a.gif alt:"Live-view behind the scenes" %}

{% picture src:2019-03-live-streaming-battlesnake-on-a-budget-4b.gif alt:"Our fantastic shout-casters Curtis and Chris. Having a camera on them to get interactions like this was a must." %}

### The Tournament Game Board

Another constraint we had to work with was requiring the casters to control the playback of tournament games (start, stop, replay, etc), and somehow get the output of their laptop to both the projector screen AND the live-stream in real-time. The AV techs accomplished this by using an HDMI splitter to provide a dedicated HDMI feed from the casting laptop for the streaming laptop to consume directly.

{% picture src:2019-03-live-streaming-battlesnake-on-a-budget-5.gif alt:"Replay control allowed the casters to interact with a game that had finished and talk about the moves that the snakes made before their demise." %}

### Audience Reaction Camera

We've always wanted an audience reaction camera for Battlesnake, and this was going to be the year. I used my own personal Lumix G85 with a 12–35mm lens outputting to clean HDMI in FHD@60fps mode mounted on an inexpensive tripod.

{% picture src:2019-03-live-streaming-battlesnake-on-a-budget-6.gif alt:"The audience camera pulling double-duty for a stage cam — Something we'll change for next year!" %}

> Last year was supposed to have a similar setup but due to an unforeseen technical difficulty, the audience reaction camera was redirected to point at both the screens. Fortunately we planned for that this year, and we knew our setup would work this time through many, many dry-run tests.

### Getting Video Feeds to the Live-Stream

Both the audience camera and the dedicated casting laptop HDMI output were received by two Elgato HD60S and HD60 USB capture cards that recorded the respective video feeds. These HDMI captures cards are amazing for how small and compact they are; they're powered by USB (HD60 is 2.0, HD60S is 3.1), and the form factor is about as thick as an Apple Magic Mouse.

> These capture cards are natively supported by OBS as a "Video Capture" source on Windows, however if you want to use them on macOS/OS X you'll need to use a "Window Capture" source and capture the Game Capture HD software window. There's a performance hit in doing so, however if you need it in a pinch it might work for you.

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-7.png alt:"Elgato HD60S" %}

Both of these capture cards receive audio through the HDMI feed, however we opted to configure them to receive audio on the analog 3.5mm TRS port on each card so we could also receive the microphone/stage audio on one, and DJ music on the other. This also meant we could monitor and receive & record audio on separate tracks, which was one of our goals.

> I wasn't able to get a third capture card in the mix due to budget constraints (I had no budget 😂), so we didn't get a separate stage camera feed. This is why the scene changes between audience and stage are just me panning the audience camera to the left. Maybe next year!

### Broadcasting to Twitch with OBS

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-8.jpg alt:"OBS with all of the scenes and sources loaded in." %}

After not touching it for a few months, I had to re-learn how to use OBS. OBS, or Open Broadcasting Software, is an open source cross-platform application that allows you to broadcast content to a provider on the internet (ie: YouTube, Facebook Live, Twitch.tv, etc).

In OBS, input content is configured as "sources" and added to "scenes" on a canvas, similar to how you would manipulate objects in photo editing software. Once you have scenes set up, you can transition between them while streaming. You can even record to your local disk while also streaming. This is a huge deal when you want to record your content and edit it later without having to download it from where you streamed it to (if that is even an option).

Our plan was to have a few scenes highlighting various video feeds: the casters, the tournament game board, and the audience reaction cam. What I eventually decided to go with were some very simple scenes containing:

- A version of the Battlesnake logo with "Stream starting soon" text on it
- All sponsor logos and their level of sponsorship
- The "main" scene which included the tournament game board, audience cam, and casters on one screen
- Supplementary scenes that provided a larger view of the tournament game board, the casters, and the audience cam

### Final Step

In the end, here's how how everything was wired up:

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-9.png alt:"" %}

One piece of the puzzle that I left out of this diagram is a second laptop to monitor Twitch chat. The stream audience was very friendly and supportive of the competitors and casters throughout the entire stream.

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-10.png alt:"" %}

---

You can view the final cut of the live-stream here on our Twitch channel:

<div class="responsive-embed">
  <iframe src="https://player.twitch.tv/?autoplay=false&video=v390925734&parent={{site.domain}}" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>
</div>

## Stream Stats

The stream went for a solid 3 hours and 45 minutes, peaking at 145 simultaneous viewers with over 980 unique views throughout the tournament. We were very happy with these results!

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-11.png alt:"" %}

It received over 1,700 total views and generated some buzz in the chat with 44 unique chatters, some of which had never heard of Battlesnake but stuck around to watch anyway. There were even people that arrived in the chat in search of "competitive Snake", unbeknownst that Battlesnake existed until their arrival to the stream!

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-12.png alt:"The people who turned up to chat were some of the most supportive commentators around." %}

{% responsive_image path:_assets/media/posts/2019-03-live-streaming-battlesnake-on-a-budget-13.png alt:"Views by location and platform, as well as views from Twitch and outside Twitch. One slightly surprising piece of data here was seeing just how many people viewed the tournament from play.battlesnake.com after we embedded the stream into the homepage 😄" %}

## Takeaways

There are a few things I'd do differently next time:

- Run a test stream ahead of time to ensure audio-drift isn't an issue with recording audio and video on separate channels
- Have more knowledge, people, and equipment, at my disposal to provide a more quality stream (this is a goal every year basically)
- Actually have a budget so we can fulfill the previous points

In all, the experience of running the livestream was an amazing one and I would gladly host it again. I have even bigger ambitions for next year… but I'll save that for another time. 😉

{% picture src:2019-03-live-streaming-battlesnake-on-a-budget-14.gif alt:"The casters acknowledging the Twitch stream viewers." %}

You can play Battlesnake for free right now at <https://play.battlesnake.com>
