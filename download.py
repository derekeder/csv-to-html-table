import os
import json
import disnake
from urllib.parse import urlparse, parse_qs
from datetime import datetime
from aiogoogle import Aiogoogle

service_account_key = json.loads(os.getenv('SERVICE_ACCOUNT_KEY'))

GOOGLE_CREDS = ServiceAccountCreds(
    scopes=[
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.resource",
    ],
    **service_account_key
)

def parse_google_download_link(url: str) -> Optional[str]:
    parsed = urlparse(url)
    patterns = [
        r"^/file/d/(.*?)/(edit|view)$",
        r"^/file/u/[0-9]+/d/(.*?)/(edit|view)$",
        r"^/file/d/(.*?)/?(edit|view)?$",
        r"^/file/u/[0-9]+/d/?(.*?)/?(edit|view)?$",
    ]
    for pattern in patterns:
        match = re.match(pattern, parsed.path)
        if match:
            return match.groups()[0]
    return None

async def download_google_file(file_id, path):
    async with Aiogoogle(service_account_creds=GOOGLE_CREDS) as aiogoogle:
        drive_v3 = await aiogoogle.discover("drive", "v3")
        await aiogoogle.as_service_account(
            drive_v3.files.get(
                fileId=file_id, download_file=path, alt="media", acknowledgeAbuse=False
            ),
        )

def snowflake_to_datetime(snowflake) -> datetime:
    timestamp = int(snowflake) >> 22
    timestamp += 1420070400000 # Discord's epoch
    return datetime.fromtimestamp(timestamp)

message_cache = []

with open('.config/last_message.txt', 'r') as file:
    last_message_id = int(file.read().strip())

async def parse_discord_link(url: str):
    global message_cache
    global last_message_id

    parsed_url = urlparse(url)
    
    expire_time = parse_qs(parsed_url.query).get('ex', None)
    if expire_time:
        expire_time = int(expire_time[0], 16)
        timestamp = datetime.fromtimestamp(expire_time)
        if timestamp > datetime.now():
            return url
    
    if not message_cache:
        submissions_channel: disnake.TextChannel = bot.get_channel(os.getenv('SUBMISSIONS_CHANNEL'))
        message_cache = await submissions_channel.history(
            limit=None, after=snowflake_to_datetime(last_message_id), oldest_first=True
        ).flatten()
    
    attachment_id = parsed_url.path.split("/")[-2]

    for message in message_cache:
        for a in message.attachments:
            if a.id == attachment_id:
                return attachment.url
    
    return None
