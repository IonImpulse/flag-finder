import csv
import json

codes = open("codes.json")
codes = json.load(codes)

codes = {value.replace(" ", " "): key for key, value in codes.items()}

print(codes)

with open("us_state_territory_flags.csv", "r", newline='', encoding="utf8") as f :
    flag_data = [row for row in csv.reader(f, delimiter = ',')]

print(flag_data)

out_data = []

for row in flag_data :
    if row[0] in codes :
        out_data.append(row)
        out_data[-1][1] = f"https://flagcdn.com/w640/{codes[row[0]]}.png"

    else :
        out_data.append(row)
        print("Couldn't do", row)

with open("us_state_territory_flags1.csv", "w", encoding="utf8", newline="") as f :
    csv_writer = csv.writer(f, dialect="excel")
    csv_writer.writerows(out_data)