# Raja's Martial Arts & Fitness — Website

A static multi-page site in plain HTML, CSS and JS. There's no build step and nothing to install.

| Page | File |
|---|---|
| Home (landing) | `index.html` |
| Biography — Shihan Raja | `biography.html` |
| Instructors | `instructors.html` |
| Courses & fees | `courses.html` |
| Syllabus | `syllabus.html` |
| Belt test | `belt-test.html` |
| Terminology | `terminology.html` |

## Preview
Double-click `index.html`, or run `npx serve .` in this folder.

## Things to fill in (search the HTML for `TODO`)

| What | Where |
|---|---|
| WhatsApp number, address, email, map pin, social links | `assets/js/config.js` (used on every page) |
| Logo | Save it as `assets/img/logo.png` (square, transparent background) |
| Shihan's story and milestone years | `biography.html` |
| Instructor names, ranks, locations, bios | `instructors.html` |
| Monthly fees (3 / 4 / 6 days) | `courses.html` → `#fees` |
| Weekly timetable | `index.html` → `#schedule` |
| Belt order and timings | `belt-test.html` |
| Branch addresses | `instructors.html` → "Different locations" |

## Photos
Every image slot without a photo shows designed artwork (red sun + kanji). The filenames are listed below and in the HTML (`data-file`).
Save a photo with that name into `assets/img/` and it appears automatically.

- **Cut-out portraits** (`shihan-hero.png`, `shihan-courses.png`, `instructor-hero.png`, `syllabus-hero.png`):
  PNG with a **transparent background**, about 900 × 1100.
- **Everything else**: JPG, under ~300 KB, with a landscape crop around 1200 px wide
  (instructor and coach photos are portrait, 800 × 1000).
- **Terminology**: one photo per technique, e.g. `stance-zenkutsu.jpg`, `kick-mae.jpg`.
  The full list of names is in `terminology.html`.
- **Videos**: put `intro.mp4`, `shihan.mp4` and `courses.mp4` in `assets/video/`.

## Deploy on Netlify
In Netlify, choose Add new site → Import from Git and pick this repo. Set the **Base directory** to `rajamartialarts`
and leave the build command empty. Trial-form sign-ups appear under **Forms → trial**.
Alternatively, drag the `rajamartialarts` folder onto app.netlify.com/drop.
