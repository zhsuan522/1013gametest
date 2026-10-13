#!/bin/sh
set -eu
site_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$site_root/dist"
cp "$site_root/index.html" "$site_root/styles.css" "$site_root/app.js" "$site_root/dist/"
