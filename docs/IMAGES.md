# Images for AdmitFlow

Put the files below in `public/images/` using these exact names.
Any missing file is replaced by a plain navy panel, so the site never breaks.
Run `node scripts/check-images.mjs` to see what is still missing.

## Required (11 files)

| Folder / file | Size (px) | What the photo should show |
|---|---|---|
| `hero/hero-1.jpg` | 1920 x 720 | Garhwal or Kumaon Himalayas, valley or town view |
| `hero/hero-2.jpg` | 1920 x 720 | Students walking or sitting on a college campus |
| `hero/hero-3.jpg` | 1920 x 720 | Admission counselling desk, form filling, or an exam hall |
| `hero/hero-4.jpg` | 1920 x 720 | A heritage college building in Dehradun (for example FRI) |
| `about/about.jpg` | 1200 x 800 | Students studying together |
| `colleges/doon-university.jpg` | 1600 x 600 | Doon University campus |
| `colleges/gbpiet.jpg` | 1600 x 600 | GB Pant Institute of Engineering and Technology campus |
| `colleges/aiims-rishikesh.jpg` | 1600 x 600 | AIIMS Rishikesh campus |
| `colleges/uktech.jpg` | 1600 x 600 | Uttarakhand Technical University campus |
| `colleges/kumaun-university.jpg` | 1600 x 600 | Kumaun University campus |
| `colleges/uou-haldwani.jpg` | 1600 x 600 | Uttarakhand Open University campus |

## Optional

`colleges/<college-id>.jpg` (1600 x 600) for any other college. The id is the college's `id` in
`src/data/colleges.ts`, for example `colleges/geu.jpg`. A banner is also used if the college has an `imageUrl`.

## Photo guidelines

- Landscape orientation. Keep the left third of hero photos fairly plain, because the headline sits there.
- Compress each file to 300 KB or less (squoosh.app is free). Use JPG.
- Use photos you have the right to use: your own, the college's own press photos (with permission),
  or free-licence sources such as Unsplash, Pexels or Wikimedia Commons. Keep a note of each source and licence.
- Do not use photos of identifiable students without their permission.
- Do not use the national flag, state emblem or any government logo. AdmitFlow is an independent portal.
