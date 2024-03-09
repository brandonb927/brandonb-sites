#!/bin/sh

# Install these upon pulling the repo for the first time

packages=(
  pkg-config
  cairo
  pango
  libpng
  optipng
  jpeg
  mozjpeg
  giflib
  librsvg
)

for package in "${packages[@]}"; do
  brew list "$package" &>/dev/null || brew install "$package"
done
