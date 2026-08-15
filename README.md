# Marcos's Calculator

A responsive, offline-capable machinist calculator for threads, inspection, bolt circles, machine-aware speeds and feeds, and advanced setup math.

## Overview

Marcos's Calculator is a lightweight shop utility. It is designed to open fast, work well on desktop and mobile browsers, and make common machining calculations easier to read and faster to enter. The app installs to your phone or desktop as a Progressive Web App and works fully offline after the first load — useful on a shop floor with no WiFi.

The app includes tools for:

- Thread spec parsing, tap drill estimates, and reverse thread identification
- Measurement over wires for 60 degree threads
- Bolt circle coordinate generation with hole-to-hole chord distance and optional G-code output
- Right-triangle and offset solving
- Speeds & feeds calculation with material and tool-type presets
- Chamfer depth and three-point circle solving
- Tapping feed, thread milling, reamer allowance, sine bars, tapers, ball-nose scallops, and tolerance stacks
- Reusable machine, tool, material, and job/setup profiles stored on the device

## Highlights

- Static app with no build step or production dependencies
- Shared, testable calculation core in `calc-core.js`
- Installable as a PWA — works offline after first load
- Responsive layout for desktop and mobile
- Self-hosted IBM Plex Sans and Roboto Slab typography for consistent offline rendering
- Dark and light themes (auto-matches system preference on first visit)
- Sticky top navigation on larger screens
- One-tool mobile workflow with a compact calculator picker, 44px touch targets, and collapsible result details
- Focus mode or Multi-panel layout toggle on desktop — see one tool at a time or all of them side by side
- Multi-panel scroll-spy — the active nav item follows whichever card is under your gaze
- Live auto-calculate mode — recompute on every input change
- Keyboard shortcuts: `1`–`8` switch tools; `Ctrl`/`Cmd`+`K` focuses the thread quick-spec input; Enter calculates
- Copy buttons for key outputs
- Share button uses the Web Share API on mobile (native share sheet) and falls back to clipboard on desktop
- Calculation history remembers the last five results per tool
- Lenient thread input — `1/4-20`, `1/4-20 UNC`, `M8x1.25`, `#10-32`, `10-32`, and `M10` (default coarse pitch) all parse
- Nearest stock drill suggestions plus **ANSI B94.11M and ISO 2306 standard tap-drill tables** when the size is recognized
- ASME B1.1 2A/2B/3A/3B tolerance envelope estimate for identified Unified threads
- Radial chip-thinning compensation in Speeds & Feeds for light radial engagements
- Active-machine RPM/feed ceilings with clear requested-versus-limited output
- Compact Speeds & Feeds workflow with automatic-default summaries, inline units, and optional overrides grouped behind progressive disclosure
- Explicit tap-drill method selection: standards table or selected percent thread
- Decimal, simple-fraction, mixed-fraction, and unit-suffixed dimensional inputs where applicable
- Measurement Over Wires supports external bolt threads and internal plug-gauge (between-wires) readings
- Controller/work-offset-aware G-code output for bolt-circle patterns, required preflight acknowledgment, unit conversion, safe retracts, plus **CSV and DXF export**
- Calculation provenance cards distinguish deterministic geometry from shop starting points and machine-use templates
- Tabbed Shop workspace for machine, tool, material, job, and status management, plus JSON export/import for backup or transfer
- PWA update toast with a reload button when a new deploy is detected
- App shortcuts: long-press / right-click the installed icon to jump straight into Feeds, Bolt Circle, Thread, or Right Triangle
- Global unit default — on first visit every card seeds to your locale's preferred system (en-US → inches, everywhere else → millimeters)
- Print button on every result panel
- In-page test harness at `tests.html` with 45 assertions plus a dependency-free Node test suite and GitHub Actions quality gate

## Included Calculators

### Thread Spec Helper + Tap Drill

Use this tool to:

- Parse common Unified, metric, and machine screw thread formats
- Calculate thread pitch
- Estimate tap drill size using a percentage-of-thread rule of thumb
- Identify the standard thread name from a raw major diameter and TPI or pitch
- Show a basic pitch diameter and internal minor diameter estimate
- Find the nearest standard drill in inch or metric series

Quick-pick chips cover:

- **Common inch** — `1/4-20`, `1/4-28`, `5/16-18`, `5/16-24`, `3/8-16`, `3/8-24`, `1/2-13`
- **Machine screws** — `#4-40`, `#6-32`, `#8-32`, `#10-24`, `#10-32`
- **Common metric** — `M4x0.7`, `M5x0.8`, `M6x1`, `M8x1.25`, `M10x1.5`, `M12x1.75`

Manual input examples:

- `1/4-20`
- `3/8-16`
- `M8x1.25`
- `M60x2`
- `#10-32`

**Reverse thread lookup** — Enter any major diameter and TPI or pitch and the app will identify the matching standard thread name if one exists. For example, entering `0.500` and `13` TPI shows `1/2-13 UNC` in the result.

Notes:

- Tap drill output is intended as a practical shop estimate
- Basic pitch diameter values shown by the app do not include class-of-fit tolerances
- Percent thread can be set to 60, 65, 70, 75, or 80 percent using the segmented control
- The tap-drill method is explicit: choose the standards table when available or calculate from the selected thread percentage. Recognized sizes show both for comparison.

### Measurement Over Wires

Use this tool to:

- Solve `M` from pitch diameter `E`
- Solve `E` from measurement over wires `M`
- Suggest a best wire size from pitch
- Snap to the nearest wire in inch or metric wire sets

This calculator is intended for standard 60 degree thread measurement workflows.

### Bolt Circle Coordinates

Use this tool to:

- Generate evenly spaced XY coordinates on a bolt circle
- Select inch or metric units
- Set number of holes
- Set start angle
- Choose clockwise or counter-clockwise layout
- Apply a center X/Y offset from the origin
- Copy the full coordinate list for setup sheets or CNC notes
- Optionally emit a controller/work-offset-aware G-code template after preflight acknowledgment

Results include:

- All XY coordinates in a copyable table
- **Chord (hole-to-hole)** — straight-line distance between adjacent holes, useful for verifying a pattern with a caliper or setting up a dividing head
- A visual SVG preview of the bolt pattern

**G-code output** — tick **Also output G-code block** to reveal controller, work offset, safe Z, depth, retract, feed, spindle, coolant, and peck fields. Three modes are available:

- **Positions only** — `G0` rapid to each hole
- **Drill cycle (G81)** — standard peck-free drilling canned cycle
- **Peck drill (G83)** — pecking canned cycle with `Q` increment

Program units can be set to `G20` (inches), `G21` (mm), or matched to the input units automatically; coordinates and motion values are converted consistently. The app will not generate the block until units, work offset/zero, and motion/tool clearance have each been acknowledged. Output remains a template: simulate, single-block, and dry-run above the part before machine use.

### Right Triangle

Use this tool to solve setup geometry from:

- Run and rise
- Hypotenuse and angle
- Run and angle
- Rise and angle

Outputs include:

- Run
- Rise
- Hypotenuse
- Angle
- Slope

### Speeds & Feeds

Use this tool to get starting-point spindle RPM, feed rate, and material removal rate for milling, drilling, and reaming operations.

Inputs:

- Units (inches with SFM / IPM, or millimeters with SMM / mm/min)
- Tool type — HSS, Carbide, or Coated carbide (TiAlN)
- Material — Aluminum (6061), Brass / Bronze, Mild steel (1018), Alloy steel (4140), Stainless (304/316), Tool steel (hardened), Cast iron, Titanium, Plastic, or Custom
- Tool diameter and flute count
- Optional surface speed override (SFM or SMM)
- Optional chip load per tooth override
- Optional width of cut (WOC) and depth of cut (DOC) for material removal rate
- Optional saved tool and material-library records
- Active machine profile with maximum spindle RPM and feed rate

Outputs:

- Spindle RPM
- Feed rate in IPM or mm/min
- Surface speed used (after any override)
- Chip load per tooth used (auto-scaled by tool diameter)
- Material removal rate (MRR) when WOC and DOC are both supplied
- Requested values and applied machine ceilings whenever a result is limited
- A formula snapshot and note lines describing which defaults or overrides were applied

**Operation presets** — quick chips populate WOC and DOC for common cuts:

- **Slotting** — full-width slot at 50% of diameter depth
- **Profiling** — 30% radial engagement at full diameter depth
- **Finishing** — 10% radial engagement at 50% of diameter depth
- **Drilling (peck)** — full-diameter engagement and drilling-specific speed/chip factors

Notes:

- Material and tool-type defaults are conservative shop starting points, not tool-maker data
- Chip load is scaled by tool diameter against a 3/8 in reference (clamped between 0.25× and 1.5×) so small-diameter cutters get sensibly smaller per-tooth loads
- Custom material requires explicit surface speed and chip load

### Chamfer and Circle Geometry

- **Chamfer / Countersink Depth** solves axial depth from the small diameter, large diameter, and included angle.
- **Circle Through 3 Points** returns center, radius, and diameter and rejects collinear points.

### Advanced Shop Math

The Advanced picker includes:

- Synchronized tapping feed from RPM and TPI/pitch
- Internal thread-mill centerline feed compensation
- Pre-ream hole size from allowance per side
- Sine-bar stack height or inverse angle
- Taper half-angle, included angle, and taper rate
- Ball-nose scallop height or inverse stepover
- Worst-case and RSS tolerance stacks with signed nominal contributions

### Shop Workspace

Open **Shop setup** to save machine profiles, reusable tools, custom materials, and current job setups. Machine profiles carry preferred units, maximum RPM/feed, controller, work offset, and safe Z. Job setups snapshot every calculator form, including tolerance-stack rows. Workspace data stays in browser storage and can be exported/imported as JSON.

## Desktop View Modes

The header includes a **Multi-panel / Focus** toggle on larger screens:

- **Focus mode** (default) — shows one tool at a time with smooth view transitions between tools.
- **Multi-panel mode** — shows every tool card at once in a 12-column grid, using the full width of wide monitors. Ideal for a shop workstation where you want threads, bolt circles, and feeds visible together.

The choice is saved in `localStorage` and re-applied on every visit. On mobile, the desktop tabs and view toggle are replaced with one compact calculator picker; only the selected tool is rendered.

## Auto-Calculate (Live) Mode

Turn on the **Live** switch in the header to recalculate every tool automatically as you type. A short debounce (~250 ms) keeps the UI responsive while still updating results almost immediately. Validation warnings are suppressed in live mode so the last good result stays visible while you finish typing an incomplete value.

The preference is saved in `localStorage` and persists across reloads.

## Keyboard Shortcuts

- `1` — Thread Spec Helper + Tap Drill
- `2` — Measurement Over Wires
- `3` — Bolt Circle Coordinates
- `4` — Right Triangle
- `5` — Speeds & Feeds
- `6` — Chamfer / Countersink Depth
- `7` — Circle Through 3 Points
- `8` — Advanced Shop Math
- `Ctrl` / `Cmd` + `K` — Jump to Thread tool and focus the quick-spec input
- `Enter` — Calculate (from any input field)

Number shortcuts are ignored while typing in form controls so they never fight with normal text entry.

## Calculation History

Every tool keeps a rolling list of the last five results. After any calculation, a collapsible **Recent** panel appears below the result. Clicking any entry restores the form values and recalculates immediately — useful when running the same thread spec or bolt pattern several times in a session.

History is stored in the browser using `localStorage` and persists across page reloads.

## Shareable URLs

After any calculation, a **Share** button appears next to the Copy button. Clicking it encodes the active tool and all current form values into the page URL hash. On mobile and any browser that supports the Web Share API, this opens the native share sheet so you can send the link via Messages, email, Slack, or any installed app. On desktop browsers without Web Share, the link is copied to the clipboard instead. Opening the URL on any device restores the tool, fills in all the values, and runs the calculation automatically.

This is useful for:

- Shift handoffs — send a link with all the parameters already filled in
- Documenting a setup — paste the URL into a work order or notes file
- Double-checking work on a second device

## PWA / Offline Support

Marcos's Calculator can be installed as a Progressive Web App on any device that supports it.

- On Android: tap the browser menu and select **Add to Home Screen** or **Install App**
- On iOS Safari: tap the Share button and select **Add to Home Screen**
- On desktop Chrome or Edge: look for the install icon in the address bar

After the first load, the app caches itself and works fully without a network connection. This is intentional — shop floors are often WiFi dead zones.

The service worker uses network-first navigation with an exact-page cache and offline app fallback. Static assets use stale-while-revalidate. The header reports connection state, and Shop setup reports the active core/offline-cache version.

## Project Structure

```text
project-root/
├── .github/workflows/quality.yml
├── .nojekyll
├── calc-core.js
├── core.test.mjs
├── favicon.png
├── index.html
├── manifest.json
├── package.json
├── pages.test.mjs
├── serve.mjs
├── sw.js
├── tests.html
└── README.md
```

### File Notes

- `favicon.png`
  - Logo asset used for the browser favicon, touch icon, social preview image, and visible header branding
- `index.html`
  - Application structure, styling, and browser integration
- `calc-core.js`
  - Shared pure calculation/parsing/formatting functions used by the app and tests
- `core.test.mjs`
  - Dependency-free Node test suite
- `pages.test.mjs`
  - GitHub Pages compatibility checks for relative assets, manifest scope, and service-worker precaching
- `tests.html`
  - In-browser calculation harness
- `serve.mjs`
  - Small local static server used by `npm run serve`
- `manifest.json`
  - Web App Manifest for PWA installation (name, icons, theme color, display mode)
- `sw.js`
  - Service worker — handles offline caching with stale-while-revalidate
- `README.md`
  - Project documentation

## Getting Started

No production install or build is required. The app uses a JavaScript module, so serve the folder over HTTP instead of opening `index.html` with a `file://` URL.

### Recommended local workflow

With Node.js installed:

```powershell
npm run serve
```

Then open `http://127.0.0.1:4173/`.

To reproduce the production GitHub Pages subpath locally:

```powershell
npm run serve:pages
```

Then open `http://127.0.0.1:4173/Machinist_calc/`.

Run the automated checks with:

```powershell
npm test
```

### Alternative local server

Example:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Hosting the App

Because Marcos's Calculator is a static application, hosting is straightforward. There is no backend, database, or build step required.

In practice, there are two main ways to host it:

- Run it locally for testing
- Serve it from a web server for network or public access

### Local Hosting for Testing

#### Windows

1. Open PowerShell or Command Prompt.
2. Change into the project folder:

```powershell
cd "C:\path\to\project"
```

3. Start a simple local server:

```powershell
python -m http.server 8000
```

4. Open your browser and visit:

```text
http://localhost:8000/
```

Notes:

- If the main file is named `index.html`, it loads automatically at the root URL
- If Python is not installed, install it from [python.org](https://www.python.org/downloads/)

#### Linux

1. Open a terminal.
2. Change into the project folder:

```bash
cd /path/to/project
```

3. Start a local server:

```bash
python3 -m http.server 8000
```

4. Open your browser and visit:

```text
http://localhost:8000/
```

If Python 3 is not installed:

```bash
sudo apt update
sudo apt install python3
```

### Hosting on a Real Web Server

If you want the app available on your local network or the public internet, place all project files in a static web root and serve them with a web server. The service worker and manifest must be served over HTTPS (or `localhost`) for PWA install and offline features to work.

#### Windows with IIS

1. Enable IIS via `Control Panel > Programs and Features > Turn Windows features on or off > Internet Information Services`.
2. Copy all project files into the IIS web root:

```text
C:\inetpub\wwwroot\
```

3. Open:

```text
http://localhost/
```

For network or public hosting:

- Allow port `80` (and `443` for HTTPS) through Windows Firewall
- Configure router port forwarding if needed
- Point your domain to the server IP if using a custom domain

#### Linux with Nginx

1. Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

2. Copy all project files into the default web root:

```bash
sudo cp index.html calc-core.js manifest.json sw.js favicon.png tests.html /var/www/html/
```

3. Reload Nginx:

```bash
sudo systemctl reload nginx
```

4. Open:

```text
http://your-server-ip/
```

#### Linux with Apache

1. Install Apache:

```bash
sudo apt update
sudo apt install apache2
```

2. Copy all project files into the default web root:

```bash
sudo cp index.html calc-core.js manifest.json sw.js favicon.png tests.html /var/www/html/
```

3. Restart Apache:

```bash
sudo systemctl restart apache2
```

4. Open:

```text
http://your-server-ip/
```

### Static Hosting Services

For public deployment, static hosting platforms are often the easiest long-term choice. All of these support HTTPS out of the box, which enables full PWA install and offline support.

Good options include:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

Typical deployment flow:

1. Place all project files in the repository root
2. Push the repository to GitHub
3. Connect the repository to the hosting provider
4. Deploy the project

### Current GitHub Pages deployment

This repository is compatible with its current GitHub Pages configuration:

- Source: `main` branch, repository root
- Production URL: `https://ianarsenault-tn.github.io/Machinist_calc/`
- Build step: none
- HTTPS: enabled

All application assets, module imports, manifest URLs, shortcuts, and service-worker cache entries are repository-relative, so they remain inside `/Machinist_calc/`. The root `.nojekyll` file makes GitHub Pages publish the static files without Jekyll processing. `npm test` includes an automated contract test for these requirements.

### Hosting Notes

- Keep the main file named `index.html` so it loads at the root URL automatically
- The service worker (`sw.js`) and manifest (`manifest.json`) must be in the same directory as `index.html`
- No backend runtime is required for production hosting
- Theme, forms, histories, machine/tool/material libraries, and jobs are stored in the browser using `localStorage`
- If you later split the project into multiple files, make sure relative paths remain correct

## Usage Tips

- Use the top navigation, number keys `1`–`8`, or `Ctrl`/`Cmd`+`K` to jump between tools quickly
- On a wide monitor, flip the view toggle to **Multi-panel** to see every calculator at once
- Turn on **Live** mode to see results update in real time as you tune a value
- On mobile, choose one calculator from the compact picker; tap a populated result header to expand/collapse its details
- Tap any chip button (including machine screw sizes and operation presets) to load values and calculate in one tap
- Use the **Recent** panel to rerun a previous setup without re-entering values
- Use the **Share** button to send a link for shift handoffs or setup documentation — on mobile this opens the native share sheet
- Use the copy buttons to move values into setup sheets, notes, or programs
- For a bolt-circle program, complete the three preflight acknowledgments, then still simulate and dry-run the generated template
- Install the app to your home screen for instant one-tap access offline
- Switch between dark and light mode depending on your work environment

## Technical Notes

The application is built with:

- Semantic HTML forms with accessible tool headings and ARIA expand/collapse attributes
- Responsive CSS with custom property theming and CSS `:has()` progressive enhancement
- Vanilla JavaScript browser integration with a shared ES-module calculation core
- Web Share API with clipboard fallback
- View Transitions API for smooth tool-switch animations when supported
- Clipboard copy support with fallback for older browsers
- Progressive Web App manifest and service worker for install and offline use
- URL hash encoding for shareable calculation links
- `localStorage` for preferences, forms, calculation history, and Shop workspace records — all writes are wrapped in `try`/`catch` for Safari private-mode safety
- Favicon and social preview metadata

No frameworks, build tools, production packages, or external runtime services are required. Node/npm is used only for the local server and automated test command.

## Design Goals

This project aims to be:

- Fast to load
- Easy to understand
- Useful in a real shop setting
- Comfortable to use on a phone near a machine
- Easy to maintain without a build pipeline
- Available offline on the shop floor

## Limitations

- The calculators are intended as practical helpers, not certified engineering references
- Tap drill and pitch diameter outputs are estimates where noted
- Measurement over wires logic is currently aimed at 60 degree threads
- Reverse thread lookup matches against a fixed table of common standard sizes; non-standard or obscure pitches may not be identified
- Speeds & feeds defaults are conservative shop starting points and should always be sanity-checked against tool-maker data
- Bolt-circle G-code is a controller-aware template, not a verified machine program; preflight, simulation, single-block, and a dry run remain mandatory
- PWA install and offline features require the app to be served over HTTPS or `localhost`

## Customization

Because the app is contained in a small set of files, it is easy to customize.

Common changes include:

- Branding text
- Theme colors
- Typography
- Default units
- Additional thread presets or chip buttons
- New entries in the machine screw or thread lookup tables
- New calculator sections

The main parts to edit are:

- HTML structure for tool sections
- CSS theme tokens and layout rules
- Browser integration in `index.html` and pure math/result formatting in `calc-core.js`
- `MACHINE_SCREW_DIAMETERS` and coarse metric pitch defaults in `calc-core.js`, plus standard thread/drill tables in `index.html`
- `SF_DEFAULTS`, `MATERIAL_LABELS`, and `TOOL_LABELS` constants for speeds & feeds defaults and labels

## Contributing

If you extend the project:

- Keep the app fast and self-contained
- Prefer readable inputs and clear outputs
- Preserve mobile usability
- Avoid unnecessary dependencies unless they add clear practical value
- Test that the service worker cache version (`CACHE` constant in `sw.js`) is bumped when making changes that should force a cache refresh

## License

This project is licensed under the `MIT` License.
