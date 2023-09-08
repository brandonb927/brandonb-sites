---
title: Use Google App Engine as your own personal CDN
date: 2013-04-02
---

Using [Postach.io](http://postach.io) to run this blog allows me to modify the theme of the site, even down to the HTML Doctype, including the JS and CSS running on the pages. The problem with this however is that if you have a lot of document-level styles and javascript running on the page, it tends to become quite unmanageable after awhile.

<!-- break -->

I was looking for a quick and dirty way to host some of my CSS and JS files, which are a few kilobytes each maybe, and could not find a reliable way to do so. I had tried using my Dropbox "public" folder and using the public URL to link directly to the files, but would constantly receive a 404 Not Found error if I refreshed the page calling the files too often. After this I tried to use Google Drive as my host, which provided a better experience as Google has recently implemented a native way to use the service to host small HTML/CSS/JS sites ~https://googledrive.com/host/0B716ywBKT84AMXBENXlnYmJISlE/GoogleDriveHosting.html~ (dead link). The problem with this solution is that there are two calls made for the same file with one receiving a 302 Moved Permanently and the other being the actual file with correct mime type. This is a less than ideal experience, so I sought after a more permanent solution.

After alot of Googling, I stumbled upon a site which shows you how to use Google App Engine as a free CDN. ~~Here is a Windows 7 Guide http://www.ifunky.net/Blog/post/Using-Google-App-Engine-as-a-Free-CDN.aspx and a Mac OS X http://blog.pandastream.com/post/45830428506/affordable-ssl-cdn-with-appengine~~ These sites are no-longer available. The specifications for a free account on AE are a limit of 5 million requests per month, and a creation maximum of 10 instances. For strictly hosting of CSS and JS, this is the ideal solution I was looking for!

Now for the good part: implementing your own content delivery network!

### Minimal command-line/terminal knowledge required beyond this point

#### Create your own CDN

1. Signup for [Google App Engine](https://appengine.google.com/)
2. Install the app-engine toolkit on your machine. On OS X with `homebrew` installed: `brew install google-app-engine`
3. Create a new local folder anywhere on your computer and add an `app.yaml` file in it. Setup your `app.yaml` like so:

```yaml
application: application-identifier-here
version: 1
api_version: 1
runtime: python27
threadsafe: true
handlers:
  - url: /css
    static_dir: css
    mime_type: text/css
  - url: /js
    static_dir: js
    mime_type: text/javascript
```

4. Push your code from the root of your local folder with `appcfg.py --oauth2 update .` (**note:** the `--oauth2` option is thrown in there so that consecutive updates don't require a username/password combo every time you run the command)
5. Now use the url `http://application-identifier-here.appspot.com/` to reference your CSS/JS files
6. In order to update your files, run `appcfg.py --oauth2 update .` in the folder containing your files and `app.yaml`, and to be safe you should add/increment the cache-buster when referencing the styles/JS. Example (add the angle brackets):

```css
link rel="stylesheet" href="http://application-identifier-here.appspot.com/css/styles.css?v=0.1"
(would become ?v=0.2 to break the browser cache)
```

7. Enjoy your new personal CDN!
