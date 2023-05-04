import {Draw, Modify, Snap} from 'ol/interaction.js'
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
  draw = new Draw({
    source: source,
    type: typeSelect.value,
  });
  map.addInteraction(draw)
  snap = new Snap({source: source})
  map.addInteraction(snap)
}

/**
 * Handle change event.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw)
  map.removeInteraction(snap)
  addInteractions()
};

let addFeature = document.getElementById('feature-btn')
addFeature.onclick = ()=>{
  addInteractions()
  map.removeInteraction(draw)
  map.removeInteraction(snap)
}