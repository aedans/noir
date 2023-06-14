mkdir -p ./public/images

for in in ./public/art/*.png
do
  name=$(basename -- "$in")
  echo "Processing $name"
  convert "$in" -resize 960x540 +dither -remap ./public/cmap.png -transparent '#767676ff' "./public/images/$name"
  optipng "./public/images/$name" -quiet -clobber
done

echo
echo "Disk Usage:"
du -sh ./public/art
du -sh ./public/images