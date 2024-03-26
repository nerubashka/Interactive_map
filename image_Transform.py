# https://www.geeksforgeeks.org/python-opencv-affine-transformation/
import cv2
import numpy as np
from matplotlib import pyplot as plt
from PIL import Image

img = cv2.imread('data/image.tiff')
print(img.shape)
rows, cols, ch = img.shape

coords1 = np.float32([[0,0], [cols-1,0], [0,rows-1], [cols-1,rows-1]])
coords2 = np.float32([[0,0], [cols-1,0], [int(0.33*rows),rows-1], [int(0.66*cols),rows-1]])
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
rgba.save("data/image.png", "PNG")

import os
file_path = 'cur.png'

if os.path.isfile(file_path):
    os.remove(file_path)
else:
    print("File does not exist")
print("Successful")

im_pmg= Image.open(r"data/image.png")
plt.imshow(im_pmg)