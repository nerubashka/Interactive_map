#https://translated.turbopages.org/proxy_u/en-ru.ru.03f633e3-66055e1e-4154f66d-74722d776562/https/stackoverflow.com/questions/72266425/how-to-use-pyscript-python-function-in-javascript
import pyodide
import js
import numpy as np
from matplotlib import pyplot as plt
import cv2
from PIL import Image
# import pyodide_js
# pyodide_js.loadPackage('numpy')
# pyodide_js.loadPackage('cv2')
# pyodide_js.loadPackage('matplotlib')
#pyodide_js.loadPackage('PIL')
# import micropip



# async def py_lib () :
#     await micropip.install('numpy')
#     await micropip.install('cv2')
#     await micropip.install('matplotlib')
#     await micropip.install('PIL')

# py_lib()
class myClass():
    def __init__(self):
        self.add_one_proxy = pyodide.create_proxy(self.add_one)
        js.document.getElementById('mybutton').addEventListener("click", self.add_one_proxy)
    
    def add_one(self, pointerEventObj):
        """Callback from JS when a button is clicked"""
        # btn_elem = pointerEventObj.currentTarget
        # data = [float(i) for i in btn_elem.getAttribute('data').split(',')[:-2]]
        # #js.document.getElementById('resultdiv').innerHTML = str(int(data)+1)
        # #btn_elem.setAttribute('data', str(int(data)+1))
        # js.console.log('data:', data[0])
        js.console.log('test create')
    
    def shutdown(self):
        self.add_one_proxy.destroy()

klass = myClass()
# Make sure in the program to keep holding a reference of klass ...
# do the whole program here
# When all done, call klass.shutdown()