---
title: Install Pillow with pip on OS X Mavericks 10.9.1
date: 2014-03-13
---


I recently ran into an issue on Mavericks where installing the python package Pillow would not install correctly and error out on my, referencing a clang error that I was in no mood to debug.

<!-- break -->

```bash
clang: error: unknown argument: '-mno-fused-madd' [-Wunused-command-line-argument-hard-error-in-future]
```

I Googled a solution for about 20 minutes until I found this: before running `pip install`, run this

```bash
export CFLAGS=-Qunused-arguments
export CPPFLAGS=-Qunused-arguments
```

Update: I've noticed as of version 5.1.0.0.1.1396320587 of XCode Command Line Tools, the above temp-fix doesn't seem to work is you're using `sudo` to install a package. To use `sudo`, make sure you append the `-E` flag

```bash
sudo -E pip install PACKAGE
```

Sources:

- <http://stackoverflow.com/a/22351527>
- <http://stackoverflow.com/a/22322645>
