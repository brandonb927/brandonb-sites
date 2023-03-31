#!/bin/sh
packages=(
  pkg-config
  cairo
  pango
  libpng
  jpeg
  giflib
  librsvg
)

for package in "$packages[@]"; do
  brew list $package &>/dev/null || brew install $package
done
