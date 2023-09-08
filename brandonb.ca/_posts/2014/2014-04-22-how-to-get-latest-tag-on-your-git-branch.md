---
title: How to get the latest tag on your Git branch
date: 2014-04-22
---


I frequently look at the latest tag when working on [Postach.io](http://postach.io) in Git and because we have so many it takes me a few seconds to look through the list to find the latest one. This little snippet can do that for me in one command!

<!-- break -->


```bash
git describe --abbrev=0 --tags
```

An even better way to have this work is to add it to my aliases in terminal and call one command instead of remembering this chain of arguments:

```bash
alias glt="git describe --abbrev=0 --tags"
```


Now in your terminal you can call:

```bash
glt
```
