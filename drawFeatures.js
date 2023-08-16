import {Modify, Snap} from 'ol/interaction.js'
import Draw, {createBox, createRegularPolygon,} from 'ol/interaction/Draw.js';
import {Vector as VectorSource} from 'ol/source.js'
import {Vector as VectorLayer} from 'ol/layer.js'
// select
import {Fill, Stroke, Style} from 'ol/style.js';
/*
import MVT from 'ol/format/MVT.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import {Fill, Stroke, Style} from 'ol/style.js';*/

/*
//translate
import {Select, Translate, defaults as defaultInteractions,} from 'ol/interaction.js';

const select = new Select()
const translate = new Translate({
  features: select.getFeatures(),
})

function addInteractions() {
  add = defaultInteractions().extend([select, translate])
  map.addInteraction(add)
}
addInteractions()
*/

// lookup for selection objects
//let selection = {}

const featureStyle = new Style({
  stroke: new Stroke({
  color: '#3499CC',
  width: 1.5,
  }),
  fill: new Fill({
      color: 'rgba(255, 255, 255, 0.5)',
  }),
  });
  const selectedFeature = new Style({
  stroke: new Stroke({
      color: '#3499CC',
      width: 2,
  }),
  fill: new Fill({
      color: 'rgb(52, 153, 204, 0.5)',
  }),
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

let source = new VectorSource()
const vector = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.5)',
    'stroke-color': '#3499CC',
    'stroke-width': 1.5,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
  name: 'VectorLayer'
})
layers[1].push(vector)
map.addLayer(vector)

// Изменять полигоны
let modifyCheck = true
const modify = new Modify({source: source})
const modifyChange = document.getElementById('modify')
modifyChange.addEventListener('change', ()=>{
  modifyCheck = !modifyCheck
  
  if (modifyCheck){
    console.log('modify on')
    map.addInteraction(modify)
  }else{
    console.log('modify off')
    map.removeInteraction(modify)
  }
  
})

map.addInteraction(modify)

let draw = 0, snap; // global so we can remove them later
let featuresCollection = [];
const typeSelect = document.getElementById('feature-type')

let featureLength = 0

function checkDraw () {
  if (draw != 0) {
    map.removeInteraction(draw)
    draw = 0
  }
}

map.on('click', () => {
  if (draw != 0) {
    if (featureLength - 1 === draw.sketchCoords_[0].length) {
      featuresCollection.push(draw.sketchCoords_[0])
      console.log(featuresCollection.length)
      featureLength = 0
    } else {
      featureLength = draw.sketchCoords_[0].length
    }
  }
})

function addInteractions(getValue = false) {
  let geometryFunction
  let value
  if (getValue) {
    value = getValue
  } else {
    value = typeSelect.value
  }
  console.log(getValue)
  if (value === 'Box') {
    value = 'Circle'
    geometryFunction = createBox()
  } else if (value === 'Square') {
    value = 'Circle'
    geometryFunction = createRegularPolygon(4)
  }
  console.log('new draw: ' + value)
  const drawName = 'features_' + featuresCollection.length
  draw = new Draw({
    source: source,
    type: value,
    //features: featuresCollection,
    //layer: layers[0],
    geometryName: drawName,
    geometryFunction: geometryFunction
    //style: featureStyle
  })
  map.addInteraction(draw)
  //snap = new Snap({source: source})
  //map.addInteraction(snap) 
  
  console.log('draw.getOverlay().name = ' + draw.getOverlay().name)
  /*draw.on('drawend', function (event) {
    var feature = event.feature;
    var features = layers[0].getSource().getFeatures();
    features = features.concat(feature);
    features.forEach(element => console.log(element));
  });*/
}


/**
 * Handle change event.
typeSelect.onchange = function () {
  map.removeInteraction(draw)
  map.removeInteraction(snap)
  //addInteractions()
};
*/

let addFeature = document.getElementById('button-upload')
addFeature.onclick = ()=>{
  UploadFileGeoJSON()
}

let delDraw = document.getElementById('button-mouse')
delDraw.onclick = () => {
  checkDraw()
  console.log('delete draw')
}

let drawPoint = document.getElementById('button-point')
drawPoint.onclick = () => {
  checkDraw()
  addInteractions('Point')
}

let drawPoly = document.getElementById('button-polygon')
drawPoly.onclick = () => {
  checkDraw()
  addInteractions('Polygon')
}



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