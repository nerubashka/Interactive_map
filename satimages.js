const center = [-98.8, 37.9]

const mbMap = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/dark-v11',
    //attributionControl: false,
    //boxZoom: false,
    center: center,
    container: 'map'
    //doubleClickZoom: false,
    //dragPan: false,
    //dragRotate: false,
    //interactive: false,
    //keyboard: false,
    //pitchWithRotate: false,
    //scrollZoom: false,
    //touchZoomRotate: false,
});

map.on('load', () => {
  mbMap.addSource('radar', {
    'type': 'image',
    'url': 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    'coordinates': [
    [-80.425, 46.437],
    [-71.516, 46.437],
    [-71.516, 37.936],
    [-80.425, 37.936]
    ]
  });
  map.addLayer({
    id: 'radar-layer',
    'type': 'raster',
    'source': 'radar',
    'paint': {
    'raster-fade-duration': 0
    }
  });
})
/*
const mbLayer = new ol.layer.Layer({
    render: function (frameState) {
      const canvas = mbMap.getCanvas();
      const viewState = frameState.viewState;
  
      const visible = mbLayer.getVisible();
      canvas.style.display = visible ? 'block' : 'none';
      canvas.style.position = 'absolute';
  
      const opacity = mbLayer.getOpacity();
      canvas.style.opacity = opacity;
  
      // adjust view parameters in mapbox
      const rotation = viewState.rotation;
      mbMap.jumpTo({
        center: toLonLat(viewState.center),
        zoom: viewState.zoom - 1,
        bearing: (-rotation * 180) / Math.PI,
        animate: false,
      });
  
      // cancel the scheduled update & trigger synchronous redraw
      // see https://github.com/mapbox/mapbox-gl-js/issues/7893#issue-408992184
      // NOTE: THIS MIGHT BREAK IF UPDATING THE MAPBOX VERSION
      if (mbMap._frame) {
        mbMap._frame.cancel();
        mbMap._frame = null;
      }
      mbMap._render();
  
      return canvas;
    },
    source: new ol.source.Source({
      attributions: [
        '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a>',
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
      ],
    }),
});
layers[2].push(mbLayer)
map.addLayer(mbLayer)

const cities = new ol.layer.HeatmapLayer({
    source: new VectorSource({
      url: 'data/geojson/world-cities.geojson',
      format: new GeoJSON(),
    }),
    weight: function (feature) {
      return feature.get('population') / 1e7;
    },
    radius: 15,
    blur: 15,
});
layers[2].push(cities)
map.addLayer(cities)
*/