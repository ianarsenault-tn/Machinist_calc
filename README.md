# Marcos's Calculator

A responsive browser-based machinist calculator for threads, tap drills, measurement over wires, bolt circle coordinates, and right-triangle setup math.

## Overview

Marcos's Calculator is a lightweight shop utility built as a single HTML file. It is designed to open fast, work well on desktop and mobile browsers, and make common machining calculations easier to read and faster to enter.

The app includes tools for:

- Thread spec parsing and tap drill estimates
- Measurement over wires for 60 degree threads
- Bolt circle coordinate generation
- Right-triangle and offset solving

## Highlights

- Single-file app with no build step
- Responsive layout for desktop and mobile
- Dark and light themes
- Sticky top navigation on larger screens
- Accordion-style sections on smaller screens
- Keyboard-friendly forms with Enter-to-calculate behavior
- Copy buttons for key outputs
- Natural thread input like `1/4-20` and `M8x1.25`

## Included Calculators

### Thread Spec Helper + Tap Drill

Use this tool to:

- Parse common Unified and metric thread formats
- Calculate thread pitch
- Estimate tap drill size using a percentage-of-thread rule of thumb
- Show a basic pitch diameter estimate

Examples:

- `1/4-20`
- `3/8-16`
- `M8x1.25`
- `M60x2`

Notes:

- Tap drill output is intended as a practical shop estimate
- Basic pitch diameter values shown by the app do not include class-of-fit tolerances

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
- Copy the full coordinate list for setup sheets or CNC notes

### Right-Triangle / Offset Solver

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

## Project Structure

This project is intentionally simple.

```text
project-root/
├── favicon.png
├── index.html
└── README.md
```

### File Notes

- `favicon.png`
  - Logo asset used for the browser favicon, touch icon, social preview image, and visible header branding
- `index.html`
  - Current application
  - Contains the HTML, CSS, and JavaScript in one file
- `README.md`
  - Project documentation

## Getting Started

No installation is required.

### Option 1. Open directly in a browser

Open `index.html` in any modern browser.

### Option 2. Serve it locally

This is optional, but useful if you prefer testing with `http://localhost`.

Example:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Hosting the App

Because Marcos's Calculator is a static single-file application, hosting is straightforward. There is no backend, database, or build step required.

In practice, there are two main ways to host it:

- Run it locally for testing
- Serve it from a web server for network or public access

### Local Hosting for Testing

This is the fastest way to run the app with a proper local URL.

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

If you want the app available on your local network or the public internet, place `index.html` in a static web root and serve it with a web server.

#### Windows with IIS

1. Enable IIS:
   - Open `Control Panel`
   - Go to `Programs and Features`
   - Select `Turn Windows features on or off`
   - Enable `Internet Information Services`
2. Copy `index.html` into the IIS web root:

```text
C:\inetpub\wwwroot\
```

3. Replace the default landing page if needed.
4. Open:

```text
http://localhost/
```

For network or public hosting:

- Allow port `80` through Windows Firewall
- Configure router port forwarding if the site should be accessible from outside your network
- Point your domain to the server IP if using a custom domain

#### Linux with Nginx

1. Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

2. Copy the file into the default web root:

```bash
sudo cp index.html /var/www/html/index.html
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

2. Copy the file into the default web root:

```bash
sudo cp index.html /var/www/html/index.html
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

For public deployment, static hosting platforms are often the easiest long-term choice.

Good options include:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

Typical deployment flow:

1. Place `index.html` in the repository root
2. Push the repository to GitHub
3. Connect the repository to the hosting provider
4. Deploy the project

### Hosting Notes

- Keep the main file named `index.html`
- No backend runtime is required for production hosting
- Theme preference is stored in the browser using `localStorage`
- If you later split the project into multiple files, make sure relative paths remain correct

## Usage Tips

- Use the top navigation on desktop to jump between tools quickly
- On mobile, open one calculator section at a time to reduce scrolling
- Use quick thread specs whenever possible to reduce manual entry
- Use the copy buttons to move values into setup sheets, notes, or programs
- Switch between dark and light mode depending on your work environment

## Technical Notes

The application is built with:

- Semantic HTML forms
- Responsive CSS with theme tokens
- Vanilla JavaScript calculator logic
- Clipboard copy support
- Favicon and social preview metadata
- Local browser storage for theme preference

No frameworks, package managers, or external dependencies are required.

## Design Goals

This project aims to be:

- Fast to load
- Easy to understand
- Useful in a real shop setting
- Comfortable to use on a phone near a machine
- Easy to maintain without a build pipeline

## Limitations

- The calculators are intended as practical helpers, not certified engineering references
- Tap drill and pitch diameter outputs are estimates where noted
- Measurement over wires logic is currently aimed at 60 degree threads
- Theme preference is stored in the browser using `localStorage`

## Customization

Because the app is contained in a single file, it is easy to customize.

Common changes include:

- Branding text
- Theme colors
- Typography
- Default units
- Additional presets
- New calculator sections

The main parts to edit are:

- HTML structure for tool sections
- CSS theme tokens and layout rules
- JavaScript calculator logic and result formatting

## Future Improvements

Possible future additions:

- Standard drill chart suggestions
- More thread presets
- Additional thread forms and tolerance helpers
- CSV export for bolt circle coordinates
- Print-friendly setup sheet output
- Offline-friendly PWA support

## Contributing

If you extend the project:

- Keep the app fast and self-contained
- Prefer readable inputs and clear outputs
- Preserve mobile usability
- Avoid unnecessary dependencies unless they add clear practical value

## License

This project is licensed under the `MIT` License.
