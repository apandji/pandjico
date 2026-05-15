# Project Longwave
**Transmissions — a personal publishing hub for pandjico**
**Stack: Next.js · Supabase · Supasend · Bluesky AT Protocol · Are.na API**

**Role in repo:** Next major build — **Longwave / Transmissions** instrument. Canonical publishing at `/transmissions`; syndication outward. **North star:** [station-concept-and-critique.md](./station-concept-and-critique.md) (instruments table). **Not in active queue** until mobile + copy milestones — see [next-actions.md](./next-actions.md).

---

## What This Is

Transmissions is a personal publishing engine that lives at `pandjico.com/transmissions`. It is the canonical source of record for Andrew's thinking — short ambient captures and longer considered pieces — that radiates outward to Bluesky, Are.na, and LinkedIn.

The publishing direction is intentional: **things start here, then echo outward.** The portfolio is the home. The platforms are distribution.

There are two modes of transmission and two entry points for authoring. The page itself is a single reverse-chronological stream. The design is text-first, sparse, and continuous — closer to an IRC log than a blog.

---

## Transmission Modes

### Short
- 1–3 sentences
- No image
- Published immediately via Supasend webhook
- Auto-syndicates to Bluesky by default
- Ambient, unpolished, in-motion

### Long
- A few paragraphs, no hard limit but culturally capped at ~400 words
- One optional image or GIF, always placed *below* the text
- Drafted and published via web admin
- Syndication manually toggled per transmission before publish
- More considered, but still not a blog post — no titles, no headers

The distinction between modes is density, not a different layout. Both live in the same stream. A short transmission has air around it. A long one fills more of the viewport. Neither has a title.

---

## Project Structure

```
/transmissions          — public page, the stream
/transmissions/[id]     — individual transmission permalink
/transmissions/feed.xml — RSS feed
/admin/transmissions    — protected authoring interface
/api/broadcast          — Supasend webhook receiver
/api/syndicate          — syndication dispatcher
```

---

## Database Schema

### Supabase — `transmissions` table

```sql
create table transmissions (
  id              uuid default gen_random_uuid() primary key,
  content         text not null,
  mode            text not null check (mode in ('short', 'long')),
  image_url       text,
  image_alt       text,
  created_at      timestamptz default now(),
  published_at    timestamptz,
  visible         boolean default true,
  draft           boolean default false,
  syndication     jsonb default '{"bluesky": false, "arena": false, "linkedin": false}',
  syndicated_at   jsonb default '{"bluesky": null, "arena": null, "linkedin": null}'
);

-- Index for public feed query
create index transmissions_published_at_idx 
  on transmissions (published_at desc) 
  where visible = true and draft = false;
```

### Default syndication behavior per mode

| Mode  | Bluesky | Are.na | LinkedIn |
|-------|---------|--------|----------|
| Short | `true`  | `false`| `false`  |
| Long  | `true`  | `true` | manual   |

These are defaults set at insert time. Any transmission can override them.

---

## Entry Point 1 — Supasend Webhook (Short Transmissions)

### Setup in Supasend
1. In the Supasend app, add a new destination: **Webhook**
2. Set the URL to: `https://pandjico.com/api/broadcast`
3. Add a custom header: `x-broadcast-secret: [your secret]`
4. Store this secret in Supabase Vault or as an environment variable: `BROADCAST_SECRET`

### API Route — `/api/broadcast`

```typescript
// app/api/broadcast/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Validate webhook secret
  const secret = req.headers.get('x-broadcast-secret')
  if (secret !== process.env.BROADCAST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const content = body.text || body.content || body.note

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Empty content' }, { status: 400 })
  }

  // Optional: light moderation via Claude before insert
  const moderated = await moderateContent(content)
  if (!moderated.ok) {
    return NextResponse.json({ error: 'Content flagged' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('transmissions')
    .insert({
      content: moderated.cleaned,
      mode: 'short',
      draft: false,
      published_at: new Date().toISOString(),
      syndication: { bluesky: true, arena: false, linkedin: false }
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger syndication asynchronously
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/syndicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: data.id })
  })

  return NextResponse.json({ ok: true, id: data.id })
}

async function moderateContent(content: string): Promise<{ ok: boolean; cleaned: string }> {
  // Claude moderation — lightweight, fast
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Review this text for publication on a professional portfolio site. 
Return JSON only: { "ok": boolean, "cleaned": string, "reason": string }
- ok: true if safe to publish, false if it contains harassment, slurs, or content 
  you'd genuinely regret publishing
- cleaned: the text with any profanity softened (not removed, just toned down) 
  — preserve the author's voice
- reason: brief note if flagged, empty string if ok

Text: "${content}"`
      }]
    })
  })

  try {
    const data = await response.json()
    const text = data.content[0].text
    return JSON.parse(text)
  } catch {
    // If moderation fails, default to allowing — don't block publication
    return { ok: true, cleaned: content }
  }
}
```

---

## Entry Point 2 — Web Admin (Long Transmissions)

### Route: `/admin/transmissions`

Protected via Supabase Auth. No public access. Accessible from phone browser as well as desktop.

### Admin UI spec

```
┌─────────────────────────────────────┐
│  New Transmission                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │  [textarea — plain text,      │  │
│  │   markdown links supported,   │  │
│  │   no rich text toolbar]       │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  [ + Attach image or GIF ]          │
│    ↳ if attached:                   │
│      [image preview — small]        │
│      [alt text field]               │
│                                     │
│  Syndicate to:                      │
│  [x] Bluesky   [ ] Are.na   [ ] LinkedIn  │
│                                     │
│  [ Save draft ]  [ Publish ]        │
└─────────────────────────────────────┘
```

```
┌─────────────────────────────────────┐
│  Drafts (2)          Published (47) │
│                                     │
│  [draft entry]  ···  [edit] [publish] [delete] │
│  [draft entry]  ···                 │
│                                     │
│  ──────────────────────────────     │
│                                     │
│  [published entry]  ···  [hide] [delete] │
│  [published entry]  ···             │
│  ...                                │
└─────────────────────────────────────┘
```

### Admin API routes

```typescript
// POST /api/admin/transmissions — create or update
// DELETE /api/admin/transmissions/[id] — delete
// PATCH /api/admin/transmissions/[id] — toggle visible, publish draft
// POST /api/admin/upload — image upload to Supabase Storage
```

All admin routes check for a valid Supabase session. Return 401 if not authenticated.

### Image handling

```typescript
// Upload to Supabase Storage, return public URL
// Bucket: 'transmissions-media'
// Path: `${userId}/${timestamp}-${filename}`
// Max size: 5MB
// Accepted types: image/gif, image/jpeg, image/png, image/webp

const { data } = await supabase.storage
  .from('transmissions-media')
  .upload(path, file, { contentType: file.type, upsert: false })

const { data: { publicUrl } } = supabase.storage
  .from('transmissions-media')
  .getPublicUrl(path)
```

---

## Syndication Engine

### Route: `/api/syndicate`

Called after every publish event — either from the broadcast webhook or the admin publish action. Reads the transmission's `syndication` flags and dispatches accordingly. Only runs for transmissions not yet syndicated to a given platform.

```typescript
// app/api/syndicate/route.ts

import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { id } = await req.json()
  const supabase = createClient(...)

  const { data: tx } = await supabase
    .from('transmissions')
    .select('*')
    .eq('id', id)
    .single()

  if (!tx || tx.draft || !tx.visible) return Response.json({ ok: true })

  const results: Record<string, string> = {}

  // Bluesky
  if (tx.syndication.bluesky && !tx.syndicated_at.bluesky) {
    const posted = await postToBluesky(tx)
    if (posted) results.bluesky = new Date().toISOString()
  }

  // Are.na
  if (tx.syndication.arena && !tx.syndicated_at.arena) {
    const posted = await postToArena(tx)
    if (posted) results.arena = new Date().toISOString()
  }

  // LinkedIn — never auto-syndicates, only via admin manual trigger
  // if (tx.syndication.linkedin && !tx.syndicated_at.linkedin) { ... }

  // Update syndicated_at timestamps
  if (Object.keys(results).length > 0) {
    await supabase
      .from('transmissions')
      .update({
        syndicated_at: { ...tx.syndicated_at, ...results }
      })
      .eq('id', id)
  }

  return Response.json({ ok: true, syndicated: results })
}
```

### Bluesky syndication

```typescript
async function postToBluesky(tx: Transmission): Promise<boolean> {
  // AT Protocol — create session, then create record
  const session = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: process.env.BLUESKY_HANDLE,
      password: process.env.BLUESKY_APP_PASSWORD // use an app password, not your real password
    })
  }).then(r => r.json())

  // For long transmissions: post first ~280 chars + permalink
  // For short transmissions: post full content
  const text = tx.mode === 'short'
    ? tx.content
    : `${tx.content.slice(0, 240)}… pandjico.com/transmissions/${tx.id}`

  await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessJwt}`
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text,
        createdAt: new Date().toISOString(),
        '$type': 'app.bsky.feed.post'
      }
    })
  })

  return true
}
```

### Are.na syndication

```typescript
async function postToArena(tx: Transmission): Promise<boolean> {
  // Are.na API — create a block in a designated channel
  // Channel slug stored in env: ARENA_CHANNEL_SLUG
  // Are.na personal access token: ARENA_ACCESS_TOKEN

  // Text block
  await fetch(`https://api.are.na/v2/channels/${process.env.ARENA_CHANNEL_SLUG}/blocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ARENA_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      content: tx.content,
      description: `pandjico.com/transmissions/${tx.id}`
    })
  })

  // If image attached, post as a separate image block
  if (tx.image_url) {
    await fetch(`https://api.are.na/v2/channels/${process.env.ARENA_CHANNEL_SLUG}/blocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARENA_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        source: tx.image_url,
        description: tx.image_alt || ''
      })
    })
  }

  return true
}
```

### LinkedIn — manual only

LinkedIn's API is restrictive and format-sensitive enough that auto-posting often looks wrong. The admin view has a one-tap "Post to LinkedIn" button on any long transmission. This triggers the syndication route with `{ id, platforms: ['linkedin'] }` explicitly. Never automated.

```typescript
// Requires: LinkedIn OAuth2 access token with w_member_social scope
// Token management is out of scope for v1 — use a manual share button
// that pre-fills the LinkedIn share dialog with the permalink instead

const linkedInShareUrl = 
  `https://www.linkedin.com/sharing/share-offsite/?url=` +
  encodeURIComponent(`https://pandjico.com/transmissions/${tx.id}`)
```

For v1, LinkedIn is a pre-filled share dialog. Native API posting is a v2 concern.

---

## Public Page — `/transmissions`

### Design spec

Single column, reverse chronological. No pagination initially — infinite scroll or a "load more" trigger at the bottom when entries exceed ~40.

**No titles.** No categories. No author byline (it's always you). Just content and timestamp.

```
┌─────────────────────────────────────┐
│                                     │
│  transmissions                      │  ← page heading, small, left
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  May 15 · 4:47pm                    │  ← timestamp, muted, small
│                                     │
│  Something I've been thinking about │  ← content, comfortable reading
│  — the way respiratory distress     │     width, ~60ch max
│  maps onto spatial anxiety. Both    │
│  are about thresholds.              │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  May 12 · 11:20am                   │
│                                     │
│  Been rewatching how Severance uses │
│  spatial disorientation as labor    │
│  metaphor. Thinking about it        │
│  alongside egress. The building     │
│  knows something you don't.         │
│                                     │
│  [gif or image here — below text,   │  ← image/gif, constrained width,
│   max ~480px wide, subtle border]   │     never hero, always subordinate
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  May 9 · 8:03am                     │
│                                     │
│  thirty-eight degrees this morning. │  ← short transmission — just a line,
│                                     │     generous space around it
│  ─────────────────────────────────  │
│                                     │
│  [subscribe via RSS]                │  ← bottom of page, small, plain link
│                                     │
└─────────────────────────────────────┘
```

### Typography

Inherit from the site's existing type system. The key distinction:
- Content text: the site's body face, comfortable reading size (~1.05–1.1rem)
- Timestamps: monospace or tabular figures, muted (50–60% opacity), smaller (~0.78rem)
- The gap between transmissions should be generous — more than you think you need

### Color

The sky-based color system applies here. The page background shifts with the rest of the site. Timestamps and dividers use the current palette's secondary color. No special treatment — Transmissions is a native part of the site, not a different world.

### Image/GIF treatment

```css
.transmission-image {
  display: block;
  margin-top: 1.25rem;
  max-width: min(480px, 100%);
  border-radius: 2px;
  opacity: 0.92; /* slightly subordinate to text */
  border: 1px solid hsl(var(--sky-accent) / 0.2);
}
```

No lightbox. No caption overlay. The alt text is visible below the image in small type — it doubles as a caption and enforces the habit of writing alt text intentionally.

### Individual permalink — `/transmissions/[id]`

Same single-column layout, single entry. This is what syndicates — the canonical URL. Open Graph tags populated from content (first 160 chars) and image_url if present.

```typescript
// app/transmissions/[id]/page.tsx
export async function generateMetadata({ params }) {
  const tx = await getTransmission(params.id)
  return {
    title: `${tx.content.slice(0, 60)}… — Andrew Pandji`,
    description: tx.content.slice(0, 160),
    openGraph: {
      images: tx.image_url ? [tx.image_url] : ['/og-default.png']
    }
  }
}
```

---

## RSS Feed — `/transmissions/feed.xml`

An actual RSS 2.0 feed. This is a deliberate signal — people who use RSS are the right audience.

```typescript
// app/transmissions/feed.xml/route.ts

import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(...)
  
  const { data } = await supabase
    .from('transmissions')
    .select('id, content, image_url, image_alt, published_at, mode')
    .eq('visible', true)
    .eq('draft', false)
    .order('published_at', { ascending: false })
    .limit(40)

  const items = data?.map(tx => `
    <item>
      <title>${escapeXml(tx.content.slice(0, 80))}${tx.content.length > 80 ? '…' : ''}</title>
      <link>https://pandjico.com/transmissions/${tx.id}</link>
      <guid>https://pandjico.com/transmissions/${tx.id}</guid>
      <pubDate>${new Date(tx.published_at).toUTCString()}</pubDate>
      <description><![CDATA[
        <p>${tx.content}</p>
        ${tx.image_url ? `<img src="${tx.image_url}" alt="${tx.image_alt || ''}" />` : ''}
      ]]></description>
    </item>
  `).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Transmissions — Andrew Pandji</title>
    <link>https://pandjico.com/transmissions</link>
    <description>Short and long transmissions from Andrew Pandji — creative technologist, St. Louis.</description>
    <language>en-us</language>
    <atom:link href="https://pandjico.com/transmissions/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  })
}
```

---

## Homepage Integration

The most recent transmission appears on the homepage as an ambient away message. Small, peripheral, in the footer region or below the project cards. One line (or first sentence if long). Links to `/transmissions`.

```typescript
// Fetch on homepage with short revalidation
const latestTransmission = await supabase
  .from('transmissions')
  .select('id, content, published_at')
  .eq('visible', true)
  .eq('draft', false)
  .order('published_at', { ascending: false })
  .limit(1)
  .single()
```

```
latest transmission · May 15 · 4:47pm
thirty-eight degrees this morning.          → /transmissions
```

This is the thread that connects the site's static presence to the live, in-motion you.

---

## Environment Variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Webhook auth
BROADCAST_SECRET=

# Claude (moderation)
ANTHROPIC_API_KEY=

# Bluesky
BLUESKY_HANDLE=
BLUESKY_APP_PASSWORD=        # generate at bsky.app/settings/app-passwords

# Are.na
ARENA_ACCESS_TOKEN=           # personal access token from dev.are.na
ARENA_CHANNEL_SLUG=           # the channel slug you want blocks posted to

# Site
NEXT_PUBLIC_SITE_URL=https://pandjico.com
```

---

## Build Order

| Phase | Task | Notes |
|---|---|---|
| 1 | Supabase schema | Create table, storage bucket, RLS policies |
| 2 | `/api/broadcast` webhook | Supasend → insert short transmission |
| 3 | Homepage away message | Surfaces latest transmission, low stakes |
| 4 | `/transmissions` public page | The stream, no syndication yet |
| 5 | `/transmissions/feed.xml` | RSS, one afternoon |
| 6 | `/admin/transmissions` | Auth-protected, long transmission authoring |
| 7 | Claude moderation | Lightweight, add after v1 is stable |
| 8 | Bluesky syndication | AT Protocol, requires app password |
| 9 | Are.na syndication | Simpler API, add alongside Bluesky |
| 10 | LinkedIn share | Pre-filled dialog for v1, native API later |
| 11 | Individual permalinks + OG | Required before any syndication goes live |

---

## What This Becomes

Phase 1 is a publishing tool and a page. But the architecture is designed for what comes after:

- The Transmissions stream becomes the gravity for the forum/community layer — your broadcast seeds conversation
- The Are.na channel becomes a public record of your thinking that lives independently of the portfolio
- The RSS feed builds a quiet audience of exactly the right people
- The Supabase `transmissions` table is the source of truth for everything — the forum, the homepage, the social presence

Everything starts here. On Supasend. In your pocket.
