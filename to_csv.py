import json
import re
import csv

key_list = {
    "id": "ID",
    "name": "Song Name",
    "author": "Artist",
    "charter": "Charter",
    "year": "Year",
    "genre": "Genre",
    "tempo": "BPM",
    "difficulty": "Difficulty",
    "pixeldrain_id": "Download",
    "filename": "Archive Link",
    "size": "Size"
}

csv_data = []

with open("site/data/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)
for item in db:
    selected_data = {key_list[key]: item.get(key, None) for key in key_list}
    csv_data.append(selected_data)
# Write the updated database back to the db.json file
with open("site/data/db.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(key_list.values()))
    writer.writeheader()
    writer.writerows(csv_data)