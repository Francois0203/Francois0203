# Sync scripts

Two Node scripts, both run by `.github/workflows/sync-github.yml` (on every push
to `main`, monthly, or manually from the Actions tab). Both read from GitHub and
write to Firestore; the site itself never calls the GitHub API.

| Script | Reads | Writes | Drives |
| --- | --- | --- | --- |
| `syncGitHubProjects.mjs` | the repo list in `portfolio/githubConfig` | `githubProjects/*` | Projects → *Code & Experiments* |
| `syncStudioSites.mjs` | every repo in the `FM-Web-Studio` org | `studioSites/*` | Home → *Featured work*, Projects → *Client Work* |

`lib/gh.mjs` holds the shared GitHub helpers (auth headers, pagination, reading a
file or README out of a repo); `lib/firebase.mjs` resolves credentials and hands
back a Firestore handle.

---

## Client sites (`syncStudioSites.mjs`)

### The rule

**Nothing is hardcoded.** The script lists the org, so adding a repo to
`FM-Web-Studio` puts it on the site and removing it takes it off. What a repo
*does* have to say is **where it is deployed**, because no GitHub metadata knows
a repo's Firebase Hosting url. It says that in its own tree, and three ways are
tried in order:

1. **`.showcase.json` at the repo root** - the good path. Multiple sites, client
   name, tagline, ordering, featured flag. Copy `showcase.template.json`.
2. **The repo's GitHub `homepage` field** (Settings → Website) - one url, no
   extra metadata. Fine for a simple one-site repo.
3. **`.firebaserc` + `firebase.json`** - derives `https://<site>.web.app` from
   the hosting config, so a plain Firebase repo works with no manifest at all.
   Hosting *targets* are read too, which is how a project with two apps is
   picked up. A **custom domain is invisible** to this path - those need
   option 1 or 2.

A repo none of the three finds a url for still syncs, and shows up in
Admin → **Client Sites** flagged as having no live url. It is not rendered
publicly.

### `.showcase.json`

Every field is optional. Minimum useful version:

```json
{
  "client": "Acme Plumbing",
  "tagline": "Booking site for a local trade",
  "featured": true,
  "sites": [
    { "label": "Live site",   "url": "https://acme-plumbing.web.app" },
    { "label": "Admin panel", "url": "https://acme-admin.web.app" }
  ],
  "stack": ["React", "Firebase"]
}
```

- `sites` - up to 4. Two or more render as tabs inside the browser chrome on the
  card. A bare string is accepted as shorthand for `{ url }`.
- `featured: true` - opts the site into the home page (max 3). If **no** repo is
  flagged, the home page falls back to the first three by `order`, so it is never
  empty by accident.
- `order` - ascending, default `100`. This is the display order on both pages.
- `name`, `client`, `tagline`, `description`, `stack`, `tags` - card copy.

Edit the manifest, re-run the workflow, done. There is nothing to change in the
portfolio repo and nothing to edit in the admin panel.

### Embedding

The cards hold **real live iframes**, so each url is probed once per sync for
whether it actually permits framing (`X-Frame-Options`, CSP `frame-ancestors`)
and the verdict is stored per url. A site that refuses is never framed - it gets
a card explaining why with a link out, instead of a blank white panel.

The probe is deliberately pessimistic: a `frame-ancestors` list it cannot
evaluate counts as a refusal. Set the `SITE_ORIGIN` repo variable to the
portfolio's own origin (e.g. `francois-portfolio.web.app`) so such lists can be checked
properly rather than assumed hostile.

Firebase Hosting sends no framing headers by default, so an ordinary
`firebase deploy` site embeds fine with no configuration.

### Env

| Var | Where | Notes |
| --- | --- | --- |
| `STUDIO_PAT` | secret | Token that can list the org. Preferred; falls back to `GH_PAT`. See below. |
| `GH_PAT` | secret | Used when `STUDIO_PAT` is unset. A classic token needs **`repo` + `read:org`**. |
| `SERVICE_ACCOUNT` | secret | Firebase Admin service-account JSON. **Omit for a local run** to fall back to application-default credentials. |
| `STUDIO_ORG` | set in the workflow | defaults to `FM-Web-Studio` |
| `SITE_ORIGIN` | repo *variable* | optional, improves CSP evaluation |
| `PRUNE` | set to `'1'` in the workflow | deletes docs for repos no longer in the org. Off by default so a transient GitHub error can't wipe the collection. |

### Tokens

A **fine-grained** token is scoped to a single resource owner, and that owner
cannot be changed after creation - so one fine-grained token cannot cover both
`Francois0203` (the personal repos `syncGitHubProjects.mjs` reads) and the
`FM-Web-Studio` org. Hence two secrets: `GH_PAT` for the personal sync,
`STUDIO_PAT` for the org.

For `STUDIO_PAT`: resource owner `FM-Web-Studio`, repository access **All
repositories** (selecting individual repos means every new client repo needs a
token edit, which defeats the discovery design), permissions Contents: read and
Metadata: read. Fine-grained tokens expire - when it lapses the sync step fails
in Actions and the site keeps serving the last synced data.

A single **classic** token with `repo` + `read:org` covers both owners, in which
case `GH_PAT` alone is enough and `STUDIO_PAT` can be left unset.

### Running it locally

No service-account key needed - with no `SERVICE_ACCOUNT` set, both scripts use
application-default credentials and read the project id from `.firebaserc`:

```bash
gcloud auth application-default login   # once
cd scripts
npm install
GH_PAT=ghp_… node syncStudioSites.mjs
```

The first line of output says which credentials were used. The rest names, per
repo, how many urls were found, which strategy found them, how many can be
embedded, and anything unreachable or malformed.

A local run writes to the **live** Firestore - there is no emulator wired up
here, so treat it as a deploy, not a dry run.
