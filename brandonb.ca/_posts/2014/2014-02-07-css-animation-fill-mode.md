---
title: CSS animation-fill-mode
date: 2014-02-07
---


One overlooked animation property, however, is the **animation-fill-mode** property.  This CSS property sets the state of the end animation when the animation is not running.  Here's a quick example:

<!-- break -->

```css
@keyframes fadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

.fadeIn {
  animation-name: fadeIn;
  animation-duration: 1s;
  animation-fill-mode: forwards;
}
```

In the case of my fadeIn animation, I want the element to stay at an opacity of 1 when the animation is complete.  If I don't set the value to forwards, the element would go back to an opacity of 0 after the animation runs.
