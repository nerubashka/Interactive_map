const map = new ol.Map({
    view: new ol.View({
        center: [4175891.7770009562, 7494601.666061781],
        zoom: 5,
        //maxZoom: 15,
        //minZoom: 3,
        //rotation: 3.14 // поворот карты в радианах
    }),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            title: 'OSM VectorTileLayer'
        })
    ],
    target: 'js-map'
})

// add Vector Layers
function addVectorGeoJSON(fileName) {
    fileUrl = './data/' + fileName
    layerTitle = fileName.split('.')[0]
    const layerGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector ({
            url: fileUrl,
            format: new ol.format.GeoJSON()
        }),
        visible: true,
        title: layerTitle
    })
    map.addLayer(layerGeoJSON)
}

// upload vector data
const uploadFile = document.getElementById('upload-file')
uploadFile.addEventListener('change', ()=>{
    if (uploadFile.value){
        fileName = uploadFile.value.match(/[\/\\]([\w\d\s\.\-(\)]+)$/)[1]
        addVectorGeoJSON(fileName)
        console.log(fileName + ' loaded')
        console.log(uploadFile)
    }else {
        console.log('File not selected')

    }
})
function UploadFileGeoJSON(){
    uploadFile.click()
}



// фишки
function MapControl() {
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
    */
}