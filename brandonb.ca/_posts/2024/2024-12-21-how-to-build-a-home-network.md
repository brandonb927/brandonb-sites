---
title: How to build a robust home network with Ubiquiti and UniFi
date: 2024-12-21
draft: true
---

Ever since I graduated from the [ITAS program at VIU]({% post_url 2019/2019-12-31-2010-2020-a-decade-in-the-mirror %}#university-itas), I've had this nagging desire to build my own home network from scratch using enterprise-level hardware. My partner and I were fortunate enough to purchase our own home in the last year (yay 🎉!) and I was able to _finally_ scratch that itch.

In this post I will go over building out my home network from scratch, starting from wiring the house with Cat6 all the way to configuring the VLans and routing in a 12U network rack in my office closet.

<!-- break -->

## Parts List

### Network cable

Network cable is the most important part of a network; spending your money here will pay off for years to come. Fortunately, our house is only a single floor so I thought {% amazon B00VEFY7NQ "500ft of it" %} would be more than enough to do multiple runs to every room. Something to keep in mind when purchasing cable that will be installed inside the walls of your home:

- it should be [CMR-rated](https://www.cmple.com/learn/understanding-cable-jacket-ratings-cl-cm-cmr-and-cmp) which is important when running through wood walls as it has a fire-rating that is slower to burn than CM/CMA-rated cable
- Cat6 is better than Cat5e, and even though Cat5e _can_ carry gigabit speeds, it's generally better to install somewhat future-proof cabling in a home. Installing Cat6A/7/8 is generally cost-prohibitive and the ROI is much less over time
- the frequency rating for the cable is somewhat important, anything above 200MHz will do just fine

#### Fiber

One note I will add here is that I have FTTH (fiber to the home) provided by Telus. When I had the installer hook us up, I made sure that I had them provide an SFP module instead of using an ONT box that converts into copper ethernet that goes to the ISP router. Once the installer left, I identidied that the fiber cable used SC/APC connectors on both ends, then ordered a [65ft SC/APC](https://www.primecables.ca/p-362023-cab-fo-604-all-sca2-singlemode-simplex-scapc-to-scapc-9-micron-fiber-cable-3mm-jacket-lszh) cable to route through the attic into the eventual network closet.

### Equipment rack

We need a rack to hold all of the equipment, a monolith of technology, if you will. I decided to get a {% amazon B01M1OCOC7 "12U wall mount network rack" %} that is 19-inches wide and 12-inches deep, which means it can fit most standard rack-mount network equipment and even some not-so-deep server. Going with a 12U rack allows for expansion later on and was marginally more expensive than a 6-or-8U rack.

### Patch panel

In order to have all the network cabling come to one place in the network rack, a {% amazon B07M5QBL8G "24-port blank keystone 1U patch panel" %} is required to keep all the cabling nice and neat. If you were to install a patch panel, the count of ports is not what is important, but would you rather replace a single defective keystone than the whole patch panel?

If you're not familiar with a [keystone jack](https://www.cableorganizer.com/learning-center/how-to/how-to-wire-keystone-jack.htm) in this context, it's essentially a single connector with a female RJ45 connection on one side and some form of punch down connection on the other which allows you to connect bulk ethernet cable to one side and then install the keystone in a wall plate or blank patch panel.

Using a blank panel also means you can install other different types of keystones, like HDMI, etc. in should you decide to change the network configuration at a later point in time.

- CableCreation 20-pack {% amazon B01FHBZF7E "keystone punch down connector" %} — I got two of these which gives me 40 keystones to start with, and again this is a "it's cheaper to buy in bulk than single"

### Network equipment

We need a way to power all the equipment in the rack, so a {% amazon B0035PS5AE "8-outlet 1U rack mount PDU power strip, 120V/15A" %} should do the job.

I have some non-rackmountable equipment that needs to exist in the rack, so a {% amazon B01C9KYUG8 "1U vented steel rack shelf" %} with 60lbs of capacity should support it all. I might even pick up another one in the future.

- {% amazon B004ELA5W4 "TP-Link TL-SG1024D gigabit unmanaged, 1U rackmountable" %}
- [UniFi 8-port switch with PoE](https://ca.store.ui.com/products/unifi-switch-8-150w)
- [UniFi UDM Pro](https://ca.store.ui.com/products/udm-pro)
- ~[UniFi CloudKey Gen2 Plus](https://ca.store.ui.com/products/unifi-cloudkey-plus)~
- [UniFi Protect G4 Doorbell](https://ca.store.ui.com/products/uvc-g4-doorbell)
- [UniFi FlexHD Access Point](https://ca.store.ui.com/products/unifi-flexhd)
- 2x [UniFi NanoHD Access Point](https://ca.store.ui.com/products/unifi-nanohd-us)
- {% amazon B0868JXM17 "Punch down tool, supports 110" %}
- I really didn't need this many, but it was cheaper to buy 10-packs than single wall plates on Amazon:
  - {% amazon B074HH9Q6L "4-port 10-pack low profile keystone wall plate" %}
  - {% amazon B074HHDJWT "2-port 10-pack low profile keystone wall plate" %}
