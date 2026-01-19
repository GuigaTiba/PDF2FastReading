# PDF2FastReading

RSVP (Rapid Serial Visual Presentation) speed reading application that converts PDFs into a fast-reading format with one word displayed at a time, with the optimal recognition point (ORP) highlighted in red.

## Features

- Upload PDF files via drag-and-drop or file picker
- RSVP reading with ORP (Optimal Recognition Point) highlighting
- Adjustable reading speed (100-1000 WPM)
- Progress tracking with seekable progress bar
- Keyboard shortcuts for hands-free control
- Auto-hiding controls during playback
- Dark theme optimized for reading

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 18.x or higher recommended)
  - Download from [https://nodejs.org/](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (comes with Node.js) or **yarn**
  - Verify npm: `npm --version`

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/GuigaTiba/PDF2FastReading.git
cd PDF2FastReading
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### Step 3: Copy PDF.js Worker File

The application requires the PDF.js worker file to parse PDFs. Copy it from node_modules to the public folder:

**Windows (PowerShell):**
```powershell
Copy-Item "node_modules/pdfjs-dist/build/pdf.worker.min.mjs" -Destination "public/"
```

**Windows (Command Prompt):**
```cmd
copy node_modules\pdfjs-dist\build\pdf.worker.min.mjs public\
```

**macOS/Linux:**
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

> **Note:** If the `public` folder doesn't exist, create it first:
> ```bash
> mkdir public
> ```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Usage

### Getting Started

1. Open the application in your browser
2. Upload a PDF file by:
   - Dragging and dropping a PDF onto the upload zone, or
   - Clicking the upload zone to open the file picker
3. Wait for the PDF to be processed
4. Click **Play** or press **Space** to start reading

### Controls

- **Play/Pause** - Start or pause the RSVP reader
- **Skip Back** - Go back 10 words
- **Skip Forward** - Go forward 10 words
- **WPM Slider** - Adjust reading speed (100-1000 words per minute)
- **Restart** - Return to the beginning of the document
- **Progress Bar** - Click anywhere to seek to that position

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause |
| `Arrow Left` | Skip back 10 words |
| `Arrow Right` | Skip forward 10 words |
| `Arrow Up` | Increase speed (+25 WPM) |
| `Arrow Down` | Decrease speed (-25 WPM) |
| `R` | Restart from beginning |
| `Escape` | Return to upload screen |

### Reading Tips

- Start with a lower WPM (200-300) and gradually increase as you get comfortable
- The red letter indicates the Optimal Recognition Point (ORP) - focus your eyes there
- Use keyboard shortcuts for a hands-free reading experience
- Controls auto-hide after 2 seconds during playback - move your mouse to reveal them

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **PDF.js** - PDF parsing
- **Lucide React** - Icons

## Project Structure

```
PDF2FastReading/
├── public/
│   └── pdf.worker.min.mjs    # PDF.js worker (copy after install)
├── src/
│   ├── components/
│   │   ├── UploadZone.tsx    # PDF upload drag-and-drop
│   │   ├── RSVPDisplay.tsx   # Main word display with ORP
│   │   ├── ControlPanel.tsx  # Play/pause/speed controls
│   │   └── ProgressBar.tsx   # Reading progress indicator
│   ├── hooks/
│   │   ├── useRSVPReader.ts  # Core reading logic
│   │   └── useKeyboardShortcuts.ts
│   ├── utils/
│   │   ├── orpCalculator.ts  # ORP index calculation
│   │   └── pdfParser.ts      # PDF.js integration
│   ├── types/
│   │   └── reader.ts         # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Troubleshooting

### PDF not loading

- Ensure the `pdf.worker.min.mjs` file exists in the `public/` folder
- Check browser console for errors
- Some PDFs with unusual encoding may not parse correctly

### Slow performance

- Very large PDFs may take time to process
- Try reducing the WPM if words are flickering

### Controls not responding

- Click inside the application window to ensure it has focus
- Keyboard shortcuts only work when a PDF is loaded

## License

ISC License - see [LICENSE](LICENSE) for details.
