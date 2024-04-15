# https://www.geeksforgeeks.org/python-opencv-affine-transformation/

import pyodide, js, os, base64, binascii, io
import cv2, numpy as np
import urllib.request
# import tiffwrite
# from matplotlib import pyplot as plt
from PIL import Image
#from rasterio.io import MemoryFile
# from skimage import io

SERVER_URL = "http://85.89.127.199:8069/"

class myClass():
    images = {}
    def __init__(self):
        js.console.log('__init__ python')
        self.transform_proxy = pyodide.create_proxy(self.transform)
        js.document.getElementById('mybutton').addEventListener("click", self.transform_proxy)
        
        self.process_file_proxy = pyodide.create_proxy(self.process_file)
        js.document.getElementById('imageinput').addEventListener("change", self.process_file_proxy)
    
    def upload(event):
        pass
        # input = js.document.getElementById('imageinput').files.to_py()[0]
        # fileList = event.target.files.to_py()
        # image = 0
        # for f in fileList:
        #     image = await f.text()
        #     #image = js.Uint8Array.new(f)
        #     break
        # img = cv2.imdecode(image, cv2.IMREAD_COLOR)
        # print(img.shape)js.console.dir(event.target)
        # js.console.log('py-upload', img)


    def read_complete(self, event):
        # image = np.frombuffer(js.Uint8Array.new(event.target.result), dtype=np.uint8)
       # with MemoryFile(event.target.result) as memfile:
            #with memfile.open() as dataset:
                #data_array = dataset.read()
                #js.console.log('data_array > ', str(data_array))
        #image = np.frombuffer(event.target.result.to_py(), dtype=np.uint8)
        image = np.asarray(bytearray(event.target.result[23:], encoding='utf8'), dtype=np.uint8)
        # blob = js.Blob.new([list(image)], {type : 'text/plain'})
        # url = js.window.URL.createObjectURL(blob) 
        # downloadLink = js.document.createElement("a")
        # downloadLink.href = url
        # downloadLink.download = "text.txt"
        # js.document.body.appendChild(downloadLink)
        # downloadLink.click()
        js.console.log('str > ', str(image))
        #img = cv2.imdecode(image, cv2.IMREAD_COLOR)
        img = cv2.imdecode(image, cv2.IMREAD_COLOR)
        js.console.log('load len', len(img))
        self.images['image'] = img

    async def process_file(self, event):
        fileList = js.document.getElementById('imageinput').files
    
        for f in fileList:
            # reader is a pyodide.JsProxy
            text = await f.text()
            # js.console.log('f.text ', str(text))
            # file = open('text_image.txt', 'w') 
            # file.write(text)
            # file.close() 
            # blob = js.Blob.new([str(bytearray(event.target.result[23:], encoding='utf8'))], {type : 'image/tiff'})
            # url = js.window.URL.createObjectURL(blob) 
            # downloadLink = js.document.createElement("a")
            # downloadLink.href = url
            # downloadLink.download = "text_image.tiff"
            # js.document.body.appendChild(downloadLink)
            # downloadLink.click()
            # picture_bytes = binascii.unhexlify(text)
            # picture_stream = io.BytesIO(picture_bytes)
            # img = cv2.imdecode(picture_stream, cv2.IMREAD_COLOR)
            # js.console.log('load text len', len(img))
            # reader = js.FileReader.new()
            # # Create a Python proxy for the callback function
            # onload_event = pyodide.create_proxy(self.read_complete)
            # reader.onload = onload_event
            # reader.readAsDataURL(f)
        return
    

    def transform(self, pointerEventObj):
        """Callback from JS when a button is clicked"""
        
        btn_elem = pointerEventObj.currentTarget
        tmp = btn_elem.getAttribute('data')
        data, img_name = tmp.split(';')
        data = [int(float(i)) for i in data.split(',')[:-2]]

        url = SERVER_URL + img_name + ".tiff"
        url_response = urllib.request.urlopen(url)
        img_array = np.array(bytearray(url_response.read()), dtype=np.uint8)
        img = cv2.imdecode(img_array, -1)
        rows, cols, ch = img.shape

        coords1 = np.float32([[0,rows-1], [0,0], [cols-1,0], [cols-1,rows-1]])
        coords2 = np.float32([[data[0],data[1]], [data[2],data[3]], [data[4],data[5]], [data[6],data[7]]])
        Matrix = cv2.getPerspectiveTransform(coords1, coords2)
        res = cv2.warpPerspective(img, Matrix, (cols, rows), borderValue=(255,255,255))#borderValue=cv2.COLOR_BGR2GRAY)
        cv2.imwrite('cur.png', res)

        rgba = Image.open('cur.png')
        rgba = rgba.convert('RGBA')
        datas = rgba.getdata()
        newData = []

        for item in datas:
            if item[0] == 255 and item[1] == 255 and item[2] == 255:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        rgba.putdata(newData)
        rgba.save("t_" + img_name + ".png", "PNG")
        # with open('t_image.png', 'rb') as fh:
        #     str_line = 'data:image/png;base64,' + str(base64.b64encode(fh.read()))[2:-1]
        #     js.console.log('len', len(str_line))
        # image_button = js.document.getElementById('img-image-button')
        # image_button.src = str_line
        # js.console.log('image_button.src len', len(image_button.src))
        # js.console.log('click py')
        # py_button = js.document.getElementById('py-download')
        # py_button.click()

        blob = js.Blob.new([rgba], {type : 'image/png'})
        d_url = js.window.URL.createObjectURL(blob) 
        downloadLink = js.document.createElement("a")
        downloadLink.href = d_url
        downloadLink.download = "final_" + img_name + ".png"
        js.document.body.appendChild(downloadLink)
        downloadLink.click()

        # import os
        # file_path = 'cur.png'
        # if os.path.isfile(file_path):
        #     os.remove(file_path)
        # else:
        #     js.console.log("File does not exist")
        js.console.log("Successful")

    def shutdown(self):
        js.console.log('shutdown python')
        self.transform_proxy.destroy()
        self.process_file_proxy.destroy()

js.console.log('python')
klass = myClass()