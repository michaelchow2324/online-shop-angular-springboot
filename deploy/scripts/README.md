# Database and catalog backups

Admin-added products live in **Postgres** (images in **MinIO** locally, **R2** in prod). Restarting the API or refreshing the browser does **not** re-seed or wipe the catalog.

You only lose data if you:

- `docker compose down -v` (deletes volumes)
- Add another Flyway **reseed** migration that `DELETE`s products (like `V11`)
- Destroy the VPS / disk without a dump

Do **not** generate a new Flyway reseed from admin data. The live database is the source of truth.

## What to use when

| Goal | Use |
|---|---|
| Full restore (orders, users, products, local images) | Nightly **`backup-all`** → `restore-db` + `restore-images` |
| Spreadsheet / rebuild catalog on an empty shop | Admin **Export CSV** / **Import** (CSV + image files) |
| Readable snapshot of names and prices | Nightly catalog CSV (API `dev` profile) — optional |

CSV does **not** restore orders, customers, or image bytes. Do not cron CSV as the disaster-recovery path.

## Full restore backup (cron)

```bash
# Linux / VPS / Git Bash — Postgres + local MinIO volume
bash deploy/scripts/backup-all.sh
```

```powershell
# Windows + Docker Desktop
.\deploy\scripts\backup-all.ps1
```

- **Postgres:** `backups/storedb-*.sql.gz` (bash) or `storedb-*.sql` (PowerShell)
- **MinIO:** `backups/minio-*.tar.gz` when volume `online-store-api_minio-data` exists
- **Prod:** MinIO volume is absent (images already on R2), so `backup-all` is a DB dump only

Keep 14 days by default (`KEEP_DAYS`). Dumps land in `backups/` (gitignored).

Install daily 03:00 cron from [`crontab.example`](crontab.example).

On Windows, Task Scheduler → `powershell.exe -File ...\deploy\scripts\backup-all.ps1` daily.

Nightly **catalog CSV** also writes to `backups/` when the API runs with the `dev` profile (`app.backup.catalog-dir`). The API must be up at 03:00 for that job; `backup-all` does not need the API.

## Restore a dump

Stop the API first so it is not writing during restore.

```bash
# Git Bash / VPS
CONFIRM=YES bash deploy/scripts/restore-db.sh backups/storedb-YYYYMMDD-HHMMSS.sql.gz
CONFIRM=YES bash deploy/scripts/restore-images.sh backups/minio-YYYYMMDD-HHMMSS.tar.gz
```

```powershell
$env:CONFIRM = 'YES'
.\deploy\scripts\restore-db.ps1 backups\storedb-YYYYMMDD-HHMMSS.sql
.\deploy\scripts\restore-images.ps1 backups\minio-YYYYMMDD-HHMMSS.tar.gz
```

`restore-db` drops and recreates the database. `restore-images` replaces the MinIO volume (stop MinIO, extract, start). Prod images on R2 survive a VPS rebuild — skip `restore-images` there.

## Admin CSV export / import

In admin: **Products → Export CSV**, or **Choose CSV** + **Choose images** → **Import**.

- `GET /api/admin/products/export` (ADMIN JWT)
- `POST /api/admin/products/import` multipart fields: `csv`, `images` (repeatable)

Import upserts by **slug**, then **SKU**. Image files attach when their filename matches `image_files` or the basename of `image_keys` / `primary_image`. Unknown category slugs are skipped with a warning; one bad row does not abort the file.

Seed-style CSV: [`data/product-import/products-template.csv`](../../data/product-import/products-template.csv).
