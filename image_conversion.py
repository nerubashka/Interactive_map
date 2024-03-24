# https://www.geeksforgeeks.org/python-opencv-affine-transformation/
import cv2
import numpy as np
from matplotlib import pyplot as plt
from PIL import Image 

def imagesize(x0, y0, M):
    points = np.zeros(shape=(4, 2))
    def newpoint(x, y):
        x_new = M[0][0]*x + M[0][1]*y + M[0][2]
        y_new = M[1][0]*x + M[1][1]*y + M[1][2]
        return [x_new, y_new]
    
    points[0] = newpoint(0, 0)
    points[1] = newpoint(0, y0)
    points[2] = newpoint(x0, 0)
    points[3] = newpoint(x0, y0)
    points = points.T
    
    min_point = [min(points[0]), min(points[1])]
    width = int(max(points[0]) - min(points[0]))
    height = int(max(points[1]) - min_point[1])
    M[0][2] -= min_point[0]
    M[1][2] -= min_point[1]
    
    return width, height

img = cv2.imread('images/image.tiff')
rows, cols, ch = img.shape
 
tr1 = np.float32([[10, 10],
                  [12, 10], 
                  [10, 12]])
 
tr2 = np.float32([[10, 11],
                  [12, 15], 
                  [10, 17]])

Matrix = cv2.getAffineTransform(tr1, tr2)
width, height = imagesize(cols, rows, Matrix)
res = cv2.warpAffine(img, Matrix, (width, height), borderValue=(255,255,255))#borderValue=cv2.COLOR_BGR2GRAY)

import cgitb
import cgi

cgitb.enable() # This will show any errors on your webpage

inputs = cgi.FieldStorage() # REMEMBER: We do not have inputs, simply a button to run the program. In order to get inputs, give each one a name and call it by inputs['insert_name']

print("Content-type: text/html") # We are using HTML, so we need to tell the server

print() # Just do it because it is in the tutorial :P

print("<title> MyPythonWebpage </title>")

#print("Whatever you would like to print goes here, preferably in between tags to make it look nice")
print("I'm done .py!")
#plt.imshow(res)

#cv2.imwrite('dst_image.tiff', res)
#im = Image.open(r'dst_image.tiff')
#im.show()