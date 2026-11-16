# Raja's Martial Arts & Fitness Gym — Website

A one-page static website: plain HTML, CSS and JS. There's no build step and nothing to install.

## Preview
Double-click `index.html`, or run `npx serve .` in this folder.

## Things to fill in (all marked `TODO`)

| What | Where |
|---|---|
| WhatsApp number, phone, address, map pin, social links | `assets/js/config.js` (the only file you need for contact details) |
| Instructor names, ranks, bios | `index.html` → `#instructors` section |
| Class timetable | `index.html` → `#schedule` section |
| Photos | `assets/img/` (see below) |

## Photos
Every grey hatched box shows the filename it's waiting for. Save a photo with that exact
name into `assets/img/` and it appears automatically. You don't need to edit any code.

| File | Suggested size |
|---|---|
| `hero.jpg` | 1600 × 700 |
| `program-kids.jpg`, `program-teens.jpg`, `program-adults.jpg`, `program-fitness.jpg` | 1200 × 675 |
| `instructor-1.jpg` … `instructor-3.jpg` | 800 × 1000 (portrait) |
| `gallery-1.jpg` … `gallery-6.jpg` | 1200 × 900 |
| `og-cover.jpg` (link preview on WhatsApp/Facebook) | 1200 × 630 |

Keep each JPG under about 300 KB.

## Deploy on Netlify
1. Netlify → Add new site → Import from Git → pick this repo.
2. **Base directory:** `rajamartialarts`. Leave the build command empty. **Publish directory:** `rajamartialarts`.
3. Deploy. The join form's submissions appear under **Forms → join** in Netlify.

Alternatively, drag the `rajamartialarts` folder onto app.netlify.com/drop.
