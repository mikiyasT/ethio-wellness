# Ayzon — temporary professional profile photo specs

Generate **10** temporary profile portraits for sample counselors in the Ayzon (Ethio Wellness) app. These are placeholders until real provider uploads exist.

## Delivery

| Item | Spec |
| --- | --- |
| Count | Exactly **10** images (one per professional below) |
| Filename | Exact slug listed (lowercase, hyphenated) + extension |
| Format | Prefer **JPEG** (`.jpg`). WebP also OK |
| Pixel size | **512 × 512** (square). 400×400 minimum if 512 is awkward |
| Color space | sRGB |
| Compression | High quality, no heavy artifacts; keep each file under ~250 KB if possible |
| Destination folder | `apps/web/public/professionals/` |
| Naming examples | `hana-tesfaye.jpg`, `dawit-mekonnen.jpg` |

Do **not** add text, watermarks, logos, borders, frames, or UI chrome in the image. The app will clip to a **rounded square** in CSS — generate a full square photo; do not pre-round the image canvas with transparent corners.

## Visual style (all 10)

- **Look:** Photorealistic head-and-shoulders portrait of an **Ethiopian / East African** adult counselor
- **Framing:** Face and upper shoulders centered; eyes roughly in the upper third; comfortable headroom
- **Expression:** Warm, calm, trustworthy; slight natural smile OK; not stiff corporate stock
- **Lighting:** Soft, even daylight or studio softbox; flattering, not dramatic noir
- **Background:** Soft, out-of-focus, muted teal/forest or warm neutral (fits dark Ayzon UI: deep teal `#092925` / gold accents). Avoid busy rooms, neon, purple gradients, office cubicles
- **Attire:** Professional but approachable (blouse, sweater, shirt, light blazer). No scrubs, no stethoscope, no clinic props
- **Avoid:** Sunglasses, hats covering the face, heavy filters, cartoon/illustration, AI “plastic” skin, Western-only casting, duplicate faces across files
- **Identity:** Each person must look **distinct** (age, face shape, hair, gender presentation as specified)

## App usage (context for the generator)

Photos appear everywhere a professional is shown:

- Professionals list cards (larger rounded-square photo beside name / languages / services)
- Professional detail / booking
- Client book flow, session cards, booking confirmation, join lobby
- Professional profile preview

UI crop: **rounded square** (`object-cover`, face-centered). Keep the face near center so crop stays safe.

## Master prompt (reuse for each person)

Use this base, then append the **Person line** from the table:

> Photorealistic square portrait photograph, 512x512, of an Ethiopian adult mental health counselor. Head and shoulders, face centered, warm calm expression, soft natural lighting, muted teal-neutral soft-focus background, professional approachable clothing. No text, no watermark, no border, no logo. Distinct real-person look, high detail face, natural skin texture.

## Required files

| # | Filename | Gender | Approx age | Person line (append to master prompt) |
| --- | --- | --- | --- | --- |
| 1 | `hana-tesfaye.jpg` | Woman | 32–38 | Woman named Hana Tesfaye vibe: clinical psychologist; natural dark hair, warm eyes, soft professional blouse |
| 2 | `dawit-mekonnen.jpg` | Man | 38–45 | Man named Dawit Mekonnen vibe: licensed counselor; short hair or neat fade, calm confident expression, simple collared shirt or sweater |
| 3 | `tigist-haile.jpg` | Woman | 30–36 | Woman named Tigist Haile vibe: family/youth psychologist; approachable smile, neat hair, light cardigan or blouse |
| 4 | `samuel-bekele.jpg` | Man | 35–42 | Man named Samuel Bekele vibe: marriage & family therapist; friendly, glasses optional, smart casual shirt |
| 5 | `almaz-girma.jpg` | Woman | 40–48 | Woman named Almaz Girma vibe: counselor; mature, gentle presence, modest professional attire |
| 6 | `yonas-tadesse.jpg` | Man | 34–40 | Man named Yonas Tadesse vibe: diaspora psychologist; modern neat look, soft smile, neutral knit or shirt |
| 7 | `meron-assefa.jpg` | Woman | 28–34 | Woman named Meron Assefa vibe: social worker for youth; youthful energy, warm expression, simple professional top |
| 8 | `kibrom-weldu.jpg` | Man | 36–44 | Man named Kibrom Weldu vibe: recovery counselor; steady kind expression, short hair, plain shirt |
| 9 | `selamawit-kifle.jpg` | Woman | 33–39 | Woman named Selamawit Kifle vibe: couples psychologist; polished but warm, shoulder-length or pulled-back hair |
| 10 | `girma-alemu.jpg` | Man | 45–55 | Man named Girma Alemu vibe: pastoral counselor; slightly older, dignified warm face, simple shirt or light jacket |

## Acceptance checklist

- [ ] 10 files, exact filenames above
- [ ] Each is square (~512×512)
- [ ] Face clearly visible and centered (safe for rounded-square crop)
- [ ] Correct gender presentation per row
- [ ] No two images look like the same person
- [ ] No text / watermark / border in the image
- [ ] Files ready to drop into `apps/web/public/professionals/`

## After generation

Place files here:

```text
apps/web/public/professionals/
  hana-tesfaye.jpg
  dawit-mekonnen.jpg
  tigist-haile.jpg
  samuel-bekele.jpg
  almaz-girma.jpg
  yonas-tadesse.jpg
  meron-assefa.jpg
  kibrom-weldu.jpg
  selamawit-kifle.jpg
  girma-alemu.jpg
```

Then tell the coding agent the photos are in place so the app can wire `photoUrl` (or `/professionals/{slug}.jpg`) on all professional surfaces with rounded-square framing.
