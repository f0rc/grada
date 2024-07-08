#!/bin/bash

# Define icon file and sizes
ICON_FILE="hourglass_flowing_sand.png"
SIZES=(128 16 32 48 96)

ICONS_DIR="./public/icon"

mkdir -p "$ICONS_DIR"

for size in "${SIZES[@]}"; do
    OUTPUT_FILE="${ICONS_DIR}/${size}.png"
    magick "$ICON_FILE" -resize "${size}x${size}" -background none -gravity center -extent "${size}x${size}" "$OUTPUT_FILE"
    if [ $? -ne 0 ]; then
        echo "Failed to generate icon: $OUTPUT_FILE"
    fi
done

echo "Icons generated in ${ICONS_DIR}/"
