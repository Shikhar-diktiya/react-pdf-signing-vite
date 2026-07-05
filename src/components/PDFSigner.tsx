import { useRef, useState, useEffect } from "react";
import PDFSignerView from "./PDFSignerView";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import SignatureCreateModal from "./SignatureCreateModal";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const defaultPdfUrl = `${import.meta.env.BASE_URL}sample-document.pdf`;

type DroppedSignature = {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
};

type CanvasRef = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

export default function PDFSigner() {
  // States and Refs
  const [pdfUrl, setPdfUrl] = useState<string>(defaultPdfUrl);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [signatureList, setSignatureList] = useState<string[]>([]);
  const [droppedSignatures, setDroppedSignatures] = useState<DroppedSignature[]>(
    []
  );
  const [scale] = useState<number>(1.5);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);

  const canvasRefs = useRef<CanvasRef[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPdfError(null);
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise
      .then((loadedPdf: any) => {
        renderPdfPages(loadedPdf);
      })
      .catch((error: unknown) => {
        console.error("Failed to load PDF:", error);
        setPdfError("Failed to load the PDF file.");
      });
  }, [pdfUrl]);

  const renderPdfPages = async (pdf: any) => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const numPages = pdf.numPages;
    canvasRefs.current = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      canvas.classList.add("pdf-page");
      canvas.dataset.pageNumber = String(i);

      canvasRefs.current.push({
        canvas,
        width: canvas.width,
        height: canvas.height,
      });
    }

    container.innerHTML = "";
    canvasRefs.current.forEach((ref) => container.appendChild(ref.canvas));
  };

  const handleAddSignature = (signatureData: string) => {
    if (signatureData) {
      setSignatureList((prev) => [...prev, signatureData]);
    }
    setShowSignatureModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
      setDroppedSignatures([]);
    }
  };

  const applySignatureToPdf = async () => {
    const existingPdfBytes = await fetch(pdfUrl).then((res) =>
      res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    for (const sig of droppedSignatures) {
      const pageIndex = (sig.pageNumber ?? 1) - 1;

      if (pageIndex < 0 || pageIndex >= pages.length) {
        console.warn("Invalid page index", pageIndex);
        continue;
      }

      const page = pages[pageIndex];

      const canvasRef = canvasRefs.current.find(
        (ref) =>
          parseInt(ref.canvas.dataset.pageNumber || "1", 10) === sig.pageNumber
      );

      if (!canvasRef) {
        console.warn("Canvas not found for page:", sig.pageNumber);
        continue;
      }

      const pdfWidth = page.getWidth();
      const pdfHeight = page.getHeight();

      const canvasWidth = canvasRef.width;
      const canvasHeight = canvasRef.height;

      const canvasTop = canvasRef.canvas.offsetTop;
      const relativeY = sig.y - canvasTop;

      const relX = (sig.x / canvasWidth) * pdfWidth;
      const relY =
        pdfHeight -
        ((relativeY + sig.height) / canvasHeight) * pdfHeight;

      const relWidth = (sig.width / canvasWidth) * pdfWidth;
      const relHeight = (sig.height / canvasHeight) * pdfHeight;

      const imgBytes = await fetch(sig.src).then((res) => res.arrayBuffer());
      const image = await pdfDoc.embedPng(imgBytes);

      page.drawImage(image, {
        x: relX,
        y: relY,
        width: relWidth,
        height: relHeight,
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes as BlobPart], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signed.pdf";
    a.click();
  };

  return (
    <PDFSignerView
      pdfContainerRef={pdfContainerRef}
      fileInputRef={fileInputRef}
      signatureList={signatureList}
      setSignatureList={setSignatureList}
      droppedSignatures={droppedSignatures}
      setDroppedSignatures={setDroppedSignatures}
      handleFileChange={handleFileChange}
      applySignatureToPdf={applySignatureToPdf}
      setShowSignatureModal={setShowSignatureModal}
      pdfError={pdfError}
      SignatureModalComponent={
        showSignatureModal ? (
          <SignatureCreateModal
            onClose={() => setShowSignatureModal(false)}
            onSave={handleAddSignature}
          />
        ) : null
      }
    />
  );
}
