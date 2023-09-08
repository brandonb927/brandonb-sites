---
title: TutsPlus Codepen Challenge 3
date: 2015-05-06
---

While reading my RSS feeds, the latest [TutsPlus Codepen challenge](http://webdesign.tutsplus.com/articles/codepen-challenge-3-favorite-google-font-pairs--cms-23865) popped up and naturally I checked it out. I was busy during the previous two challenges, but I was looking for something to occupy me at the moment so this seemed fitting. A day later, I created what you see below.

<!-- break -->

It's not much, but I like it. I learned a bit about using inline SVG in CSS as a background image, hacked some pseudo-elements, and rebuilt a simple `datalist` clearfix without using Google (mostly from memory though).

One of the bugs I ran into was that I originally wanted to use the Globe with meridians 🌐 Unicode character inside the the `h1:before { content: ''; }` however in the process of this I discovered that [Codepen has a nasty bug](https://blog.codepen.io/2013/10/18/unicode-characters-codepen/) where they only support a subset of Unicode due to their MySQL version not supporting above 3-point Unicode characters.

The other bug I ran into was using inline SVG inside of my LESS CSS. Apparently if you use CSS classes inside your SVG then try to stringify that SVG inline into a `background-image: url(…)` property, it will try to render the SVG in the DOM. I'm not sure if I'm the only one to run into this, but it tripped me up and forced me to base64 encode the SVG after I was done with it and then use that inline in the CSS.

The bottom line is, I turned this:

<p data-height="480" data-theme-id="0" data-slug-hash="mJdOva" data-default-tab="result" data-user="tutsplus" class='codepen'>See the Pen <a href='http://codepen.io/tutsplus/pen/mJdOva/'>Codepen Challenge #3</a> by Tuts+ (<a href='http://codepen.io/tutsplus'>@tutsplus</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

…into this, without modifying any HTML or using Javascript :)

<p data-height="542" data-theme-id="0" data-slug-hash="LVpGgv" data-default-tab="result" data-user="brandonb927" class='codepen'>See the Pen <a href='http://codepen.io/brandonb927/pen/LVpGgv/'>Codepen Challenge #3</a> by Brandon Brown (<a href='http://codepen.io/brandonb927'>@brandonb927</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

It was a really fun experience and I'm looking forward to joining in on the next Codepen challenge!
