# Earth geography source

`earth-land.json` contains Natural Earth 1:110m land polygon coordinates, rounded to four decimal places. Geographic land boundaries supply coastline segments and the node land mask; they contain no infrastructure or deployment data.

Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson

Terms: https://www.naturalearthdata.com/about/terms-of-use/ — Natural Earth vector and raster map data are public domain.

`python scripts/generate-earth-assets.py` regenerates `public/earth-monochrome.svg` from the same bundled coordinates for reduced-motion and WebGL-fallback clients. Runtime rendering makes no external map requests.
