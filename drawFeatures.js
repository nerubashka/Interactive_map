import {Modify, Snap} from 'ol/interaction.js'
import Draw, {createBox, createRegularPolygon,} from 'ol/interaction/Draw.js';
import {Vector as VectorSource} from 'ol/source.js'
import {Vector as VectorLayer} from 'ol/layer.js'
// select
import {Circle, Fill, Stroke, Style} from 'ol/style.js';
import {Select, Translate} from 'ol/interaction.js';

/*
import MVT from 'ol/format/MVT.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import {Fill, Stroke, Style} from 'ol/style.js';*/

let draw = 0 // global so we can remove them later
let features = []
let translate = 0
let mSelect = false
const fColor = '#fa9868'
const sColor = '#31032A'

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
    })
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

let source = new VectorSource()
const vector = new VectorLayer({
  source: source,
  style: featureStyle,
  name: 'VectorLayer'
})
layers[1].push(vector)
map.addLayer(vector)


let select = new Select({
  style: selectedFeatureStyle
})
map.addInteraction(select)
select.setActive(true)

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

map.on('click', async function () {
  await sleep(300)
  document.getElementById('button-download').disabled = (select.getFeatures().getLength() === 0)
})

/*
const vtSource = new VectorTileSource({
    //maxZoom: 15,
    format: new MVT({
        idProperty: 'iso_a3',
    })
})

const vtLayer  = new VectorTileLayer({
    declutter: true,
    source: vtSource,
    //style: featureStyle,
})
map.addLayer(vtLayer)
*/

const typeSelect = document.getElementById('feature-type')
function addDraw(getValue = false) {
  let geometryFunction
  let value
  if (getValue) {
    value = getValue
  } else {
    value = typeSelect.value
  }
  getValue = value
  if (value === 'Box') {
    value = 'Circle'
    geometryFunction = createBox()
  } else if (value === 'Square') {
    value = 'Circle'
    geometryFunction = createRegularPolygon(4)
  }
  console.log('Новая фигура: ' + value)
  draw = new Draw({
    source: source,
    type: value,
    style: featureStyle,
    geometryFunction: geometryFunction,
    name: 'default',
  })
  map.addInteraction(draw)
  draw.on("drawend",function(e){
    let newFeature = e.feature
    newFeature.geometryName = getValue + '_' + features.length
    features.push(e.feature)
    console.log('Создано фигур: ' + features.length)
    featuresList()
  })
}

function featuresList () {
  let options = ''
  for (let i = 0; i < features.length; i++) {
    options += '<option value="' + features[i].geometryName+ '">' + features[i].geometryName + '</option>'
  }
  $("#features-list").html(options);
}

let addFeature = document.getElementById('button-upload')
addFeature.onclick = ()=>{
  UploadFileGeoJSON()
}

function cleanMouse () {
  map.removeInteraction(draw)
  map.removeInteraction(translate)
  select.getFeatures().clear()
  select.setActive(false)
  draw = 0
  translate = 0
}

let delDraw = document.getElementById('button-mouse')
delDraw.onclick = () => {
  cleanMouse()
  select.setActive(true)
}

let drawPoint = document.getElementById('button-point')
drawPoint.onclick = () => {
  cleanMouse()
  addDraw('Point')
}

let drawLineString = document.getElementById('button-linestring')
drawLineString.onclick = () => {
  cleanMouse()
  addDraw('LineString')
}

let drawPoly = document.getElementById('button-polygon')
drawPoly.onclick = () => {
  cleanMouse()
  addDraw('Polygon')
}

let drawMove = document.getElementById('button-move')
drawMove.onclick = () => {
  cleanMouse()
  translate = new Translate()
  map.addInteraction(translate)
}

let selectFeature = document.getElementById('feature-select') 
selectFeature.onclick = () => {
  const selectOption = document.getElementById('features-list')
  const option = selectOption.querySelector(`option[value="${selectOption.value}"]`)
  const feature = features.find(el => el.geometryName  === option.value)
  select.getFeatures().clear()
  select.getFeatures().push(feature)
  document.getElementById('button-download').disabled = false
  select.setActive(true)
}




// Сохранение файлов в geojson

function makeGeojsonFile (data) {
  var source = new Proj4js.Proj('EPSG:4326'); // lon\lat
  var dest = new Proj4js.Proj('EPSG:3785'); //x\y
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
  return( JSON.stringify(GeoJSON.parse( geoData, {'Polygon': 'polygon'} )) )
}

let drawSave = document.getElementById('button-download')
drawSave.onclick = () => {
  if (select.getFeatures().getLength() != 0) {
    $('input[required]').addClass('req')
    const feature = select.getFeatures().getArray()[0].values_.geometry
    if ($('input[required]').val() != '') {
      const fileName = $('input[required]').val() + '.geojson'
      
      const geojson = makeGeojsonFile(feature.flatCoordinates)
      const a = document.createElement('a')
      const file = new Blob([geojson], { type: 'text/plain'})
      a.href = window.URL.createObjectURL(file)
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(a.href)
      a.remove()
      $('input[required]').removeClass('req')
      $('input[required]').val('')
      delDraw.onclick()
      document.getElementById('button-download').disabled = true
    } else {
      console.log('Введите имя файла')
    }
  } else {
    console.log('Выберите объект для сохранения')
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
/*
const multiSelect = document.getElementById('multiSelect')
multiSelect.addEventListener('change', ()=>{
  select.multi_ = multiSelect.checked
  mSelect = multiSelect.checked
  console.log('multiple selection ', select)
})*/

/*
let endEnter = document.getElementById('feature-end-btn')
endEnter.onclick = ()=>{
  //console.log('fc: ' + typeof featuresCollection)
  //draw.finishDrawing()
  console.log(draw)
  map.removeInteraction(draw)
  console.log('delete draw')
  //map.removeInteraction(snap)
}

document.getElementById('feature-undo-btn').addEventListener('click', function () {
  //draw.abortDrawing()
  draw.removeLastPoint()
})*/


// Selection
/*
const selectionLayer = new VectorLayer({
  map: map,
  renderMode: 'vector',
  source: vtLayer.getSource(),
  style: function (feature) {
    if (feature.getId() in selection) {
      return selectedFeature;
    }
  },
});

//selectEnter = document.getElementById('select-btn')
//selectEnter.onclick = ()=>{
  const selectElement = document.getElementById('select-type');
  map.addEventListener('pointermove', (event) => {
    if (
      (selectElement.value === 'singleselect-hover' &&
        event.type !== 'pointermove') ||
      (selectElement.value !== 'singleselect-hover' &&
        event.type === 'pointermove')
    ) {
      return;
    }
    vector.getFeatures(event.pixel).then(function (features) {
      if (!features.length) {
        selection = {}
        selectionLayer.changed()
        return;
      }
      const feature = features[0]
      if (!feature) {
        return;
      }
      const fid = feature.getId()

      if (selectElement.value.startsWith('singleselect')) {
        selection = {}
      }
      // add selected feature to lookup
      selection[fid] = feature

      selectionLayer.changed()
    })
  })
//}
*/