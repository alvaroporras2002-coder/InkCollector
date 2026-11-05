# Ink Collector

Phone-only interactive tattoo discovery demo for Costa Rica. Original fictional artist portraits and tattoo portfolio images, ivory/black/violet identity, animated ink background and five-icon glass navigation.

## Run

Serve this directory with a static HTTP server, for example `python3 -m http.server 8080`, then open `http://localhost:8080`. No installation, API keys or paid services required.

## Use

- Explore artists by style, province and availability.
- Save and compare artists. Open a profile from its portfolio image.
- Use the central + action to choose an artist and create a quote request in four steps. Text drafts stay on the device; reference images are not stored in drafts.
- Open **Mi perfil → Mis solicitudes y citas** to review your demo requests.
- Open **Mi estudio** to simulate contact, quotes and appointments. Appointments use sample slots with collision detection.
- Test artist registration and approval in the demo administration view.
- Toggle **Animaciones suaves** in the profile menu. The device's reduced-motion setting always takes priority.

## Publish with GitHub Pages

The `gh-pages` branch contains the app at its root. In this repository, open **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, select **gh-pages** and **/(root)**, then save. The expected project address is `https://alvaroporras2002-coder.github.io/InkCollector/`; the address is live only after GitHub confirms a successful deployment.

This repository contains the app only, with relative asset paths suitable for project Pages. `.nojekyll` skips Jekyll processing. A `404.html` fallback loads the same app shell.

## Validation

Run `node --test tests/*.test.cjs`. JavaScript has no runtime dependencies. Browser/device visual validation was not available in the build environment.

## Demo limits

Artists, artwork, amounts and availability are illustrative. Data is stored in `localStorage` in the current browser, using `inkcollector.demo.v1`. Drafts use `inkcollector.draft.<artist-id>`. Animation preference uses `inkcollector.motion`. There is no shared database, account authentication, message delivery or payment processing. Use fictitious customer information. Moving between hosting domains does not transfer browser-local records.

Generated with [Codex](https://openai.com/codex/).
