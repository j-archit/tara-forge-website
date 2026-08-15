# Single-site deployment runbook

## Host requirements

Use a small Linux VPS with Docker Engine, the Docker Compose plugin, persistent disk, and inbound TCP 80/443 plus UDP 443. Point the domain's A/AAAA records at the host. The deployment has one public origin; the API, database, and worker are never published directly.

## First deployment

1. Clone the repository and check out the reviewed release commit.
2. Copy `.env.example` to `.env`. Set `SITE_ADDRESS`, `ALLOWED_ORIGINS`, and `SECURE_COOKIES=true`. Keep `.env` out of Git.
3. Run `docker compose config` and inspect the resolved configuration.
4. Run `docker compose build` followed by `docker compose up -d`.
5. Create the first administrator without putting the password in shell history:

   ```sh
   docker compose exec backend python -m app.cli create-admin admin@taraforge.in
   ```

6. Verify `docker compose ps`, `https://your-domain.example/api/health`, a public intake submission, administrator login, and the resulting worker job.

Caddy obtains and renews TLS certificates automatically when the public DNS records resolve correctly. Deploy application updates with `git pull`, `docker compose build`, and `docker compose up -d`; the one-shot `migrate` service applies database migrations before the API and worker start.

## Google Drive and Sheets

Google integration is disabled unless all three Google settings are present. Store the service-account JSON outside the repository. Add a local `compose.override.yaml` that mounts it read-only into both `backend` and `worker`, then set `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` to that container path and configure the Drive folder and Sheet IDs.

Example service fragment:

```yaml
services:
  backend:
    volumes:
      - /srv/taraforge/secrets/google-service-account.json:/run/secrets/google-service-account.json:ro
  worker:
    volumes:
      - /srv/taraforge/secrets/google-service-account.json:/run/secrets/google-service-account.json:ro
```

Do not bake the credential into an image or commit it to Git.

## Backups and restoration

Create a transactionally consistent SQLite snapshot plus model-vault archive:

```sh
docker compose --profile tools run --rm backup
```

The archive is written to the `application-backups` Docker volume and the tool retains the 14 newest archives by default. Copy archives off-host regularly and test restoration periodically. Schedule the command nightly with the host's systemd timer or cron, and apply a separate off-host retention and encryption policy.

Restoration replaces the live database and vault, so stop application writers first. The restore command requires `--force` and creates a pre-restore safety backup when a live database exists:

```sh
docker compose stop backend worker web gateway
docker compose --profile tools run --rm backup python -m app.backup restore /backups/taraforge-backup-YYYYMMDDTHHMMSSZ.zip --force
docker compose up -d
```

## Operational checks

- `docker compose ps` — all long-running services should be healthy/running.
- `docker compose logs --since=30m backend worker` — inspect API and job failures.
- `df -h` and `docker system df` — monitor host and Docker disk use; backend readiness fails when the vault filesystem falls below `MINIMUM_FREE_BYTES`.
- `docker compose exec backend python -m alembic current` — confirm the migration revision.
- `docker compose --profile tools run --rm backup` — verify backup creation after significant changes.
- Keep Docker, the host OS, and dependency lock files patched; CI runs backend tests and coverage plus frontend tests, lint, types, and production build.

If disk use grows, inspect the model vault and backup volume before pruning. Never delete the SQLite database, vault, or Docker volumes without a verified off-host backup.

## Credentials and disaster recovery

Rotate an administrator password by rerunning `python -m app.cli create-admin` for the same email. Rotate Google credentials in the provider console, replace the host secret, and restart `backend` and `worker`. Treat credentials found in Git history as compromised even after deleting the visible file.

For host loss, provision a clean Docker host, restore the same release of this repository and `.env`, copy a verified backup into the backup volume, run the guarded restore command, and start the stack. Validate administrator login, submission counts, vault checksums, a worker job, and Google synchronization before changing DNS. Keep the retired host or old stack stopped but recoverable until that validation and the chosen rollback window are complete.
