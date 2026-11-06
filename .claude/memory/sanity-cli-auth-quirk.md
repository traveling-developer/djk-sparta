---
name: sanity-cli-auth-quirk
description: "Sanity CLI in sanity/ picks up the robot \"deploy\" token from .env.local, which lacks dataset/admin grants — hide the env file and use the user login for dataset export/migrations"
metadata: 
  node_type: memory
  type: project
  originSessionId: dbb50cc7-5049-4309-b4f8-7ee099079734
---

The Sanity CLI auto-loads `sanity/.env.local`, whose `SANITY_AUTH_TOKEN` is a robot token named "deploy" without `sanity.project.datasets/read` grants. Commands like `sanity dataset export`, `sanity migration run`, or `sanity documents delete` fail with Unauthorized even after `sanity login` (the env token wins).

**Why:** the env token overrides the interactive login stored in `~/.config/sanity/config.json`.

**How to apply:** temporarily move the env file aside and pass project/dataset explicitly, e.g.
`mv .env.local .env.local.cli-bak && SANITY_STUDIO_PROJECT_ID=8qs584ty SANITY_STUDIO_DATASET=production npx sanity dataset export production ...; mv .env.local.cli-bak .env.local`
Studio deploy (`npm run deploy`) works fine WITH the env file (that's what the robot token is for). Migration apply also needs `--no-confirm` in non-interactive shells.
