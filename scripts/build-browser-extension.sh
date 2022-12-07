#!/usr/bin/env bash

version=$(node -p "require('./package.json').version")

cd src
mkdir -p ../dist
rm -f "../dist/notion-enhancer-$version.zip"
zip -r9 "../dist/notion-enhancer-$version.zip" . -x electron/\*