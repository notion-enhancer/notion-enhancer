#!/usr/bin/env bash
set -e

BROWSER=${1:-chrome}
version=$(node -p "require('./package.json').version")
builddir="dist/build/$BROWSER"

rm -rf "$builddir"
mkdir -p "$builddir"
cp -r src/. "$builddir/"

if [ "$BROWSER" = "firefox" ]; then
  # Switch `service_worker: "x.js"`` to `scripts: ["x.js"]` for Firefox,
  sed -i 's/"service_worker": "\/worker.js"/"scripts": ["\/worker.js"]/' "$builddir/manifest.json"
fi

outfile="dist/notion-enhancer-$version-$BROWSER.zip"
rm -f "$outfile"
(cd "$builddir" && zip -r9 - .) > "$outfile"

echo "Built $outfile"
