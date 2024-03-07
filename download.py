import os
import json
import aiohttp
import disnake
from urllib.parse import urlparse, parse_qs
from datetime import datetime
from pathlib import Path
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


class DownloadClient(disnake.Client):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.message_cache = []
        with open('.config/last_message.txt', 'r') as file:
            self.last_message_id = int(file.read().strip())
        # We'll init this later
        self.session: aiohttp.ClientSession = None
    

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
    

    async def download_google_file(file_id: str, path: str):
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
    

    async def download_discord_link(url: str, path: str):
        parsed_url = urlparse(url)
        expire_time = parse_qs(parsed_url.query).get('ex', None)
        if expire_time:
            expire_time = int(expire_time[0], 16)
            timestamp = datetime.fromtimestamp(expire_time)
            if timestamp > datetime.now():
                async with self.session.get(url) as response:
                    # we can try refreshing the URL below if we get a non-200 response
                    if response.status == 200:
                        async with aiofiles.open(path, 'wb') as file:
                            async for data, _ in response.content.iter_chunks():
                                await file.write(data)
                                return
        
        if not self.message_cache:
            submissions_channel: disnake.TextChannel = bot.get_channel(os.getenv('SUBMISSIONS_CHANNEL'))
            self.message_cache = await submissions_channel.history(
                limit=None, after=snowflake_to_datetime(self.last_message_id), oldest_first=True
            ).flatten()
        
        attachment_id = parsed_url.path.split("/")[-2]

        for message in self.message_cache:
            for a in message.attachments:
                if a.id == attachment_id:
                    await a.save(fp=path)
                    return
        
        raise FileNotFoundError


if __name__ == "__main__":
    client = DownloadClient()
    client.run(os.getenv("DISCORD_TOKEN"))
