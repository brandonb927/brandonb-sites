---
title: How to run a Windows-based VirtualBox APRS IGate/Digipeater with a Digirig
date: 2023-12-31
draft: true
---

This is another followup to my [post]({% post_url 2021/2021-12-14-the-road-to-getting-my-canadian-amateur-radio-basic-qualification %}) about getting my Amateur Radio Basic Qualification (with Honours) and being interested in APRS. I've since setup my own [APRS tracker that I run in my truck]({% post_url 2022/2022-11-18-raspberry-pi-aprs-tracker %}) and moved on to setting up an IGate/Digipeater with Direwolf in Virtualbox on Windows. My Kenwood TM-V71A mobile transceiver that I use as a base station is connected to a [DigiRig](https://digirig.net/product/digirig-mobile/) which interfaces with the computer over USB, and I use a Diamond X50A dual-band antenna (for now, but I plan to run a dedicated 2M radio and antenna in the future).

<!-- break -->

## Outline

- Install [Virtualbox 7.0](https://www.virtualbox.org/wiki/Downloads)
- Create a new virtual machine (Ubuntu Server 22.04 in my case) and get it ready to SSH into, then shut it down
- Plug the DigiRig into the Windows machine and setup a USB filter in Virtualbox for two of the new USB devices that show up:
  - `Silicon Labs CP2102N USB to UART Bridge Controller`
  - `C-Media Electronics Inc. USB PnP Sound Device`
- **IMPORTANT**: In Windows > Sound Settings, disable the UPnP Sound device and the UART to USB device as well then reboot the machine
- In the virtual machine: install the dependencies, configure the DigiRig USB symlink, and install Direwolf from [this post]({% post_url 2022/2022-11-18-raspberry-pi-aprs-tracker %})

If all goes well at this point you should have a functioning APRS IGate/Digipeater!
