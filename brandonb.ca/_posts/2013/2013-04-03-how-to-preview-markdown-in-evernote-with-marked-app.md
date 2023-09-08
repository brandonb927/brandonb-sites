---
title: How to preview Markdown in Evernote with Marked.app
date: 2013-04-03
---


Users of [Postach.io](http://postach.io) who choose to write their articles in Markdown might find it difficult to get their formatting right the first time (unless they happen to be a proficient Markdown writer) due to the lack of previewing in the app or on the web version. Before Postach.io, I used to write my blog posts in Sublime Text 2 and use the [Marked.app](http://markedapp.com/) Preview plugin which allows me to preview my Markdown-written post in [Marked.app](http://markedapp.com/).

<!-- break -->

This seemed like a great solution, until I moved my blogging to Evernote and Postach.io and things got a little hairy. I began to realize that I couldn't preview my Markdown easily without copy-pasting back into Sublime Text 2 and previewing from there. I needed a more clean solution, and quick.

After some Googling I found a way to get Evernote to make a local cached copy of the current note I was working on, complete with CMD+S 'Save' support. This solution solved my Markdown previewing issue but didn't hit the nail quite on the head in terms of automation, so I utilized a builtin OS X feature of running a `LaunchAgent` and now I never have to worry about manually starting the python script as it starts automatically when I login!

Follow the steps laid out in my [Github gist](https://gist.github.com/brandonb927/5283527).

<script src="https://gist.github.com/brandonb927/5283527.js"></script>
