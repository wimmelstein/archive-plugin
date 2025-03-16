#!/bin/bash

# Install ImageMagick if not already installed
if ! command -v magick &> /dev/null; then
    echo "ImageMagick is required. Please install it first."
    echo "On macOS: brew install imagemagick"
    echo "On Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Generate icons in different sizes
magick icon.svg -background none -resize 16x16 icon16.png
magick icon.svg -background none -resize 48x48 icon48.png
magick icon.svg -background none -resize 128x128 icon128.png

echo "Icons generated successfully!" 