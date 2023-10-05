import {Vector as VectorSource} from 'ol/source.js'
import {Vector as VectorLayer} from 'ol/layer.js'
import Draw, {createBox, createRegularPolygon} from 'ol/interaction/Draw.js'
import {Modify, Translate, Select} from 'ol/interaction.js'
import {Circle, Fill, Stroke, Style} from 'ol/style.js'
import {getCenter} from 'ol/extent.js'
import {maskCoords} from './satimages.js'
//import {parse as Parse} from 'geojson/geojson.js'
import GeoJSON from 'ol/format/GeoJSON.js'
import {getLength, getArea} from 'ol/sphere'

console.log('drawFeature')
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

export function getSelect () {
  return select.getFeatures().array_[0]
}

export function setSelect (feature) {
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

export function cleanMouse () {
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
  //select.setActive(true)
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
  /*draw.on('drawstart', function(){
    start_drawing = true
  })*/
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
  //map.addInteraction(translate)
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

const drawSave = document.getElementById('button-downloadFile')
drawSave.onclick = () => {
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

/*const multiSelect = document.getElementById('multiSelect')
multiSelect.addEventListener('change', ()=>{
  select.multi_ = multiSelect.checked
  mSelect = multiSelect.checked
  console.log('multiple selection ', select)
})*/
