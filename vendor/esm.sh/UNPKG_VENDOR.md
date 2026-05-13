# Vendored esm.sh Baseline

This directory contains a pinned source copy of `esm-dev/esm.sh` for local compatibility testing.

- Upstream: https://github.com/esm-dev/esm.sh
- Tag: `v137_3`
- Commit: `1960055e1d5361d5773c1868a05fbdbed8607b40`
- License: MIT, preserved in `LICENSE`

Use this copy as the local baseline when comparing `esm.unpkg.com` behavior against esm.sh. This avoids sending large corpus runs to production `https://esm.sh`, where cold builds and shared public rate limits can make results noisy.

Start the local baseline from the repo root:

```sh
pnpm vendor:esm-sh
```

Then run the compatibility suite with `ESM_SH_ORIGIN=http://localhost:8081`, or use:

```sh
pnpm test:esm-compat:local-baseline -- --corpus scripts/esm-compat-corpus.ecosystem.json
```

The baseline stores generated artifacts under `vendor/esm.sh/.esmd/`, which is ignored by the vendored `.gitignore`.

To update the vendored copy, replace this directory with a fresh checkout of the desired upstream tag, keep this file and `unpkg-baseline.config.json`, and update the tag and commit above.
