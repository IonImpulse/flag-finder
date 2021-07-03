import PIL
from scipy.spatial import KDTree
from webcolors import (
    CSS21_NAMES_TO_HEX,
    HTML4_NAMES_TO_HEX,
    hex_to_rgb,
)
import requests
from PIL import Image, ImageDraw, UnidentifiedImageError
import argparse
import sys
from io import BytesIO
import csv
import re
def convert_rgb_to_names(rgb_tuple):
    # a dictionary of all the hex and their respective names in css3
    css3_db = CSS21_NAMES_TO_HEX
    names = []
    rgb_values = []
    
    for color_name, color_hex in css3_db.items():
        names.append(color_name)
        print(color_hex, color_name)
        rgb_values.append(hex_to_rgb(color_hex))
    
    kdt_db = KDTree(rgb_values)    
    
    distance, index = kdt_db.query(rgb_tuple)
    return f'closest match: {names[index]}'

def get_colors(img, numcolors=100) :
   # Reduce to palette
    img = img.quantize(colors=16, kmeans=16).convert('RGB')
    n_dom_colors = 16
    dom_colors = sorted(img.getcolors(2 ** 24), reverse=True)[:n_dom_colors]
    # get the rgb values out of the tuple
    colors = [color[1] for color in dom_colors[:5]]
    return colors

if __name__ == '__main__':
    input_file = sys.argv[1]
    # import csv file from command line argument
    rows = []
    with open(input_file, 'r') as csv_file:
        reader = csv.reader(csv_file)
        for row in reader:
            rows.append(row)
    
    colors_list = []

    for row in rows[1:] :
        print(row[0])
        # if the flag is not in the csv file, then we need to download it
        if row[1].startswith("http") :
            r = requests.get(row[1])
            
            if row[1].endswith("svg") :
                svg_text = r.content.decode("utf-8")
                hex_colors = re.findall(r'fill="#(?:[0-9a-fA-F]{3}){1,2}"', svg_text)
                temp_list = []
                for hex_color in hex_colors:
                    # convert hex color to rgb tuple usable by PIL
                    color = hex_to_rgb(hex_color[6:-1])
                    temp_list.append(color)
                
                temp_list = list(set(temp_list))
                colors_list.append(temp_list)

            else :
                try :
                    img = Image.open(BytesIO(r.content))
                    colors_list.append(get_colors(img, numcolors=100))
                except PIL.UnidentifiedImageError :
                    print(row[1] + " is not an image.")
        else :
            if row[1].endswith("svg") :
                # get the svg file and find all hex color codes in it
                with open("../" + row[1], 'r') as svg_file:
                    svg_text = "".join(svg_file.readlines())
                    hex_colors = re.findall(r'fill="#(?:[0-9a-fA-F]{3}){1,2}"', svg_text)
                    temp_list = []
                    for hex_color in hex_colors:
                        # convert hex color to rgb tuple usable by PIL
                        color = hex_to_rgb(hex_color[6:-1])
                        temp_list.append(color)
                    
                    temp_list = list(set(temp_list))
                    colors_list.append(temp_list)
            else :      
                img = Image.open("../" + row[1])
                colors_list.append(get_colors(img, numcolors=100))
        

    for i in colors_list :
        print(i)

    name_list = []
    for color_list in colors_list :
        temp_list = []
        for color in color_list :
            temp_list.append(convert_rgb_to_names(color))
        
        temp_list = [i[15:] for i in temp_list]
        
        color_names = []
        for color in temp_list :
            if color == "maroon" :
                color_names.append("red")
            elif color == "aqua" :
                color_names.append("blue")
            elif color == "gray" :
                color_names.append("white")
            elif color == "lime" :   
                color_names.append("green")
            elif color == "fuchsia" :
                color_names.append("purple")
            elif color == "navy" :
                color_names.append("blue")
            elif color == "silver" :
                color_names.append("white")
            else :
                color_names.append(color)

        color_names = list(set(color_names))
        print(color_names)

        name_list.append(color_names)

    for i in range(len(name_list)) :
        print(f"{rows[i + 1][0]} has the colours {name_list[i]}")