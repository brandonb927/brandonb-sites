---
title: How to setup XAMPP-VM in MacOS
date: 2020-06-29
---

If you're someone just getting started with web development and you're leveling up your learning to include PHP and other server-side languages, and you have an Apple Mac product of some kind running macOS 10.15, it's very likely that you've ran into a wall trying to get your first `index.php` file to run. You could just open the Terminal.app and type `php index.php` which would run your file through the built-in php interpreter, but let's say you want to view it in your web browser; how do you do that? Well, this is where [XAMPP](https://www.apachefriends.org/index.html) comes in.

<!-- break -->

XAMPP is a suite of tools delivered to you as a single package that you download and install on your computer. Bundled inside it is Apache (a web server), MariaDB (an open source MySQL-compliant database server), PHP
(a server-side programming language), and Perl (a programming language that many people love). The XAMPP project is a great tool to use for developing websites as it is cross-platform (Windows and Linux packages are available for it too) and allows you to build your project before you move on to other more advanced ways of serving your content (like using other macOS tools, or even configuring a Docker-based setup).

The newer version of XAMPP for macOS is called [XAMPP-VM](https://www.apachefriends.org/download.html#download-apple). Unfortunately the [documentation](https://www.apachefriends.org/faq_stackman.html) for XAMPP-VM is a little lacking for beginners, so in this post I intend to fill in the gaps of knowledge. Note: It is expected that you understand the basics of how to configure an Apache server before moving on to the rest of this post.

---

## Installation

The first step to getting XAMPP-VM installed can be done one of two ways:

1. Install XAMPP-VM by downloading it [directly from the website](https://www.apachefriends.org/download.html#download-apple), opening the DMG file, and dragging the XAMPP.app file to the Applications folder.
2. Download and install it with homebrew (much easier).

   ```shell
   brew install xampp-vm
   ```

Once installed, run `XAMPP.app` from the Applications folder. You should be presented with the application containing some buttons and an empty "status" area. First thing you want to do is click the `Start` button here; this fires up the VM and gets the server running so we can complete the rest of the configuration. Next you want to click on the `Volumes` tab at the top, then `Mount`, then `Explore` once the `Mount` button is greyed out.

If you clicked `Explore`, Finder should open to the location where the XAMPP server config is available to browse. Click on the `etc` folder here, then go to the next section.

## Apache

There's a few tweaks you need to make to the Apache config before moving forward:

### Main config `httpd.conf`

Find and edit the `httpd.conf` file in the `etc` folder, and uncomment the line containing `#Include etc/extra/httpd-vhosts.conf` by removing the `#`. This will allow us to configure Apache using [VirtualHosts](https://httpd.apache.org/docs/2.4/vhosts/) without having to edit the main Apache config file anymore.

### VirtualHosts `httpd-vhosts.conf`

From the `etc` folder click on the `extra` folder and then open the `httpd-vhosts.conf` file in your editor. You should be presented with a file containing two dummy entries, feel free to delete the last entry and edit the first one to match the example below:

```apache
<VirtualHost *:80>
  DocumentRoot "/opt/lampp/htdocs/testfolder"
  ServerName testserver
</VirtualHost>
```

**Note:** I haven't tested the below configuration myself, but someone reached out to me on Twitter and mentioned that the above configuration alone did not work for them, they had to use something like this below; YMMV 🤷‍♂️

```apache
<VirtualHost *:80>
  DocumentRoot "/opt/lampp/htdocs/testfolder"
  ServerName testserver
  <Directory "/opt/lampp/htdocs/testfolder">
    Require all granted
    AllowOverride all
    Allow from all
  </Directory>
</VirtualHost>
```

In Finder, create a new folder called `testfolder` inside the `htdocs` folder that resides next to the `etc` folder we've been doing our edits in.

### Hosts file `/etc/hosts`

Open the `/etc/hosts` file and add a new entry like so:

```plain
127.0.0.1 testserver
```

Make sure the value you used in the vhosts config file matches the server name in the hosts file (in this case we use `testserver`).

### Testing in a browser

Open your browser and navigate to `http://testserver:8080`. You should be presented with an index file listing page that should be blank. If yes, you've successfully configured Apache to server your PHP files! Now all you need to do is start writing your PHP files inside the `/opt/lampp/htdocs/testfolder` folder and you should be able to view them in your browser.

## Developing a PHP application in XAMPP-VM

The core piece of this post is this: **all development work needs to happen inside of the mounted `lampp` folder**. This means you can't symlink your Dropbox folder or any other folder from your local drive into the XAMPP-VM drive, but instead have to copy-paste your work from elsewhere in, or work from directly inside the VM drive. The XAMPP blog has a [great post](https://www.apachefriends.org/blog/xampp_vm_cakephp_20170711.html) covering this.

The reason for this: When you clicked the `Mount` button above, this triggered XAMPP.app to "mount a network drive" and symlinked it in Finder so you could access it easily. When you "Unmount" the drive or shut down the VM, you can no-longer access your server content because it resides within the mounted network drive.
