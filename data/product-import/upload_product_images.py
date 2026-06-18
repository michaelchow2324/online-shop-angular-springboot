#!/usr/bin/env python3
"""
Upload product images from resources/images/products to MinIO.

Keys match the migration seed: products/<filename>

Usage:
  pip install minio
  python data/product-import/upload_product_images.py
  python data/product-import/upload_product_images.py --dry-run
"""

from __future__ import annotations

import argparse
import csv
import json
import mimetypes
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "data" / "product-import" / "products_seed.csv"
IMAGE_DIR = ROOT / "resources" / "images" / "products"
STORAGE_PREFIX = "products"

DEFAULT_ENDPOINT = "localhost:9000"
DEFAULT_ACCESS_KEY = "minioadmin"
DEFAULT_SECRET_KEY = "minioadmin"
DEFAULT_BUCKET = "online-store-bucket"
DEFAULT_SECURE = False


def load_image_index() -> dict[str, Path]:
    if not IMAGE_DIR.is_dir():
        return {}
    return {path.name.lower(): path for path in IMAGE_DIR.iterdir() if path.is_file()}


def resolve_local_file(filename: str, image_index: dict[str, Path]) -> Path | None:
    return image_index.get(filename.strip().lower())


def collect_upload_targets(image_index: dict[str, Path]) -> list[tuple[str, Path]]:
    targets: dict[str, Path] = {}

    with CSV_PATH.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            image_files = row.get("image_files", "")
            for part in image_files.split(","):
                filename = part.strip()
                if not filename:
                    continue
                local_path = resolve_local_file(filename, image_index)
                if local_path is None:
                    print(f"WARNING: missing local file for CSV reference '{filename}'", file=sys.stderr)
                    continue
                storage_key = f"{STORAGE_PREFIX}/{local_path.name}"
                targets[storage_key] = local_path

    return sorted(targets.items())


def ensure_bucket(client, bucket: str) -> None:
    from minio.error import S3Error

    try:
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)
            print(f"Created bucket: {bucket}")
    except S3Error as exc:
        raise RuntimeError(f"Failed to ensure bucket {bucket}: {exc}") from exc

    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket}/*"],
            }
        ],
    }
    client.set_bucket_policy(bucket, json.dumps(policy))
    print(f"Bucket policy set to public read: {bucket}")


def upload_file(client, bucket: str, storage_key: str, local_path: Path, dry_run: bool) -> None:
    content_type = mimetypes.guess_type(local_path.name)[0] or "application/octet-stream"
    if dry_run:
        print(f"DRY RUN upload {local_path.name} -> {bucket}/{storage_key} ({content_type})")
        return
    client.fput_object(bucket, storage_key, str(local_path), content_type=content_type)
    print(f"Uploaded {local_path.name} -> {bucket}/{storage_key}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload seeded product images to MinIO")
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT)
    parser.add_argument("--access-key", default=DEFAULT_ACCESS_KEY)
    parser.add_argument("--secret-key", default=DEFAULT_SECRET_KEY)
    parser.add_argument("--bucket", default=DEFAULT_BUCKET)
    parser.add_argument("--secure", action="store_true", help="Use HTTPS for MinIO endpoint")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not CSV_PATH.is_file():
        print(f"ERROR: CSV not found: {CSV_PATH}", file=sys.stderr)
        return 1

    image_index = load_image_index()
    targets = collect_upload_targets(image_index)
    if not targets:
        print("No upload targets found.", file=sys.stderr)
        return 1

    if args.dry_run:
        for storage_key, local_path in targets:
            upload_file(None, args.bucket, storage_key, local_path, True)
        print(f"Dry run complete: {len(targets)} files")
        return 0

    try:
        from minio import Minio
    except ImportError:
        print("ERROR: install dependency first: pip install minio", file=sys.stderr)
        return 1

    client = Minio(
        args.endpoint,
        access_key=args.access_key,
        secret_key=args.secret_key,
        secure=args.secure,
    )

    ensure_bucket(client, args.bucket)
    for storage_key, local_path in targets:
        upload_file(client, args.bucket, storage_key, local_path, False)

    print(f"Done. Uploaded {len(targets)} files to {args.bucket}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
