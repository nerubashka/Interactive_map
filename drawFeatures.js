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

let draw, snap; // global so we can remove them later
const typeSelect = document.getElementById('feature-type')

let featuresCounter = 0

function addInteractions() {
  let geometryFunction
  let value = typeSelect.value

  if (typeSelect.value === 'Box') {
    value = 'Circle'
    geometryFunction = createBox()
  } else if (value === 'Square') {
    value = 'Circle'
    geometryFunction = createRegularPolygon(4)
  }
  console.log('new draw: ' + typeSelect.value)
  const drawName = 'features_' + featuresCounter
  draw = new Draw({
    source: source,
    type: value,
    geometryName: drawName,
    geometryFunction: geometryFunction
    //style: featureStyle
  })
  map.addInteraction(draw)
  snap = new Snap({source: source})
  map.addInteraction(snap)
  console.log(draw.getOverlay().name)
}

/**
 * Handle change event.
typeSelect.onchange = function () {
  map.removeInteraction(draw)
  map.removeInteraction(snap)
  //addInteractions()
};
*/

let addFeature = document.getElementById('feature-btn')
addFeature.onclick = ()=>{
  addInteractions()
}

let endEnter = document.getElementById('feature-end-btn')
endEnter.onclick = ()=>{
  //console.log(draw.sketchCoords_[0][0])
  draw.finishDrawing()
  map.removeInteraction(draw)
  console.log('delete draw')
  map.removeInteraction(snap)
}

document.getElementById('feature-undo-btn').addEventListener('click', function () {
  //draw.abortDrawing()
  draw.removeLastPoint()
})


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