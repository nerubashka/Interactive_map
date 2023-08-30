import GeoImageSource from 'ol-ext/source/GeoImage.js'
import GeoImageLayer from 'ol-ext/layer/GeoImage.js'
import {getSelect, setSelect, cleanMouse} from './drawFeatures.js'
import {getCenter} from 'ol/extent.js'

console.log('satimages')

const uploadImage = document.getElementById('upload-image')
uploadImage.addEventListener('change', ()=>{
  let feature = getSelect()
  const image = document.querySelector('input[name="image"]').files[0]
  const extent = feature.values_.geometry.extent_
  const center = getCenter(extent)
  const mask = maskCoords(feature.values_.geometry.flatCoordinates)
  let geoimg = new GeoImageLayer({
    opacity: .7,
    source: new GeoImageSource({
      url: './images/' + image.name,
      imageCenter: center,
      imageScale: [100,100],
      //imageCrop: [0, 0, 5526, 5000],
      imageMask: mask,
      //imageRotate: Number($("#rotate").val()*Math.PI/180),
      projection: 'EPSG:3785',
      //attributions: [ "<a href='http://www.geoportail.gouv.fr/actualite/181/telechargez-les-cartes-et-photographies-aeriennes-historiques'>Photo historique &copy; IGN</a>" ],
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
  //const img = mapSave.images.find(el => el.name  === option.value)
  for (let i = 0; i < mapSave.images.length; i++) {
    if (mapSave.images[i].name === option.value) {
      mapSave.images[i].getProperties().source.setMask(undefined)
      //console.log('+')
    }
  }
  cleanMouse()
  //setSelect(feature)
  //console.log(getSelect().features_)
  //document.getElementById('feature-sidepanel').style.display = 'block'
}

const hideImage = document.getElementById('images-hide')
hideImage.onclick = () => {
  console.log(mapSave.images)
  if (mapSave.images.length !== 0) {
    for (let i = 0; i < mapSave.images.length; i++) {
      //mapSave.images[i].setMask([[0, 0], [0, 0], [0, 0]])
      //mapSave.images[i].getProperties().getSource().visible = false
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
  img.values_.source.setScale([Math.min(scaleX, scaleY), Math.min(scaleX, scaleY)])
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

//geoimg.getSource().setMask([[273137.343,6242443.14],[273137.343,6245428.14],[276392.157,6245428.14],[276392.157,6242443.14],[273137.343,6242443.14]])

export function maskCoords (data) {
  let newData = []
  for (let i = 0; i < data.length; i+=2) {
    newData.push([data[i], data[i+1]])
  }
  return newData
}

const drawSave = document.getElementById('button-downloadImage')
drawSave.onclick = () => {
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
/*
const imgMask = document.getElementById('button-mask')
imgMask.onclick = () => {
  let mask = maskCoords(select.getFeatures().getArray()[0].values_.geometry.flatCoordinates)
  console.log(mask)
  geoimg.getSource().setMask(mask)
}
*/