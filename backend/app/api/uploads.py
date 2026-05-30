from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response

try:
    from PIL import Image
except ImportError:  # pragma: no cover - fallback until Pillow is installed on server
    Image = None

from app.core.deps import require_admin
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["Uploads"])

DEFAULT_UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR = Path(settings.UPLOAD_DIR).expanduser() if settings.UPLOAD_DIR else DEFAULT_UPLOAD_DIR
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
OPTIMIZED_DIR = UPLOAD_DIR / "_optimized"
OPTIMIZED_DIR.mkdir(parents=True, exist_ok=True)


def upload_source_candidates(filename: str) -> list[Path]:
    roots = [
        UPLOAD_DIR,
        DEFAULT_UPLOAD_DIR,
        Path.cwd() / "uploads",
        Path.cwd() / "backend" / "uploads",
        Path("/var/www/uploads"),
        Path("/var/www/html/uploads"),
        Path("/srv/uploads"),
    ]
    candidates: list[Path] = []
    seen: set[str] = set()
    for root in roots:
        path = root / filename
        key = str(path.resolve()) if path.exists() else str(path)
        if key not in seen:
            seen.add(key)
            candidates.append(path)
    return candidates


def public_upload_urls(filename: str) -> list[str]:
    origins = [
        settings.PUBLIC_SITE_URL,
        settings.PUBLIC_BASE_URL,
        "https://giangtmc.io.vn",
    ]
    urls: list[str] = []
    for origin in origins:
        origin = (origin or "").rstrip("/")
        if not origin:
            continue
        url = f"{origin}/uploads/{filename}"
        if url not in urls:
            urls.append(url)
    return urls


def fetch_public_upload(filename: str) -> Path | None:
    target = UPLOAD_DIR / filename
    for url in public_upload_urls(filename):
        try:
            request = Request(url, headers={"User-Agent": "TMC-image-optimizer/1.0"})
            with urlopen(request, timeout=5) as response:
                content_type = response.headers.get("content-type", "")
                if response.status != 200 or not content_type.startswith("image/"):
                    continue
                target.write_bytes(response.read())
                return target
        except (OSError, URLError, TimeoutError):
            continue
    return None


def resolve_upload_source(filename: str) -> Path | None:
    for candidate in upload_source_candidates(filename):
        if candidate.exists() and candidate.is_file():
            return candidate
    return fetch_public_upload(filename)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    filename = f"{uuid4().hex}{suffix}"
    target = UPLOAD_DIR / filename
    content = await file.read()
    target.write_bytes(content)

    return {
        "filename": filename,
        "url": f"/uploads/{filename}",
        "uploaded_by": admin.email,
    }


@router.get("/optimized/{filename}")
async def optimized_image(filename: str, w: int = 480, q: int = 65):
    safe_name = Path(filename).name
    source = resolve_upload_source(safe_name)
    if source is None:
        raise HTTPException(status_code=404, detail="Image not found")

    suffix = source.suffix.lower()
    if Image is None or suffix not in ALLOWED_EXTENSIONS or suffix == ".gif":
        return FileResponse(source, headers={"Cache-Control": "public, max-age=31536000, immutable"})

    width = max(80, min(int(w or 480), 1600))
    quality = max(40, min(int(q or 65), 85))
    cache_name = f"{source.stem}-w{width}-q{quality}.webp"
    target = OPTIMIZED_DIR / cache_name

    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        try:
            with Image.open(source) as image:
                image = image.convert("RGB")
                if image.width > width:
                    ratio = width / image.width
                    height = max(1, int(image.height * ratio))
                    image = image.resize((width, height), Image.LANCZOS)
                image.save(target, "WEBP", quality=quality, method=6)
        except Exception:
            return FileResponse(source, headers={"Cache-Control": "public, max-age=31536000, immutable"})

    return Response(
        content=target.read_bytes(),
        media_type="image/webp",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@router.get("/optimized-health/{filename}")
async def optimized_health(filename: str):
    safe_name = Path(filename).name
    source = resolve_upload_source(safe_name)
    return {
        "filename": safe_name,
        "found": source is not None,
        "source": str(source) if source else None,
        "upload_dir": str(UPLOAD_DIR),
        "pillow": Image is not None,
        "public_sources": public_upload_urls(safe_name),
    }
