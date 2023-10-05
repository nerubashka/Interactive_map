/*(function () {
    var logger = document.getElementById('log')
    console.log = function () {
      for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === 'object') {
            logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />'
        } else {
            logger.innerHTML += arguments[i] + '<br />'
        }
      }
    }
})()

const butClear = document.getElementById('clearLogButton')
butClear.onclick = () => {
    $('#log').text('')
}*/

console.log('main')

const fColor = '#fa9868'
const sColor = '#31032A'
let draw = 42
let translate = 42

const mapSave = {
    layers: [], 
    features: [],
    images: []
} 

const layerStyles = [
    'OSMVectorTileLayer',
    'Aerial',
    'AerialWithLabelsOnDemand',
    'RoadOnDemand',
    'CanvasDark'
]

mapSave.layers.push(
    new ol.layer.Tile({
        visible: true,
        preload: Infinity,
        name: layerStyles[0],
        source: new ol.source.OSM(),
    })
)

let i, ii
for (i = 1, ii = layerStyles.length; i < ii; ++i) {
    mapSave.layers.push(
      new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        name: layerStyles[i],
        source: new ol.source.BingMaps({
          key: 'Aj1wlFu3oQesdVRbVqRCya26QH4JFMroG6Krq8IiHhTDou2IOMVE7Rh2KbghTfSf',
          imagerySet: layerStyles[i],
        }),
      })
    )
}

// ------------------------------------------------------------

const map = new ol.Map({
    controls: [new ol.control.ScaleLine()], //{units: 'metric'}
    view: new ol.View({
        center: [4175891.7770009562, 7494601.666061781],
        zoom: 5,
    }),
    layers: mapSave.layers,
    target: 'js-map',
    tap: false,
})

/*
// Кружок загрузки карты
map.on('loadstart', function () {
    map.getTargetElement().classList.add('spinner')
})
map.on('loadend', function () {
    map.getTargetElement().classList.remove('spinner')
})*/

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
    for (let i = 0, ii = mapSave.layers.length; i < ii; ++i) {
        mapSave.layers[i].setVisible(layerStyles[i] === style)
    }
}
ul.addEventListener('click', onChange)

// фишки
/*function MapControl() {
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
    *
}*/