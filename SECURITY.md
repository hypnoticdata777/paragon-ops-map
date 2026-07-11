# Security Policy

## Reporting a vulnerability

Please use GitHub's [private vulnerability reporting](security/advisories/new)
for this repository rather than opening a public issue. If that's not
available, open an issue that describes the problem in general terms without
a working exploit, and a maintainer will follow up to get details privately.

There's no bug bounty — this is a free, open-source hobby project — but
reports are genuinely appreciated and will be credited in the fix unless you
ask otherwise.

## Security model

**Main app.** PM Ops Map is a zero-backend, client-only app: it runs entirely
in your browser and stores its data in `localStorage` on your device. There is
no server, no account system, and no PM Ops Map–operated service that sees
your data. The main risks are the ones inherent to any browser-storage app:
anyone with access to the browser profile can read the stored data, and it is
only as safe as the device it runs on.

**Optional sync server** (`server/`). Teams that opt into Team Sync run their
own self-hosted instance to share one workspace across devices. Its security
model is intentionally lightweight — workspace passphrases are hashed with
`scrypt` server-side, but the client keeps its own copy in `localStorage`
unencrypted, there's no per-device access revocation, and it's designed for a
small team that already trusts each other rather than for adversarial
multi-tenant use. Full details are in
[`server/README.md`](server/README.md#security-model-honestly). If you deploy
it, always run it behind HTTPS.

## Supported versions

This project doesn't yet follow a formal versioning/release cycle — the
`master` branch is the supported version. Fixes land there.
