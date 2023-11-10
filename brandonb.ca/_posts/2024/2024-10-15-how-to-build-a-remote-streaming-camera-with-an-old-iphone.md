---
title: How to build a remote streaming camera with an iPhone and OBS
date: 2024-10-15
draft: true
---

What we're going to be doing here is streaming the input to an iPhone camera, remote over WiFi, to a PC running OBS, then streaming out to the internet via a livestreaming platform.

Things you'll need:

- a computer capable of running and streaming with OBS
- an iPhone with a newer camera (7 or newer is best, I used my old iPhone 7 Plus)
- an app, DroidCam (pay for the Pro upgrade, it is worth it to unlock higher resolutions)
- a mount of some kind to attach the phone to (in my case I used a {% amazon B0061LLUHO "suction cup mount" %} with a {% amazon B07S8TTH34 "tripod phone mount" %})

Install the [DroidCam app](https://apps.apple.com/us/app/droidcam-wireless-webcam/id1510258102) on the phone, and the [DroidCam OBS plugin](https://www.dev47apps.com/obs/) on the computer where OBS is installed (this does not work with Streamlabs Desktop).

Once you've installed Droidcam on the phone, open it and configure it like so:

-

Now that you've configured the app on the phone, let's switch over to OBS and get that setup (it's pretty easy!). First, start by creating a new source, then select DroidCam OBS in the dropdown.

![DroidCam OBS in OBS sources dropdown](https://files.dev47apps.net/img/droidcam_obs_plugin_list.png)

Once selected, the properties window should be visible where you can enter the IP address of DroidCam running on the phone (it should be visible on the phone's screen).

![DroidCam OBS plugin settings screen](https://files.dev47apps.net/img/droidcam_obs_props.png)

Once you have it configured and saved, you should now see a video feed of your phone's camera within OBS! I've been using this setup for a few days and I have had zero app crashes on the phone for +8hr sustained livestream sessions.
