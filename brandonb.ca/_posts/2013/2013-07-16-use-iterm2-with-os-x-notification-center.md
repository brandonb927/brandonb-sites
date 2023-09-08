---
title: Use iTerm2 with OS X Notification Center
date: 2013-07-16
---


A user in the comments of [this post](http://www.sergeymarkov.com/blog/2013/07/using-iterm-and-growl/)  mentioned a great way to use Notification Center for terminal notifications, very cool.

<!-- break -->

> I also use something like this : Once you installed terminal-notifier, you can also bypass growl completely and use the notification center, having a function like

```bash
function growl() {
  terminal-notifier -activate com.googlecode.iterm2 -title "Pssssst !!" -subtitle "A message from your shell:" -message "$@"
}
```

> Because popup notifications are numerous those days, I also added an audio notification in my growl function :


```bash
function groooowl() {
  terminal-notifier -activate com.googlecode.iterm2 -title "Pssssst !!" -subtitle "A message from your shell:" -message "$@"
  say "$@"
}
```
