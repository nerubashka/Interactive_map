(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
console.log('Интерактивная карта.')

//const urlHome = 'url(./svg_files/rocket.svg), auto'
const urlMouse = 'url(./svg_files/mouse.svg), auto'
const urlPoint = 'url(./svg_files/point.svg) 16 30, auto'
const urlLineString = 'url(./svg_files/linestring.svg) 17 16, auto'
const urlBox = 'url(./svg_files/box.svg), auto'
const urlPolygon = 'url(./svg_files/polygon.svg), auto'
const urlMove = 'url(./svg_files/move.svg) 16 16, auto'

const fColor = '#fa9868'
const sColor = '#31032A'
const whiteColor = '#ffffff'
let draw

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

const ul = document.querySelector('#layers')
function onChange(e) {
    const eTarget = e.target
    let style = ''
    if (eTarget.localName === 'a') {
        style = eTarget.parentElement.outerHTML.split('"')[1]
    }
    else if (eTarget.localName === 'li') {
        style = eTarget.outerHTML.split('"')[1]
    }
    console.log('Слой обновлен:', style)
    for (let i = 0, ii = mapSave.layers.length; i < ii; ++i) {
        mapSave.layers[i].setVisible(layerStyles[i] === style)
    }
}
ul.addEventListener('click', onChange)

// draw-features

const featureStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: sColor,
        width: 1.5,
    }),
    fill: new ol.style.Fill({
        color: whiteColor+'60',
    }),
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: fColor,
        }),
    }),
})
  
const selectedFeatureStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: sColor,
        width: 4,
    }),
    fill: new ol.style.Fill({
        color: whiteColor+'00',
    }),
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: sColor,
        }),
    }),
})

let select = new ol.interaction.Select({
    style: selectedFeatureStyle
})
map.addInteraction(select)
select.setActive(false)


function getSelect () {
    return select.getFeatures().array_[0]
}

const source = new ol.source.Vector()
const featureLayer = new ol.layer.Vector({
    source: source,
    style: featureStyle,
    name: 'geoJSON-layer',
})
//mapSave.layers.push(featureLayer)
map.addLayer(featureLayer)

let translate = new ol.interaction.Translate({
    layer: featureLayer
})
map.addInteraction(translate)
translate.setActive(false)

translate.on('translateend', () => {
    let feature = translate.lastFeature_
    if (feature.img !== undefined && feature.img.type === 'png') {
        let feature = translate.lastFeature_
        let img = feature.img
        img.getSource().setCenter(ol.extent.getCenter(feature.getGeometry().getExtent()))
        const mask = maskCoords(feature.getGeometry().flatCoordinates)
        img.getSource().setMask(mask)
    }
})

//features sidepanel
const fsidepanel = document.getElementById('feature-sidepanel')
const isidepanel = document.getElementById('image-sidepanel')
const iupload = document.getElementById('image-upload')
const opacityInput = document.getElementById('opacity-input');
const opacityOutput = document.getElementById('opacity-output');
function update() {
    const feature = getSelect()
    const opacity = parseFloat(opacityInput.value)
    feature.img.setOpacity(opacity)
    opacityOutput.innerText = opacity.toFixed(2);
}
map.on('click', async function (e) {
    if (draw === 1) {
        const feature = map.forEachFeatureAtPixel(e.pixel, function(feature) { return feature })
        if (feature) {
            if (select.getFeatures() !== undefined)
                cleanMouse()
            select.getFeatures().push(feature)
            fMeasure(feature)
            if (feature.img) {
                opacityInput.value = feature.img.getOpacity()
                opacityInput.addEventListener('input', update);
                update()
                isidepanel.style.display = 'block'
                iupload.style.display = 'none'
            } else {
                isidepanel.style.display = 'none'
                iupload.style.display = 'block'
            }
        } else {
            cleanMouse()
        }
    } else {
        fsidepanel.style.display = 'none'
    }
})

function cleanMouse () {
    document.body.style.cursor = urlMouse
    saveF.style.display = 'inline-block'
    divSave.style.display = 'none'
    fsidepanel.style.display = 'none'
    map.removeInteraction(draw)
    translate.setActive(false)
    map.removeInteraction(select)
    select = new ol.interaction.Select({
        style: selectedFeatureStyle
    })
    map.addInteraction(select)
    select.setActive(false)
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

const cursorStyle = {
    'Point': urlPoint,
    'LineString': urlLineString,
    'Box': urlBox,
    'Polygon': urlPolygon
}
const typeSelect = document.getElementById('feature-type')
function addDraw(getValue = false) {
    let geometryFunction
    let value = (getValue) ? getValue : typeSelect.value
    getValue = value
    document.body.style.cursor = cursorStyle[getValue]

    if (getValue === 'Box') {
        value = 'Circle'
        geometryFunction = ol.interaction.Draw.createBox() 
    } 
    /*if (getValue === 'Square') {
        value = 'Circle'
        geometryFunction = ol.interaction.Draw.createRegularPolygon(4) 
    }*/
    console.log('Новая фигура:', getValue)
    draw = new ol.interaction.Draw({
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
    document.body.style.cursor = urlMove
}

function featureDelete (feature) {
    if (feature.img !== undefined) {
        imageDelete(feature.img)
    }
    mapSave.features = mapSave.features.filter((el) => {
        return el.name !== feature.name
    })
    featureLayer.getSource().removeFeature(feature)
    featuresList()
    console.log('Объект', feature.name, 'удален')
    map.removeLayer(feature)
    cleanMouse()
}

const deleteFeature = document.getElementById('feature-delete')
deleteFeature.onclick = () => {
    const fName = select.getFeatures().getArray()[0].name
    const feature = mapSave.features.find((el) => el.name === fName)
    if (feature) featureDelete(feature)
    else console.log('Объект', fName, 'не найден')
}

// Загрузка объектов с локалки

const fImage = document.getElementById('load-feature')
fImage.onclick = () => {
    loadFeature()
}
function loadFeature() {
    let input, file, fr

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.")
        return
    }

    input = document.getElementById('featureinput')
    if (!input) {
        alert("Um, couldn't find the fileinput element.")
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.")
    }
    else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'")
    }
    else {
        file = input.files[0]
        fr = new FileReader()
        fr.onload = function (e) {
            let lines = e.target.result
            const jsonFile = JSON.parse(lines)
            const gformat = new ol.format.GeoJSON()
            const feature = gformat.readFeatures(jsonFile)[0]
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
            feature.name = file.name.split('.')[0]
            while (mapSave.features.filter((el) => {return el.name === feature.name}).length !== 0)
                feature.name = feature.name + '+'
            featureLayer.getSource().addFeature(feature)
            mapSave.features.push(feature)
            featuresList()
            console.log(feature.name + ' загружен')
        }
        fr.readAsText(file)
        input.value = ''
    }
}

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
//<2
function makeGeojsonFile (data) {
let source = new Proj4js.Proj('EPSG:4326') // lon\lat
let dest = new Proj4js.Proj('EPSG:3785') //x\y
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
}
//2>

const drawSaveF = document.getElementById('button-downloadFile')
drawSaveF.onclick = () => {
    $('input[required]').addClass('req')
    if ($('input[required]').val() != '') {
        const fileName = $('input[required]').val() + '.geojson'
        const feature = select.getFeatures().getArray()[0].values_.geometry
        const geoJson = makeGeojsonFile(feature.flatCoordinates)[0]
        const a = document.createElement('a')
        const file = new Blob([geoJson], { type: 'text/plain'})
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
const saveF = document.getElementById('button-download')
const divSave = document.getElementById('div-save')
saveF.onclick = () => {
    saveF.style.display = 'none'
    divSave.style.display = 'block'
}

// Изменять полигоны
const modify = new ol.interaction.Modify({source: source})
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
        num = ol.sphere.getArea(feature.values_.geometry)
        num = (num > 1000000) ? (num/1000000^0) + ' км²' : (num^0) + ' м²'
        $('#feature-measure').html('Площадь = ' + num)
    } else if (fType === 'LineString') {
        num = ol.sphere.getLength(feature.values_.geometry)
        num = (num > 1000) ? (num/1000^0) + ' км' : (num^0) + ' м'
        $('#feature-measure').html('Длина = ' + num)
    } else
        $('#feature-measure').html('')
    fsidepanel.style.display = 'block'
}

// sat-images
const addImage = document.getElementById('button-uploadImage')
addImage.onclick = () => {
  uploadImage.click()
}
function maskCoords (data) {
    let newData = []
    for (let i = 0; i < data.length; i+=2) {
      newData.push([data[i], data[i+1]])
    }
    return newData
  }

const uploadImage = document.getElementById('upload-image')
uploadImage.addEventListener('change', ()=>{
    let feature = getSelect()
    feature.getStyle().getFill().color_ = fColor + '00'
    let image = document.querySelector('input[name="image"]').files[0]
    const extent = feature.getGeometry().getExtent()
    const center = ol.extent.getCenter(extent)
    const mask = maskCoords(feature.values_.geometry.flatCoordinates)
    let geoimg = new ol.layer.GeoImage({
        //opacity: 1,
        source: new ol.source.GeoImage({
            url: './data/' + image.name,
            imageExtent: extent,
            imageCenter: center,
            imageScale: [100,100],
            //imageCrop: [0, 0, 5526, 5000],
            imageMask: mask,
            //imageRotate: Number($("#rotate").val()*Math.PI/180),
            projection: 'EPSG:3785',
            //attributions: [ "<a href='http://www.geoportail.gouv.fr/actualite/181/telechargez-les-cartes-et-photographies-aeriennes-historiques'>Photo historique &copy; IGN</a>" ],
        }),
    })
    feature.img = geoimg
    geoimg.name = image.name.split('.')[0]
    while (mapSave.images.filter((el) => {return el.name === geoimg.name}).length !== 0) 
            geoimg.name = geoimg.name + '+'
    geoimg.ftr = feature
    geoimg.type = 'png'
    mapSave.images.push(geoimg)
    map.addLayer(geoimg)
    console.log('Изображение', geoimg.name, 'загружено')
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

const lImage = document.getElementById('load-image')
lImage.onclick = () => {
    loadImage()
}
function loadImage() {
    let input, file

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.")
        return
    }

    input = document.getElementById('imageinput')
    if (!input) {
        alert("Um, couldn't find the fileinput element.")
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.")
    }
    else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'")
    }
    else {
        file = input.files[0]
        let feature = getSelect()
        feature.getStyle().getFill().color_ = whiteColor + '00'
        const extent = feature.values_.geometry.extent_
        let geoimg = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                imageExtent: extent,
                imageLoadFunction: function(image, src) {
                    fr = new FileReader()
                    fr.onload = function (e) {
                        let tiff = new Tiff({buffer: e.target.result})
                        let canvas = tiff.toCanvas()
                        image.getImage().src = canvas.toDataURL()
                    }
                    fr.readAsArrayBuffer(file)
                },
                projection: 'EPSG:3785',
            }),
        })
        geoimg.ftr = feature
        geoimg.name = file.name.split('.')[0]
        geoimg.type = 'tiff'
        while (mapSave.images.filter((el) => {return el.name === geoimg.name}).length !== 0) 
            geoimg.name = geoimg.name + '+'
        feature.img = geoimg
        mapSave.images.push(geoimg)
        map.addLayer(geoimg)
        console.log(geoimg.name, 'загружено')
        ImagesList()
        cleanMouse()
        input.value = ''
    }

    /*function old_uploading(){
        file = input.files[0]
        let feature = getSelect()
        const extent = feature.values_.geometry.extent_
        let geoimg = new ol.layer.Image({
            //extent: bbox,
            source: new ol.source.ImageStatic({
                url: 'data/image.tiff',
                imageExtent: extent,
                imageLoadFunction: function(image, src) {
                    let xhr = new XMLHttpRequest()
                    xhr.responseType = 'arraybuffer'
                    xhr.open('GET', src)
                    xhr.onload = function (e) {
                        console.log('respomse:', xhr.response)
                        let tiff = new Tiff({buffer: xhr.response})
                        let canvas = tiff.toCanvas()
                        image.getImage().src = canvas.toDataURL()
                    }
                    xhr.send()
                }
            }),
            zIndex: 0
        })
        geoimg.ftr = feature
        geoimg.name = file.name.split('.')[0]
        while (mapSave.images.filter((el) => {return el.name === geoimg.name}).length !== 0) 
            geoimg.name = geoimg.name + '+'
        feature.img = geoimg
        mapSave.images.push(geoimg)
        map.addLayer(geoimg)
        console.log(geoimg.name, 'загружено')
        ImagesList()
        cleanMouse()
        input.value = ''
    }*/
}

function ImagesList () {
  let options = ''
  if (mapSave.images.length === 0) {
    options = '<option value="No images">No images</option>'
  } else {
    for (let i = 0; i < mapSave.images.length; i++) {
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
      mapSave.images[i].setVisible(true)
      mapSave.images[i].ftr.getStyle().getFill().color_ = whiteColor + '00'
      console.log('Изображение', mapSave.images[i].name, 'отображено')
    }
  }
  cleanMouse()
}

const hideImage = document.getElementById('images-hide')
hideImage.onclick = () => {
  if (mapSave.images.length !== 0) {
    for (let i = 0; i < mapSave.images.length; i++) {
        mapSave.images[i].setVisible(false)
        mapSave.images[i].ftr.getStyle().getFill().color_ = whiteColor + '60'
    }
    console.log('Все изображения скрыты')
  }
}

function imageDelete (image) {
    image.ftr.img = undefined
    image.ftr.getStyle().getFill().color_ = whiteColor + '00'
    mapSave.images = mapSave.images.filter((el) => {
        return el.name !== image.name
    })
    ImagesList()
    console.log('Объект', image.name, 'удален')
    map.removeLayer(image)
    cleanMouse()
}

const deleteImage = document.getElementById('image-delete')
deleteImage.onclick = () => {
    const IName = select.getFeatures().getArray()[0].img.name
    const image = mapSave.images.find((el) => el.name === IName)
    if (image) imageDelete(image)
    else console.log('Изображение', IName, 'не найдено')
}


const fullSize = document.getElementById('full-size')
fullSize.onclick = () => {
    fnFullSize()
}
function fnFullSize(extent = undefined) {
    let feature = getSelect()
    let img = feature.img
    const crop = img.getSource().getCrop()
    extent = feature.getGeometry().getExtent()
    const scaleX = Math.abs((extent[2] - extent[0]) / crop[2])
    const scaleY = Math.abs((extent[1] - extent[3]) / crop[3])
    const newScale = Math.min(scaleX, scaleY)
    img.getSource().setScale([newScale, newScale])
    //$('#image-scale').val(newScale.toFixed(2))
}
/*
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
}*/

// скрипт на python
const pyS = document.getElementById('py-script')
pyS.onclick = () => {
    pyScript()
}
function pyScript () {
    const child_process = require('child_process');
    console.log('exec', child_process.exec)
    exec('python test.py', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    });
}
},{"child_process":2}],2:[function(require,module,exports){

},{}]},{},[1]);
