---
title: Blog updates… again
date: 2015-06-28
---


Over the last year I've noticed that I don't create new posts from my mobile device like I used to when using Postach.io for my main blog. Because my needs have changed, I decided to change the tech of my site to suite those needs. Combine this with my tiredness for maintaining my year-old poorly constructed node-based blog appand you've got a perfect argument to switch to a Jekyll static site.

<!-- break -->

The first problem I realized would be an issue is the URL structure of my current blog has no trailing slashes, but the `permalink: pretty` setting for Jekyll adds trailing slashes. The closest thing I found to replicate what I wanted was using `/:title` instead for the permalink structure, and then uploading extension-less HTML files (removing the extension in the build process with Gulp) with the proper `Content-Type` headers. I tested this out on AWS S3 before realizing I could cut out the middleman and just use [Surge](https://surge.sh)! Surge allows you to serve the original HTML file containing the extension, however through some clever pre-thought by the Surge developers you can access the extension-less version of the files which allows you to just upload the files that are generated.

The second problem I faced was figuring out how to create the build system for all the assets, building locally, and deploying. I know that Jekyll and ruby could probably accomplish all of the above, however if you've met me or had the chance to work with me you'd know I really don't like Ruby. In fact, I almost used a node-based spin-off of Jekyll on Github but it had some of its own issues. I chose Gulp instead because I am familiar with it and you can do a lot of powerful tasks with minimal code.

The third and final problem I solved was figuring out how to get `<picture>` tag support in Jekyll. I originally tried a gem called [`jekyll-picture-tag`](https://github.com/robwierzbowski/jekyll-picture-tag) however it was an all-in image compression, scaling, and output plugin that did a little too much for me. At this point, I realized I just needed something to output in Liquid so I set out learning how to create my own custom Liquid tag. The final result after a lot of time reading Liquid docs turned into [this](https://gist.github.com/brandonb927/08b1ffdf7ab35a747c3f):

<script src="https://gist.github.com/brandonb927/08b1ffdf7ab35a747c3f.js?file=picture.rb"></script>

We'll see how this all works out for the future. I think it will stick around for awhile compared to my previous self-built platform that had tonnes of ongoing issues.
