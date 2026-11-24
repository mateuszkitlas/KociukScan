# KociukScan

A desktop app for scanning books on a flatbed scanner and turning the scans into a
clean PDF. Built with Electron, React and TypeScript. Scanning goes through
[scanner-to-buffer](https://github.com/mateuszkitlas/scanner-to-buffer), image
processing through [sharp](https://sharp.pixelplumbing.com/) and PDF output through
[PDFKit](https://pdfkit.org/).

## Features

- **Scan** one page, or **scan many** in a loop with a beep and a configurable pause
  between pages, so you can turn the page while it waits.
- **Import** existing page images (PNG, JPEG, …) by dropping them into the app.
- **Straighten** each page by rotating it in 0.25º/0.5º steps, or by 90º/180º.
- **Crop** with one frame size for the whole book. You move the frame on each page,
  and a page without its own position inherits it from the page two before, so left
  and right pages line up.
- **Contrast** correction for the whole book.
- **Duplicate**, **delete** and **re-scan** single pages.
- **Export** to PDF, with progress and the time left.

The project (page list, crop and rotation) is saved automatically and restored on the
next start.

## Requirements

- Node.js and npm (tested with Node 25)
- A scanner supported by scanner-to-buffer:
  - Linux: SANE (`scanimage` must find your scanner)
  - Windows: WIA
  - macOS: see the scanner-to-buffer README

## Getting started

```bash
npm ci
npm run build
npm start
```

During development, run `npm run watch` in one terminal and `npm start` in another.
Restart the app to pick up backend changes. Lint with `npm run eslint`.

Scanned pages and the project file (`book.json`) are stored in `dist/tmp/`.

## Usage

1. Open **Settings** (gear icon): click **Detect** to choose a scanner, and set the DPI.
2. Scan pages with the camera icon (one page) or the play icon (many pages). The
   number next to it is the pause between pages in seconds. Stop with the stop icon.
3. Click a page on the left. Drag the crop frame into place, tick **resize** to change
   its size, and straighten the page with the rotate buttons or the arrow keys.
4. Click the PDF icon to export.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `←` / `→` | rotate the current page by 0.25º |
| `↑` / `↓` | previous / next page |
| `Shift` + arrows | move the crop frame |
| `Shift` + `Ctrl` + arrows | move the crop frame faster |
| `D` | duplicate the current page |
| `Delete` | delete the current page |

## Project layout

```
src/backend   Electron main process: scanning, image processing, PDF export
src/frontend  React UI (runs in the renderer)
src/native    types and helpers shared by both sides
static        HTML, CSS, icons and the font PDFKit needs
```
