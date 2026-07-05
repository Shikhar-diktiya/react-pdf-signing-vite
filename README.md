# React PDF Signing App (Vite + TypeScript)

A modern, responsive, client-side web application designed to render PDF documents, create signatures (by drawing, typing, or image upload), drag-and-drop signatures onto document pages, position them precisely, and export the signed PDF.

## 🚀 Features

- **Robust PDF Loading**: Supports uploading and rendering any PDF document locally in the browser using `pdfjs-dist`.
- **Signature Creation Modal**: Three modes of signature generation:
  - **Draw**: Freehand drawing using a canvas.
  - **Type**: Styled text input simulating handwriting.
  - **Upload**: Uploading pre-captured signature images.
- **Drag-and-Drop Placement**: Drag signature templates from the sidebar and place them directly onto the PDF document.
- **Precision Pointer-Events Dragging**: Seamless repositioning of placed signatures across pages with mouse or touch gestures (using unified Pointer Events).
- **Accurate Coordinate Mapping**: Automatically translates container CSS coordinates to original PDF page coordinates based on canvas offsets and scaling factors.
- **Client-Side Compilation**: Injects signature images directly into the PDF structure on the client side using `pdf-lib` and triggers an automatic download.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build System**: Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Vanilla CSS
- **PDF Core**: `pdfjs-dist` (for rendering) and `pdf-lib` (for editing and exporting)
- **Signature Input**: `react-signature-canvas`
- **Icons**: `lucide-react`

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd react-pdf-signing-vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173/react-pdf-signing-vite/` in your browser.

### Production Build

Compile and bundle the project for production:
```bash
npm run build
```
Build outputs will be generated in the `docs` folder.
