//import BingMaps from 'ol/source/BingMaps.js';
//import Map from 'ol/Map.js';
//import TileLayer from 'ol/layer/Tile.js';
//import View from 'ol/View.js';

const layers = [[], [], []] //['ol'], ['vector'], ['raster']

const styles = [
    'OSMVectorTileLayer',
    'Aerial',
    'AerialWithLabelsOnDemand',
    'RoadOnDemand',
    'CanvasDark'
]

layers[0].push(
    new ol.layer.Tile({
        visible: true,
        preload: Infinity,
        source: new ol.source.OSM(),
        title: 'OSM VectorTileLayer',
    })
)

let i, ii;
for (i = 1, ii = styles.length; i < ii; ++i) {
    layers[0].push(
      new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.BingMaps({
          key: 'Aj1wlFu3oQesdVRbVqRCya26QH4JFMroG6Krq8IiHhTDou2IOMVE7Rh2KbghTfSf',
          imagerySet: styles[i],
        }),
      })
    )
}

// ------------------------------------------------------------

const map = new ol.Map({
    view: new ol.View({
        center: [4175891.7770009562, 7494601.666061781],
        zoom: 5,
    }),
    layers: layers[0],
    target: 'js-map',
})

/*
const center = [-98.8, 37.9]

const mbMap = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/dark-v11',
    center: center,
    container: 'map'
})

mbMap.addSource('radar', {
    'type': 'image',
    'url': 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    'coordinates': [
    [-80.425, 46.437],
    [-71.516, 46.437],
    [-71.516, 37.936],
    [-80.425, 37.936]
    ]
})

layers[2].push({
    id: 'radar-layer',
    'type': 'raster',
    'source': 'radar',
    'paint': {
    'raster-fade-duration': 0
    }
})
map.addLayer(layers[2][0])*/



const ul = document.querySelector('#layers')
function onChange(event) {
    const eTarget = event.target
    let style = ''
    if (eTarget.localName === 'a') {
        style = eTarget.parentElement.outerHTML.split('"')[1]
    }
    else if (eTarget.localName === 'li') {
        style = eTarget.outerHTML.split('"')[1]
    }
    console.log(style)
    for (let i = 0, ii = layers[0].length; i < ii; ++i) {
        layers[0][i].setVisible(styles[i] === style)
    }
}
ul.addEventListener('click', onChange)
/*
const map = new ol.Map({
    view: new ol.View({
        center: [4175891.7770009562, 7494601.666061781],
        zoom: 5,
        //maxZoom: 15,
        //minZoom: 3,
        //rotation: 3.14 // поворот карты в радианах
    }),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            title: 'OSM VectorTileLayer'
        })
    ],
    target: 'js-map'
})*/

// add Vector Layers
function addVectorGeoJSON(fileName) {
    fileUrl = './data/' + fileName
    layerTitle = fileName.split('.')[0]
    const layerGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector ({
            url: fileUrl,
            format: new ol.format.GeoJSON()
        }),
        visible: true,
        title: layerTitle
    })
    map.addLayer(layerGeoJSON)
}

// upload vector data
const uploadFile = document.getElementById('upload-file')
uploadFile.addEventListener('change', ()=>{
    if (uploadFile.value){
        fileName = uploadFile.value.match(/[\/\\]([\w\d\s\.\-(\)]+)$/)[1]
        addVectorGeoJSON(fileName)
        console.log(fileName + ' loaded')
        console.log(uploadFile)
    }else {
        console.log('File not selected')

    }
})
function UploadFileGeoJSON(){
    uploadFile.click()
}

// фишки
function MapControl() {
    // выводит координаты клика в консоль
    map.on('click', function(e){
        cords = e.coordinate
        console.log(cords)
    })
    /*
    var layerSwitcher = new ol.control.layerSwitcher({
        activationMode: "click",
        startActive: false,
        groupSelectStyle: "children"
    })
    map.addControl(layerSwitcher)
    
    // переключатель видимости слоев
    map.addControl(
        new ol.control.LayerSwitcher({
            'ascending' : false
        })
    );
    
    // координаты текущего положения мыши
    // преобразование из метров в градусы с помощью proj4js
    map.addControl(
        new ol.Control.MousePosition({
            displayProjection: new ol.Projection('EPSG:4326')
        })
    );
    */
}