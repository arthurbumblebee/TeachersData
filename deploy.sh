#!/bin/bash

# Deploy script for Jekyll website

jekyll build && rsync -az --delete _site www-edit@ocean-dev:/var/www/html/envdata.bigelow.org/

exit 0