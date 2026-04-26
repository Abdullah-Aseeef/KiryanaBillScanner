import asyncio
import json
import mimetypes
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest
from urllib.request import urlopen

from fastapi import FastAPI, Query, Request, Response

app = FastAPI()

# This is the "Verify Token" you will type into the Meta Dashboard
WEBHOOK_VERIFY_TOKEN = "karyana_magic_123"
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "EAARYwDXZBKsoBRSh2A6Ckq7ZBqZAMO4sMBE0kTASVJkZAJLXNxWuYrGHDRMRaBJ5M3xDXwzZAHNX2708qZCymQrVZCz8VPmmhGVzV8UEZBk6rAIBoMPOaVfwzf0qHpbQ6Ca4BvojqlVZCrtWEOVQiljSviHS1HILb3VpydEAfZAB68afaXiH9CZBUZCGVuYnRVF4MGoTYSWho9T0R5ZANjG6foCOducQQAjuwMkW3HhF6oC57rFiSh0If7BtAeveLBxtK6fJUjIiNzybwizBf7dFiUivlEZBI5")
WHATSAPP_API_VERSION = os.getenv("WHATSAPP_API_VERSION", "v22.0")
MEDIA_DOWNLOAD_DIR = Path(os.getenv("MEDIA_DOWNLOAD_DIR", "~/Downloads"))


def _download_image_from_meta(media_id: str) -> Path:
    if not WHATSAPP_ACCESS_TOKEN:
        raise RuntimeError("WHATSAPP_ACCESS_TOKEN is not set")

    metadata_url = f"https://graph.facebook.com/{WHATSAPP_API_VERSION}/{media_id}"
    metadata_request = UrlRequest(
        metadata_url,
        headers={"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"},
    )
    with urlopen(metadata_request, timeout=30) as response:
        metadata = json.loads(response.read().decode("utf-8"))

    media_url = metadata.get("url")
    if not media_url:
        raise RuntimeError(f"Meta did not return media URL for media_id={media_id}")

    mime_type = metadata.get("mime_type", "image/jpeg")
    extension = mimetypes.guess_extension(mime_type) or ".jpg"

    MEDIA_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    output_path = MEDIA_DOWNLOAD_DIR / f"wa_image_{timestamp}_{media_id}{extension}"

    image_request = UrlRequest(
        media_url,
        headers={"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"},
    )
    with urlopen(image_request, timeout=60) as response:
        output_path.write_bytes(response.read())

    return output_path


async def _process_incoming_images(payload: dict) -> list[Path]:
    downloaded_files: list[Path] = []

    entries = payload.get("entry", [])
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])

            for message in messages:
                if message.get("type") != "image":
                    continue

                image_data = message.get("image", {})
                media_id = image_data.get("id")
                if not media_id:
                    continue

                try:
                    saved_file = await asyncio.to_thread(_download_image_from_meta, media_id)
                    downloaded_files.append(saved_file)
                    print(f"Downloaded image to: {saved_file}")
                except (HTTPError, URLError, RuntimeError, json.JSONDecodeError) as exc:
                    print(f"Failed to download image media_id={media_id}: {exc}")

    return downloaded_files

@app.get("/webhook")
async def verify_webhook(
    mode: str = Query(None, alias="hub.mode"),
    token: str = Query(None, alias="hub.verify_token"),
    challenge: str = Query(None, alias="hub.challenge"),
):
    # Meta sends a GET request to verify your server is alive
    if mode == "subscribe" and token == WEBHOOK_VERIFY_TOKEN:
        print("WEBHOOK_VERIFIED")
        return Response(content=challenge, media_type="text/plain")
    return Response(content="Verification failed", status_code=403)

@app.post("/webhook")
async def handle_messages(request: Request):
    # This is where the images and messages will arrive
    data = await request.json()
    print("Received Webhook Data:", data)
    downloaded_files = await _process_incoming_images(data)
    if downloaded_files:
        print(f"Downloaded {len(downloaded_files)} image(s).")
    return {"status": "ok"}