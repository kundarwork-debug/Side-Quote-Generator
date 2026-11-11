# APML Drive API — Working Backup

Snapshot date: 2026-11-11

This branch preserves the Worker source and Wrangler configuration that were active when APML Drive was confirmed working.

## Snapshot files
- `cloudflare/worker.js` — exact copy of the working Worker source from `main`
- `wrangler.toml` — exact copy of the working deployment configuration from `main`

## Runtime configuration (values intentionally NOT stored here)
Cloudflare Worker runtime secrets expected by the current setup:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_ADMIN_IDS`
- `TELEGRAM_WEBHOOK_SECRET`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

KV binding:
- Binding name: `ANNOUNCE_KV`
- Namespace ID is recorded in `wrangler.toml`.

Never commit secret values or API tokens to this repository.

## Restore
To restore this snapshot, copy the two snapshot files back to their original paths on the production branch, review the diff, and deploy only after verifying Cloudflare runtime secrets and the KV binding are still present.

This backup branch is separate from `main`; it does not change the production branch.
