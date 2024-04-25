---
title: How to build a Raspberry Pi APRS Tracker using Dire Wolf
date: 2022-11-18
date_modified: 2023-04-04
---

{% include ad/vpn.html %}

This is a follow up to my [last post]({{ site.url }}{% post_url 2021/2021-12-14-the-road-to-getting-my-canadian-amateur-radio-basic-qualification %}) about getting my Amateur Radio Basic Qualification (with Honours) and being interested in APRS. Since then, I've made some progress in my ham radio journey and setup my own APRS tracker that I run in my truck! This allows me to go explore our backcountry roads without fear that I will get lost.

What lies beyond is mostly a brain dump of notes I made over the course of putting this project together so that in the future I can refer back to it when I forget some things about the setup. I'm hoping that it helps you when setting up your own APRS tracker using some open-source software called Dire Wolf and some other relatively inexpensive hardware.

It's worth noting that this post does not cover any of the hardware setup required with a VHF radio, antenna, power requirements, etc.; In the future I may put together a part two post outlining my setup and how I have everything configured.

📡 VE7TZB

<!-- break -->

{% responsive_image path:_assets/media/posts/2022-11-18-digirig.jpg alt:"DigiRig USB Audio device" %}

There are some things you need to get started:

- A Raspberry Pi 3 B+ (or newer, it's what I had on hand). You may be able to accomplish this with a lower-powered Raspberry Pi device, like a Zero W, but your mileage may vary.
- A {% amazon B098JTXXZM "Baofeng UV-5R" %} or other VHF (2 meter, 144MHz band) radio
  - If using the aforementioned UV-5R you'll need to [make your own](https://github.com/johnboiles/BaofengUV5R-TRRS) cable, or purchase a {% amazon B01LMIBAZW "BTech APRS K1 cable" %}).
- A [DigiRig v1.9](https://digirig.net/product/digirig-mobile/) all-in-one audio device to receive and transmit audio to and from your radio.
  - Alternatively you could [build your own](https://allstarsetup.com/how-to-modify-a-cm108-sound-fob-for-allstar/) with a [CM108-based audio device](https://allstarsetup.com/how-to-add-indicator-leds-to-a-cm108-based-allstar-node/). The upside of using the DigiRig is that it can also control some radios using the CAT interface over a serial connection (I won't get into how that works in this post).
    - {% amazon B07KN3TXVG "3.5mm headphone/microphone audo splitter" %} to get the audio and microphone into the Raspberry Pi if building your own cable.
    - A [PTT-control circuit](https://electronics.stackexchange.com/a/519404) for the Raspberry Pi to be able to trigger PTT if you don't go with the DigiRig above. It is possible to build your own using a 5V optocoupler which I have done with good success.
- {% amazon B07315DPC1 "USB GPS device" %} — practically any USB GPS device should work but this is the one I purchased and I can confirm works for this project ([with a caveat](#ublox-gps-caveat)).

### Install OS Dependencies

The setup for this build assumes the use of a Debian-based OS, in my case I use Ubuntu 22.04 Server.

```shell
sudo apt install -y vim git gcc gpsd gpsd-clients g++ make cmake ntp screen \
  avahi-daemon libasound2-dev libudev-dev libavahi-client-dev libgps-dev
```

### GPS config (for Dire Wolf)

Create `/etc/udev/rules.d/49-usb-gps.rules` and add:

```conf
# Force USB to specific `tty` if more than one serial device present on system (GPS and DigiRig compete)
# https://gist.github.com/edro15/1c6cd63894836ed982a7d88bef26e4af
KERNEL=="ttyACM[0-9]*", SUBSYSTEM=="tty", ATTRS{idVendor}=="1546", ATTRS{idProduct}=="01a7", SYMLINK="ttyGPS"
```

Edit `/etc/default/gpsd` to add:

```conf
START_DAEMON="true"
USBAUTO="true"
DEVICES="/dev/ttyGPS"
GPSD_SOCKET="/var/run/gpsd.sock"
GPSD_OPTIONS="-n"
```

After configuring the GPS dependencies, initialize the service with:

```shell
sudo systemctl enable gpsd
sudo systemctl start gpsd
```

Now's a good time to upgrade `gpsd` to a version without a very [worrisome bug](https://austinsnerdythings.com/2021/10/01/how-to-update-gpsd-by-building-from-source/). Follow the link and build `gpsd` from source.

To retain accurate time on the device when it loses power, as there is no CMOS battery on a Raspberry Pi or a continuous power supply and it will unlikely be connected to a time server over a network, we can run `sudo vim /etc/ntp.conf` to edit the NTP service config file to pull extremely accurate time from the GPS receiver instead:

```conf
server 127.127.28.0 4
fudge 127.127.28.0 time1 0.340 refid GPS
server 127.127.28.1 prefer
fudge 127.127.28.1 refid GPS1
```

### Install Dire Wolf

From the [DireWolf repository](https://github.com/wb2osz/direwolf) on Github:

> #### Decoded Information from Radio Emissions for Windows Or Linux Fans
>
> In the early days of Amateur Packet Radio, it was necessary to use an expensive "Terminal Node Controller" (TNC) with specialized hardware. Those days are gone. You can now get better results at lower cost by connecting your radio to the "soundcard" interface of a computer and using software to decode the signals.

Dire Wolf uses the Raspberry Pi to encode and decode audio sent and received from the DigiRig. It can even sent CAT control commands to control your radio over USB if it is supported!

NOTE: On a MacBook with an M1 chip running macOS 13.3, I had to run `brew install cmake portaudio` as dependencies prior to running the build.

```shell
cd ~
git clone https://www.github.com/wb2osz/direwolf && cd direwolf
git checkout dev
mkdir build && cd build
cmake .. && make -j4 && sudo make install && make install-conf
```

Modify the `dw-start.sh` script and append `-l /var/log/direwolf` to the commandline arguments variable. This gives us the ability to view the logs of the running `direwolf` process in one place.

Every once in awhile it's good to update Dire Wolf with the latest changes and commits from the upstream `dev` branch. To do this, run `git pull origin dev && cd build && sudo make install`.

### DigiRig config (for Dire Wolf)

Create a shortcut for the Digirig USB device by creating `/etc/udev/rules.d/85-usb-digirig.rules`:

```conf
SUBSYSTEM=="tty", GROUP="dialout", MODE="0660", ATTRS{product}=="CP2102N USB to UART Bridge Controller", SYMLINK+="ttyDigiRig"
```

Don't forget to run after the previous step:

```shell
sudo chmod 0644 /etc/udev/rules.d/85-usb-digirig.rules && sudo udevadm control --reload-rules && sudo reboot
```

## Boot config (specific for rPi 3)

Edit `/boot/firmware/config.txt` to modify the boot-time configuration for the DigiRig and GPS to play nice with USB stack:

```plaintext
dtoverlay=dwc2 # Add this below previous dtoverlay for gpio pins, enables new usb stack
```

### Sound (Alsamixer) config

You **may** have to add the user you're using for this setup to the `audio` and `dialout` groups in order to work with audio and serial devices, so YMMV here:

```shell
usermod -a -G audio <USERNAME>
usermod -a -G dialout <USERNAME>
```

Run

```shell
alsamixer
```

then press F6 to show all devices. Select the DigiRig sound device. Press F5 to show all options, then set the sound to 10, unmute the Mic and set to 10 as well, then set the Capture to 10. Disable the Automatic Gain by pressing `m` when highlighted. `Esc` to exit, then store the settings with

```shell
alsactl store
```

The above settings are only important when using an un-attenuated homebrew cable.

### RaspAP config

Install and configu raspAP

```shell
sudo raspi-config # Set Localisation for WiFi country

curl -sL https://install.raspap.com | bash
```

During the install of RaspAP, respond `Y` to everything except VPN-related questions.

Once RaspAP installed, Login to the UI with `admin/secret`, then change:

- Toggle Dark mode in the top bar
- System > Advanced tab > Web server port to 8080, Save, go back to tab and restart lighttp
- Authentication > Update password
- Hotspot > Basic tab > SSID, change to preferred name
- Hotspot > Basic tab > Wireless Mode, change to "802.11n"
- Hotspot > Security tab > Change PSK to preferred value
- Hotspot > Advanced tab > Toggle "Hide SSID in broadcast" to on
- Hotspot > Advanced tab > Change Maximum number of clients to 5

### Dire Wolf config

Empty the `/home/aprs/direwolf.conf` file and replace it with the contents below. Remember to replace the callsign with your own!

```conf
ADEVICE  plughw:1,0
CHANNEL 0
MYCALL [CALLSIGN]
MODEM 1200
PTT /dev/ttyDigiRig RTS

DIGIPEAT 0 0 ^WIDE[3-7]-[1-7]$|^TEST$ ^WIDE[12]-[12]$ TRACE

# Enable GPS beaconing
GPSD
TBEACON EVERY=4 VIA=WIDE1-1,WIDE2-1 SYMBOL=/k
SMARTBEACONING  60 2:00  5 15:00  0:15 30 255
```

To auto-run Dire Wolf on boot, add this to `crontab -e`:

```cron
* * * * *  $HOME/dw-start.sh  >/dev/null  2>&1
```

#### Ublox GPS caveat

If using a UBlox-based GPS puck, modify the `dw-start.sh` script and append the following before Dire Wolf is started. It will reset the GPS device state prior to starting Dire Wolf.

```shell
ubxtool -p RESET
```

This "fix" is because of an [issue](https://groups.io/g/direwolf/message/5973) with the UBlox-based GPS puck I used [not updating past the first location lock](https://old.reddit.com/r/hacking/comments/qg64n2/kali_kismet_and_a_gps_dongle_that_doesnt_want_to/). This issue took me days to diagnose and pin down a bandaid fix for. It is optional to include it in the command above here so if you're not using a UBlox-based GPS device your mileage may vary.

### Hardening

#### Disable bluetooth

Let's disable the Bluetooth modem as it's not needed for our purposes (unless you plan to use it). Add the following to the `/boot/config.txt`:

```plaintext
# Disable Bluetooth
dtoverlay=disable-bt
```

then disable any bluetooth-related services and uninstall packages with:

```shell
sudo systemctl disable hciuart.service
sudo systemctl disable bluealsa.service
sudo systemctl disable bluetooth.service
sudo apt purge -y bluez
sudo apt autoremove -y
```

#### Firewall

Setup a simple firewall to keep people from abusing connecting to the rPi wireless network. There is a lot more that could be done here but this is not a [linux server ssh hardening article](https://linuxhandbook.com/ssh-hardening-tips/).

```shell
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw limit 2022/tcp comment 'SSH port rate limit'
sudo ufw limit 8001/tcp comment 'KISS port for Dire Wolf'
sudo ufw logging on
sudo ufw enable
```

Don't forget to disable IPV6 in UFW; change `IPV6=yes` to `IPV6=no`:

```shell
sudo vim /etc/default/ufw
sudo ufw disable && sudo ufw enable
```

#### Disable the swapfile

We want to write as little to the SD card as possible to extend the life of it, and 4GB of memory is more than enough to run things without swapping.

```shell
sudo systemctl stop dphys-swapfile
sudo systemctl disable dphys-swapfile
sudo apt purge dphys-swapfile
```

{% comment %}

#### Setup logging to a separate drive

```shell
sudo apt install btrfs-tools
sudo mkfs.btrfs -m single /dev/sda # Use /dev/sda or USB drive disk
sudo mkdir /var/log/direwolf
```

Modify the `/etc/rsyslog.d/01-direwolf.conf` file to append:

```shell
if $programname == 'direwolf' then /var/log/direwolf/direwolf.log
if $programname == 'direwolf' then ~ # Discards the message after logging in direwolf.log
```

then run `sudo systemctl restart rsyslog`.

This log file will grow rapidly in size so we apply logrotate to it. Create `/etc/logrotate.d/direwolf` and add:

```text
/var/log/direwolf/direwolf.log {
  rotate 7
  daily
  missingok
  notifempty
  delaycompress
  compress
  postrotate
  invoke-rc.d rsyslog rotate > /dev/null
  endscript
}
```

#### Overlay filesystem

Setting up an "overlay filesystem" makes the filesystem read-only, which is good because

One of the best ways to mitigate both these issues is to change the root file system to read-only. This would be fine except for all those files that actually need to be written and modified during the normal execution! There is however a neat solution to this problem – Overlay Filesystem – which is now built into the Linux kernel. This is a slightly complex, but very useful, capability which creates essentially a merged filesystem with an "upper" and "lower" layer. In our case, we can set the "lower" layer to be the read-only root filesystem and the "upper" layer to be a RAM-based temporary filesystem to store those files that are changed during operation. When the power is cycled, the system will come up in the state of the "lower" file system which is in a clean state.

```shell
cd /sbin
sudo wget https://github.com/ppisa/rpi-utils/raw/master/init-overlay/sbin/init-overlay
sudo wget https://github.com/ppisa/rpi-utils/raw/master/init-overlay/sbin/overlayctl
sudo chmod +x init-overlay overlayctl
sudo mkdir /overlay
sudo overlayctl install
sudo reboot
```

Because thi

```shell
sudo overlayctl disable
sudo reboot
```

#### Persistent filesystem

```shell
sudo mkdir /var/log/persistent
sudo chmod go+wt /var/log/persistent
```

Fix up fake-hwclock by adding the following to /etc/default/fake-hwclock:

```text
FILE=/var/log/persistent/fake-hwclock.data
```

We also need to make sure fake-hwclock doesn't start until the filesystems are mounted. This is achieved by adding to the fake-hwclock.service scripts as follows:

```shell
cd /etc/systemd/system
sudo cp /lib/systemd/system/fake-hwclock.service .
```

Edit the `.service` file and add the following line to the `[Unit]` section and comment out the `Before=` line:

```text
After=local-fs.target
#Before=sysinit.target
```

{% endcomment %}

#### Watchdog

It's advisable to protect against random lockups and issues using the hardware "watchdog" built into the Raspberry Pi. This is a piece of hardware built into the SoC that continually counts down a counter — if it ever reaches zero, a hard reset of the system is generated.

There is a watchdog daemon that "feeds" the watchdog by reseting the counter periodically. Run the following enable the daemon:

```shell
sudo apt install -y watchdog
```

Modify `/etc/watchdog` to set the device line as follows:

```text
watchdog-device = /dev/watchdog
```

Edit the `/etc/systemd/system/watchdog.service` file to include autostart by copying as follows:

```shell
sudo cp /lib/systemd/system/watchdog.service /etc/systemd/system/watchdog.service
```

Edit the previous file to add this line:

```text
[Install]
WantedBy=multi-user.target
```

Edit `/etc/sysctl.conf` to add the line:

```text
kernel.panic=10
```

which forces a reboot 10 seconds after a kernel panic.

## Resources

Here's a list of some of the resources I used to compile this information:

- <https://vk3il.net/projects/raspberry-pi-based-aprs-trackerdigipeaterigate/>
- <https://dl1gkk.com/setup-raspberry-pi-for-ham-radio/>
- <https://di-marco.net/blog/it/2020-04-18-tips-disabling_bluetooth_on_raspberry_pi/>
- <https://groups.io/g/direwolf/topic/88057638?p=,,,20,0,0,0::,,,0,0,0,88057638>
- <https://howchoo.com/g/mwnlytk3zmm/how-to-add-a-power-button-to-your-raspberry-pi>
