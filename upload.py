import os
import json
import requests

def upload_file_to_pixeldrain(file_path):
    url = "https://pixeldrain.com/api/file"
    with open(file_path, "rb") as f:
        file_path = os.path.basename(file_path)
        r = requests.post(url, files={"file": f}, auth=("", os.getenv("PIXELDRAIN_KEY")), data={"name": file_path, "anonymous": False})
        if r.status_code == 201:
            print(f"File {file_path} uploaded successfully: {r.json()["id"]}")
            return r.json()["id"]
        else:
            print(f"Failed to upload {file_path}. Status code: {r.status_code}")
            return None

with open("site/data/db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

for idx, chart in enumerate(db):
    if not chart["pixeldrain_id"] and chart["filename"] in os.listdir(".charts/"):
        chart["pixeldrain_id"] = upload_file_to_pixeldrain(".charts/" + chart["filename"])
        db[idx] = chart

with open("site/data/db.json", "w", encoding="utf-8") as json_file:
    json.dump(db, json_file, indent=4, ensure_ascii=False)
