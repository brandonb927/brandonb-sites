---
title: Running QTH.app with a custom tileserver for field operations
date: 2024-12-15
draft: true
---

Do you use a mac in the field and wish you had offline maps for APRS with QTH.app? The QTH.app blog has a [great article on this very topic](https://www.w8wjb.com/wp/2021/07/29/offline-maps-with-qth/) using OpenStreetMap data and Docker to run the database to house said data. The post is fairly lengthy so I've rewritten the important parts in a smaller, condensed version available for my own consumption that will remain up-to-date.

<!-- break -->
The first step is to download your region's data in `.osm.pbf` format from <https://download.geofabrik.de/>. For me, that is [North America](https://download.geofabrik.de/north-america.html).

Next, create a folder in your home directory to store the aforementioned region data, something like `~/.osm-data`.

After that, create the volumes in Docker to use for storing OSM data and rendered tiles:

```shell
docker volume create osm-data
docker volume create osm-tiles
```

Now that the volumes are ready, import your region data into the tile server container and have it retained across restarts by mounting the volumes:

```shell
docker run --rm \
  -e UPDATES=enabled \
  -v "~/.osm-data/canada-latest.osm.pbf":/data.osm.pbf \
  -v osm-data:/data/database \
  -v osm-data:/data/tiles \
  overv/openstreetmap-tile-server \
    import
```

Once the data is imported, run the tile server:

```shell
docker run -d \
  --name osm-tile-server \
  -p 8080:80 \
  -v osm-data:/data/database \
  -v osm-data:/data/tiles \
  overv/openstreetmap-tile-server \
    run
```

In QTH.app, in the menubar click View > New Layer > Local Tile Server; you can use the default URL template. If you click View in the menubar again you should see Local Tile Server as an option in the list above New Layer. Clicking on Local Tile Server here will allow you to disable, configure the URL, or remove it as a map layer.

## Resources

- <https://github.com/Overv/openstreetmap-tile-server>
