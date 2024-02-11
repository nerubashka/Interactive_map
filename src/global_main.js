import Map from 'ol/Map.js'
import View from 'ol/View.js'
import {ScaleLine} from 'ol/control.js'
// draw-features
import {Vector as VectorSource, OSM, BingMaps} from 'ol/source.js'
import {Vector as VectorLayer, Tile} from 'ol/layer.js'
import Draw, {createBox, createRegularPolygon} from 'ol/interaction/Draw.js'
import {Modify, Translate, Select} from 'ol/interaction.js'
import {Circle, Fill, Stroke, Style} from 'ol/style.js'
import {getCenter} from 'ol/extent.js'
//import {parse as Parse} from 'geojson/geojson.js'
import GeoJSON from 'ol/format/GeoJSON.js'
import {getLength, getArea} from 'ol/sphere'
//sat-images
import GeoImageSource from 'ol-ext/source/GeoImage.js'
import GeoImageLayer from 'ol-ext/layer/GeoImage.js'

import './styles.css'
import '../node_modules/ol/ol.css'

console.log('global-main')

const fColor = '#fa9868'
const sColor = '#31032A'
let draw = 42

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
    new Tile({
        visible: true,
        preload: Infinity,
        name: layerStyles[0],
        source: new OSM(),
    })
)

let i, ii
for (i = 1, ii = layerStyles.length; i < ii; ++i) {
    mapSave.layers.push(
      new Tile({
        visible: false,
        preload: Infinity,
        name: layerStyles[i],
        source: new BingMaps({
          key: 'Aj1wlFu3oQesdVRbVqRCya26QH4JFMroG6Krq8IiHhTDou2IOMVE7Rh2KbghTfSf',
          imagerySet: layerStyles[i],
        }),
      })
    )
}

// ------------------------------------------------------------

const map = new Map({
    controls: [new ScaleLine()], //{units: 'metric'}
    view: new View({
        center: [4175891.7770009562, 7494601.666061781],
        zoom: 5,
    }),
    layers: mapSave.layers,
    target: 'js-map',
    tap: false,
})

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

// draw-features

const featureStyle = new Style({
    stroke: new Stroke({
        color: sColor,
        width: 1.5,
    }),
    fill: new Fill({
        color: fColor+'50',
    }),
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: fColor,
        }),
    }),
})
  
const selectedFeatureStyle = new Style({
    stroke: new Stroke({
        color: sColor,
        width: 4,
    }),
    fill: new Fill({
        color: sColor+'50',
    }),
    image: new Circle({
        radius: 7,
        fill: new Fill({
            color: sColor,
        }),
    }),
})

let select = new Select({
    style: selectedFeatureStyle
})
map.addInteraction(select)
select.setActive(false)

function getSelect () {
    return select.getFeatures().array_[0]
}

function setSelect (feature) {
select.features_.push(feature)
}

let source = new VectorSource()
const vector = new VectorLayer({
    source: source,
    style: featureStyle,
    name: 'geoJSON-layer',
})
//mapSave.layers.push(vector)
map.addLayer(vector)

let translate = new Translate({
    layer: vector
})
map.addInteraction(translate)
translate.setActive(false)

translate.on('translateend', () => {
    if (translate.lastFeature_.img_name !== undefined) {
        let feature = translate.lastFeature_
        let img = mapSave.images.find((el) => el.name === feature.img_name)
        console.log(img)
        img.values_.source.setCenter(getCenter(feature.values_.geometry.extent_))
        const mask = maskCoords(feature.values_.geometry.flatCoordinates)
        img.values_.source.setMask(mask)
    }
})

//features sidepanel
const fsidepanel = document.getElementById('feature-sidepanel')

map.on('click', async function (ev) {
    if (draw === 1) {
        const feature = map.forEachFeatureAtPixel(ev.pixel, function(feature) { return feature })
        if (feature) {
        select.getFeatures().push(feature)
        fMeasure(feature)
        } else {
        cleanMouse()
        }
    } else {
        fsidepanel.style.display = 'none'
    }
})

function cleanMouse () {
    map.removeInteraction(draw)
    translate.setActive(false)
    map.removeInteraction(select)
    select = new Select({
        style: selectedFeatureStyle
    })
    map.addInteraction(select)
    select.setActive(false)
    fsidepanel.style.display = 'none'
    draw = 1
}

const delDraw = document.getElementById('button-mouse')
delDraw.onclick = () => {
    cleanMouse()
}

function featuresList () {
    let options = ''
    if (mapSave.features.length === 0) {
        options = '<option value="No features">No features</option>'
    } else {
        for (let i = 0; i < mapSave.features.length; i++) {
        options += '<option value="' + mapSave.features[i].name+ '">' + mapSave.features[i].name + '</option>'
        }
    }
    $('#features-list').html(options)
}

const typeSelect = document.getElementById('feature-type')
function addDraw(getValue = false) {
    let geometryFunction
    let value = (getValue) ? getValue : typeSelect.value
    getValue = value

    if (getValue === 'Box' || getValue === 'Square') {
        value = 'Circle'
        geometryFunction = (getValue === 'Box') ? createBox() : createRegularPolygon(4)
    }
    console.log('Новая фигура: ' + getValue)
    draw = new Draw({
        source: source,
        type: value,
        style: featureStyle,
        geometryFunction: geometryFunction,
    })
    map.addInteraction(draw)
    draw.on("drawend",function(e){
        let newFeature = e.feature
        newFeature.name = getValue + '_' + mapSave.features.length
        mapSave.features.push(e.feature)
        console.log('Создано фигур: ' + mapSave.features.length)
        featuresList()
    })
}

const drawPoint = document.getElementById('button-point')
drawPoint.onclick = () => {
    cleanMouse()
    addDraw('Point')
}

const drawLineString = document.getElementById('button-linestring')
drawLineString.onclick = () => {
    cleanMouse()
    addDraw('LineString')
}

const drawBox = document.getElementById('button-box')
drawBox.onclick = () => {
    cleanMouse()
    addDraw('Box')
}

const drawPoly = document.getElementById('button-polygon')
drawPoly.onclick = () => {
    cleanMouse()
    addDraw('Polygon')
}

const drawMove = document.getElementById('button-move')
drawMove.onclick = () => {
    cleanMouse()
    translate.setActive(true)
}

function featureDelete (feature) {
    if (feature.img_name !== undefined) {
        mapSave.images = mapSave.images.filter((el) => {
        return el.name !== feature.img_name
        })
        ImagesList()
    }
    mapSave.features = mapSave.features.filter((el) => {
        return el.name !== feature.name
    })
    vector.getSource().removeFeature(feature)
    featuresList()
    cleanMouse()
}

const deleteFeature = document.getElementById('feature-delete')
deleteFeature.onclick = () => {
    const fName = select.getFeatures().getArray()[0].name
    const feature = mapSave.features.find((el) => el.name === fName)
    if (feature) featureDelete(feature)
}

const addFeature = document.getElementById('button-uploadFile')
addFeature.onclick = ()=>{
    uploadFile.click()
}

// upload vector data
// !Не работает вместе с <2 ... 2>
//<1
const uploadFile = document.getElementById('upload-file')
uploadFile.addEventListener('change', ()=>{
const file = document.querySelector('input[name="file"]').files[0]
    fetch('./data/'+file.name)
    .then(function (response) {
        return response.json()
    })
    .then(function (json) {
        const gformat = new GeoJSON()
        const feature = gformat.readFeatures(json)[0]
        feature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
        feature.name = file.name.split('.')[0]
        vector.getSource().addFeature(feature)
        mapSave.features.push(feature)
        featuresList()
        console.log(file.name + ' загружен')
    })
})
//1>

const selectFeature = document.getElementById('feature-select') 
selectFeature.onclick = () => {
    const selectOption = document.getElementById('features-list')
    const option = selectOption.querySelector(`option[value="${selectOption.value}"]`)
    const feature = mapSave.features.find(el => el.name  === option.value)
    select.getFeatures().clear()
    select.features_.push(feature)
    console.log(select.features_)
    fMeasure(feature)
}

// Сохранение файлов в geojson
// ! не работает вместе с <1 ... 1>

//<2
/*function makeGeojsonFile (data) {
var source = new Proj4js.Proj('EPSG:4326') // lon\lat
var dest = new Proj4js.Proj('EPSG:3785') //x\y
let coords = []
let point, x, y
for (let i = 0; i < data.length; i += 2) {
    x = data[i]
    y = data[i+1]
    point = Proj4js.transform(dest, source, new Proj4js.Point(x, y))
    coords.push([point.x, point.y])
}
const geoData = [
    {
    polygon: [coords]
    }
]
return([ JSON.stringify(GeoJSON.parse( geoData, {'Polygon': 'polygon'} )) , coords])
}*/
//2>

const drawSaveF = document.getElementById('button-downloadFile')
drawSaveF.onclick = () => {
    $('input[required]').addClass('req')
    if ($('input[required]').val() != '') {
        const fileName = $('input[required]').val() + '.geojson'
        const feature = select.getFeatures().getArray()[0].values_.geometry
        const geojson = makeGeojsonFile(feature.flatCoordinates)[0]
        const a = document.createElement('a')
        const file = new Blob([geojson], { type: 'text/plain'})
        a.href = window.URL.createObjectURL(file)
        a.download = fileName
        a.click()
        window.URL.revokeObjectURL(a.href)
        a.remove()
        $('input[required]').removeClass('req')
        cleanMouse()
    } else {
        console.log('Введите имя файла')
    }
}

// Изменять полигоны
const modify = new Modify({source: source})
const modifyChange = document.getElementById('modify')
modifyChange.addEventListener('change', ()=>{
    if (modifyChange.checked){
        console.log('modify on')
        map.addInteraction(modify)
    } else {
        console.log('modify off')
        map.removeInteraction(modify)
    }
})

function fMeasure (feature) {
    let num
    const fType = feature.values_.geometry.getType()
    if (fType === 'Polygon') {
        num = getArea(feature.values_.geometry)
        num = (num > 1000000) ? (num/1000000^0) + ' км²' : (num^0) + ' м²'
        $('#feature-measure').html('Площадь = ' + num)
    } else if (fType === 'LineString') {
        num = getLength(feature.values_.geometry)
        num = (num > 1000) ? (num/1000^0) + ' км' : (num^0) + ' м'
        $('#feature-measure').html('Длина = ' + num)
    } else
        $('#feature-measure').html('')
    fsidepanel.style.display = 'block'
}

// sat-images

const uploadImage = document.getElementById('upload-image')
uploadImage.addEventListener('change', ()=>{
  let feature = getSelect()
  const image = document.querySelector('input[name="image"]').files[0]
  console.log('image', image)
  const extent = feature.values_.geometry.extent_
  const center = getCenter(extent)
  const mask = maskCoords(feature.values_.geometry.flatCoordinates)
  let geoimg = new GeoImageLayer({
    opacity: .7,
    source: new GeoImageSource({
      url: './images/' + image.name,
      imageCenter: center,
      imageScale: [100,100],
      imageMask: mask,
      projection: 'EPSG:3785',
    }),
    box_name: feature.name,
  })
  feature.img_name = image.name.split('.')[0]
  geoimg.name = image.name.split('.')[0]
  mapSave.images.push(geoimg)
  map.addLayer(geoimg)
  console.log(image.name.split('.')[0], ' loaded')
  ImagesList()
  cleanMouse()
})

function ImagesList () {
  let options = ''
  if (mapSave.images.length === 0) {
    options = '<option value="No images">No images</option>'
  } else {
    for (let i = 0; i < mapSave.images.length; i++) {
      console.log(mapSave.images[i].name)
      options += '<option value="' + mapSave.images[i].name + '">' + mapSave.images[i].name + '</option>'
    }
  }
  $('#images-list').html(options)
}

const selectImage = document.getElementById('images-select') 
selectImage.onclick = () => {
  const selectOption = document.getElementById('images-list')
  const option = selectOption.querySelector(`option[value="${selectOption.value}"]`)
  for (let i = 0; i < mapSave.images.length; i++) {
    if (mapSave.images[i].name === option.value) {
      mapSave.images[i].getProperties().source.setMask(undefined)
    }
  }
  cleanMouse()
}

const hideImage = document.getElementById('images-hide')
hideImage.onclick = () => {
  console.log(mapSave.images)
  if (mapSave.images.length !== 0) {
    for (let i = 0; i < mapSave.images.length; i++) {
      console.log(mapSave.images[i].getProperties().source.setMask([[0, 0], [0, 0], [0, 0]]))
    } 
    console.log(mapSave.images)
    console.log('No images now')
  }
}

const fullSize = document.getElementById('full-size')
fullSize.onclick = () => {
  let feature = getSelect()
  console.log(feature.name)
  let img = mapSave.images.find((el) => el.name === feature.img_name)
  const crop = img.values_.source.getCrop()
  const extent = feature.values_.geometry.extent_
  const scaleX = Math.abs((extent[2] - extent[0]) / crop[2])
  const scaleY = Math.abs((extent[1] - extent[3]) / crop[3])
  const newScale = Math.min(scaleX, scaleY)
  img.values_.source.setScale([newScale, newScale])
  $('#image-scale').val(newScale.toFixed(2))
}

const addImage = document.getElementById('button-uploadImage')
addImage.onclick = () => {
  uploadImage.click()
}

const scaleImage = document.getElementById('button-scale')
scaleImage.onclick = () => {
  const scale = document.getElementById('image-scale').value
  let feature = getSelect()
  let img = mapSave.images.find((el) => el.name === feature.img_name)
  img.values_.source.setScale([scale, scale])
  console.log('img: ', img.name, ', scale: ', scale)
}

function maskCoords (data) {
  let newData = []
  for (let i = 0; i < data.length; i+=2) {
    newData.push([data[i], data[i+1]])
  }
  return newData
}

const drawSaveIm = document.getElementById('button-downloadImage')
drawSaveIm.onclick = () => {
  $('input[required]').addClass('req')
  if ($('input[required]').val() != '') {
    const feature = getSelect()
    const img = mapSave.images.find((el) => el.name === feature.img_name)
    let a = document.createElement('a')
   
    const image = img.getData(img.values_.source.center)
    console.log(image)
    const imageBlog = new Blob([image], { type: 'image/jpg'})
    const imageURL = window.URL.createObjectURL(imageBlog)
    a.href = imageURL
    a.download = $('input[required]').val() + '.jpg'
    a.click()
    a.remove()
    $('input[required]').removeClass('req')
    cleanMouse()
  } else {
    console.log('Введите имя файла')
  }
}