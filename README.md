# Frame in Goa

## Hacker House Goa 2026 — Open Trial 1

This repository is the **BodhiX** team submission for the first Hacker House Goa 2026 screening task, **Build a Frame / ID Card**.

Hacker House Goa uses rolling, skill-based screening tasks during the August Open Trials. Each builder submits individually, and every member of a team must clear the task for the team to be selected. This task is intended to demonstrate shipped product quality, clear thinking, and the ability to turn a brief into a working experience.

### Task goal

Build a fast, mobile-friendly web tool that turns a user's photo into a branded HH Goa 2026 graphic ready to download and share on X. The result should be generated in one pass, without login or signup, and should work with real-world photos and different aspect ratios.

The brief allows either or both of these formats:

- **PFP frame / overlay:** the uploaded photo remains front and center while an HH Goa frame wraps around it.
- **Builder ID card:** the uploaded photo is combined with the builder's name, role or stack, and a generated builder title in an event-badge style graphic.

The finished experience must provide a real downloadable image and a working X share flow with a prefilled caption containing `#FrameInGoa`. The visual should feel distinctly HH Goa rather than like a generic badge with a logo added.

### Task 1 submission

[Submit Task 1](https://docs.google.com/forms/d/e/1FAIpQLSdayCHrUcqnBeFD9nYe2fOXgujV_BUvYQ0hsge8oRbeL2mj4w/viewform)

Remember: the task brief requires an X post containing `#FrameInGoa`; submissions without that hashtag are treated as invalid. The deadline in the brief is **11:59 pm, 13 August 2026**.

## What BodhiX built

The current implementation is a Next.js app that turns a photo and builder details into a branded HH Goa identity graphic. It is designed as a fast, no-login flow that works on desktop and mobile.

### Features

- Solo builder and team modes, with up to five builders
- Builder name and team name inputs
- Photo upload with JPG, PNG, WebP, and HEIC/HEIF conversion support
- Portrait positioning and zoom controls for different photo aspect ratios
- Role selection and generated builder titles
- Two output formats: square profile picture and vertical social post
- Live preview with editable builder details and X caption
- Downloadable 1200px PNG output
- HH Goa-inspired visual system with editorial typography, tropical accents, Goa artwork, and `#FrameInGoa` branding
- Native file sharing on supported mobile browsers
- Prefilled X composer with the required `#FrameInGoa` hashtag
- BodhiX team branding across the header, hero, footer, and Task 1 identity

### Local development

The application lives in [`frame-in-goa/`](frame-in-goa/).

```bash
cd frame-in-goa
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the production build with:

```bash
npm run build
```

### Sharing and deployment status

On supported mobile browsers, the generated PNG is passed to the native share sheet so it can be selected in X with the caption. On desktop browsers, X can be opened with prefilled text, but browser security prevents a local file from being attached automatically; the downloaded PNG must be added manually.

The app is deployed on Vercel: **[Open the live Frame in Goa app](https://frame-in-goa-opal.vercel.app)**.

A live deployment is required by the screening brief before submitting Task 1. Vercel is the free deployment target for this Next.js app.

### Project pull request

The current implementation was consolidated in [PR #3](https://github.com/SIMRAN719/frame-in-goa/pull/3), which has been merged into `main`.

## Team

This Task 1 submission is built by **BodhiX**.
