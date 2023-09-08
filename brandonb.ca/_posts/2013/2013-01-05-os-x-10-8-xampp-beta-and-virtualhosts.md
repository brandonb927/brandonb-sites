---
title: OS X 10.8, XAMPP beta and VirtualHosts
date: 2013-01-05
---

**January 08, 2013 - Update: I tested this configuration on my Windows machine and it worked quite well with the latest non-beta version**

I used to use [WAMP Server](http://www.wampserver.com/en/) but since I moved to OS X for my personal life, WAMP is no longer an option. I'm starting to get serious about doing
local web development on my MacBook now and I have been using [XAMPP](https://www.apachefriends.org/index.html) as a local webserver for a few years now. When I reinstalled
OS X on my MacBook I forgot to install XAMPP as my usual routine for install an OS on one of my computers. I went to the website, downloaded the most recent version, then
realized it didn't come with a recent version of PHP (5.3.1 isn't recent enough for me!)

<!-- break -->

A simple Google search brought up the [XAMPP beta page](https://www.apachefriends.org/en/xampp-beta.html) on the XAMPP website. This version of XAMPP has an updated version of the following

- Apache 2.4.3
- PHP 5.4.7
- MySQL 5.5.28
- phpMyAdmin 3.5.4
- ProFTPD 1.3.4b
- Perl 5.14.2

Installing using the downloaded .DMG is as simple as mounting the image, and dragging the XAMPP folder inside the image to your Applications folder. Now you can start using
the XAMPP control panel to start/stop the Apache, MySQL and FTP servers. In order to start using the Apache server for developing websites with the virtual host interface,
you have to enable it in the `httpd.conf` file located in the Applications/XAMPP/etc on line 480

479 # Virtual hosts
480 Include etc/extra/httpd-vhosts.conf

Now that you've enabled the virtual host interface, you have to add an entry into your `/etc/hosts` file. Edit the file and append and entry to the bottom

    127.0.0.1 mysite.dev

You can name it whatever you want, I use a `.dev` notation for developing locally. Save the hosts file and now you have to add an entry to
`/Applications/XAMPP/etc/extra/httpd-vhosts.conf` to make your site available through your browser. Replace everything in the file with the following (your mileage my vary)

    <VirtualHost *:80>
      ServerName localhost
      DocumentRoot "/Applications/XAMPP/xamppfiles/htdocs"
    </VirtualHost>

    <VirtualHost *:80>
      ServerName mysite.dev
      DocumentRoot "/path/to/project/files"
      <Directory "/path/to/project/files">
        AllowOverride All
        Require all granted
      </Directory>
    </VirtualHost>

The one big change to note here is the inclusion of a new directive brought to the most recent versions of XAMPP

Require all granted

This is the block that had me stumped for a few hours during setup. The newer versions of XAMPP follow a far more strict security scheme and this is one of the added directives.
