import os
import glob

fileList = glob.glob('output*.csv')

for filePath in fileList:
    try:
        os.remove(filePath)
    except:
        print("Error while deleting file : ", filePath)