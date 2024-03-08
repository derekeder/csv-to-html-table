import os
from internetarchive import get_session

config = {"s3":{"access": os.getenv("S3_ACCESS_KEY"), "secret": os.getenv("S3_SECRET_KEY")}}

session = get_session(config)

item = session.get_item("TromboneChampCustoms")

for file in os.listdir('.charts/'):
    try:
        item.upload_file('.charts/' + file)
    except Exception as e:
        print(f"Failed to upload {file} to the Internet Archive: {e}")
