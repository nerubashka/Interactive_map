import {Modify, Snap} from 'ol/interaction.js'
import Draw, {createBox,} from 'ol/interaction/Draw.js';
import {Vector as VectorSource} from 'ol/source.js'
import {Vector as VectorLayer} from 'ol/layer.js'


const source = new VectorSource()
const vector = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.5)',
    'stroke-color': '#3499CC',
    'stroke-width': 1.5,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
})
map.addLayer(vector)

const modify = new Modify({source: source})
map.addInteraction(modify)

let draw, snap; // global so we can remove them later
const typeSelect = document.getElementById('type')

function addInteractions() {
  /*let geometryFunction
  if (typeSelect.value === 'Box') {
    console.log('i do this one')
    geometryFunction = createBox()
    
  }*/

  draw = new Draw({
    source: source,
    type: typeSelect.value
    //geometryFunction: geometryFunction
  })
  map.addInteraction(draw)
  snap = new Snap({source: source})
  map.addInteraction(snap)
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
    map.removeInteraction(draw)
    map.removeInteraction(snap)
}
document.getElementById('feature-undo-btn').addEventListener('click', function () {
  draw.removeLastPoint()
})