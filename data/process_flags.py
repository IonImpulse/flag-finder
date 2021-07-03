import PIL
from scipy.spatial import KDTree
from webcolors import (
    CSS21_NAMES_TO_HEX,
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
        rgb_values.append(hex_to_rgb(color_hex))
    
    kdt_db = KDTree(rgb_values)    
    
    distance, index = kdt_db.query(rgb_tuple)
    return f'closest match: {names[index]}'

def get_colors(img) :
   # Reduce to palette
    img = img.quantize(colors=16, kmeans=16).convert('RGB')
    dom_colors = sorted(img.getcolors(2 ** 24), reverse=True)
    # get the rgb values out of the tuple
    colors = [color[1] for color in dom_colors if color[0] > dom_colors[0][0] / 100]
    return colors

def process_svg(svg_text) :
    colors = []
    # find all fill statements in the svg
    fill_pattern = re.compile(r'fill="(.*?)"')
    stroke_pattern = re.compile(r'stroke="(.*?)"')
    for match in fill_pattern.finditer(svg_text) :
        color = match.group(1)

        if color != "none" :
            if color in CSS21_NAMES_TO_HEX.keys() :
                color = CSS21_NAMES_TO_HEX[color]
            # convert hex to rgb tuple
            rgb_tuple = hex_to_rgb(color)
            colors.append(rgb_tuple)
            
    for match in stroke_pattern.finditer(svg_text) :
        color = match.group(1)

        if color != "none" :
            if color in CSS21_NAMES_TO_HEX.keys() :
                color = CSS21_NAMES_TO_HEX[color]
            # convert hex to rgb tuple
            rgb_tuple = hex_to_rgb(color)
            colors.append(rgb_tuple)

    if svg_text.count("<path") == len(colors) + 1 :
        print("added black")
        colors.append((0,0,0))
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
                colors_list.append(process_svg(svg_text))
            else :
                try :
                    img = Image.open(BytesIO(r.content))
                    colors_list.append(get_colors(img))
                except PIL.UnidentifiedImageError :
                    print(row[1] + " is not an image.")
                    colors_list.append([])
        else :
            if row[1].endswith("svg") :
                # get the svg file and find all hex color codes in it
                with open("../" + row[1], 'r') as svg_file:
                    svg_text = "".join(svg_file.readlines())
                    colors_list.append(process_svg(svg_text))
            else :      
                img = Image.open("../" + row[1])
                colors_list.append(get_colors(img))

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
            elif color == "aqua" or color == "aquamarine" :
                color_names.append("blue")
            elif color == "gray" :
                color_names.append("white")
            elif color == "green"  or color == "lime" or color == "teal" or color == "olive":
                color_names.append("green/teal")
            elif color == "fuchsia" :
                color_names.append("purple")
            elif color == "navy" :
                color_names.append("blue")
            elif color == "silver" :
                color_names.append("white")
            elif color == "orange" or color == "yellow":
                color_names.append("orange/yellow")
            else :
                color_names.append(color)

        color_names = list(set(color_names))

        name_list.append(color_names)
    
    header = ["Name","URL","red","greenteal","blue","white","black","orangeyellow","purple","bars","stripes","circles","crosses","saltires","quarters","stars","crescents","triangles","contains_image","contains_text"]
    # write out a new file with the correct colors
    with open(input_file + "_processed.csv", 'w', newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(header)
        for i in range(len(rows) - 1) :
            row_to_write = [rows[i + 1][0], rows[i + 1][1]]

            if len(name_list[i]) > 0 :
                for j in ["red","green/teal","blue","white","black","orange/yellow","purple"] :
                    if j in name_list[i] :
                        row_to_write.append("TRUE")
                    else :
                        row_to_write.append("FALSE")
            else :
                print(rows[i + 1][0] + " has no colors.")
            
            writer.writerow(row_to_write)