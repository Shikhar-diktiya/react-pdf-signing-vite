import React from "react";
import type { RefObject } from "react";

type DroppedSignature = {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
};

type PDFSignerViewProps = {
  pdfContainerRef: RefObject<HTMLDivElement | null>;
  pdfOuterContainerRef: RefObject<HTMLDivElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  signatureList: string[];
  setSignatureList: React.Dispatch<React.SetStateAction<string[]>>;
  droppedSignatures: DroppedSignature[];
  setDroppedSignatures: React.Dispatch<
    React.SetStateAction<DroppedSignature[]>
  >;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applySignatureToPdf: () => void;
  setShowSignatureModal: React.Dispatch<React.SetStateAction<boolean>>;
  pdfError: string | null;
  handlePointerDown: (
    e: React.PointerEvent<HTMLImageElement>,
    sigId: number
  ) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLImageElement>) => void;
  handlePointerUp: (e: React.PointerEvent<HTMLImageElement>) => void;
  SignatureModalComponent: React.ReactNode;
};

export default function PDFSignerView({
  pdfContainerRef,
  pdfOuterContainerRef,
  fileInputRef,
  signatureList,
  setSignatureList,
  droppedSignatures,
  setDroppedSignatures,
  handleFileChange,
  applySignatureToPdf,
  setShowSignatureModal,
  pdfError,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  SignatureModalComponent,
}: PDFSignerViewProps) {

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          backgroundColor: "#1f2937",
          color: "white",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        <div>PDF Signer</div>
        <button
          onClick={applySignatureToPdf}
          style={{
            background: "#4b5563",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Apply to PDF & Download
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "25%",
            padding: 12,
            borderRight: "2px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              padding: "10px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginBottom: "10px",
              width: "100%",
            }}
          >
            Upload PDF
          </button>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button
            onClick={() => setShowSignatureModal(true)}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              padding: "10px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Create Signature
          </button>

          <div style={{ marginTop: 16, fontWeight: "bold" }}>
            <h3>Signature List</h3>
            {signatureList.map((sig, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("signature", sig)}
                style={{
                  marginBottom: 10,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={sig}
                  alt={`Signature ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "70px",
                    objectFit: "contain",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    cursor: "grab",
                  }}
                />
                <button
                  onClick={() =>
                    setSignatureList((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  style={{
                    marginTop: 4,
                    width: "100%",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Preview */}
        <div
          style={{
            width: "75%",
            position: "relative",
            padding: "10px 20px",
          }}
        >
          {SignatureModalComponent}

          {pdfError && (
            <div
              role="alert"
              style={{
                marginBottom: "10px",
                padding: "10px 12px",
                color: "#991b1b",
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
              }}
            >
              {pdfError}
            </div>
          )}

          <div
            ref={pdfOuterContainerRef}
            id="pdf-container"
            style={{
              height: "100%",
              overflowY: "auto",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "8px",
              position: "relative",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const sigUrl = e.dataTransfer.getData("signature");
              if (!sigUrl || !pdfContainerRef.current) return;

              const container = e.currentTarget;
              const containerRect = container.getBoundingClientRect();
              const scrollTop = container.scrollTop;
              const scrollLeft = container.scrollLeft;

              const dropX =
                e.clientX - containerRect.left + scrollLeft;
              const dropY =
                e.clientY - containerRect.top + scrollTop;

              const canvasElements = Array.from(
                pdfContainerRef.current.getElementsByTagName("canvas")
              );
              let pageNumber = 1;

              for (let i = 0; i < canvasElements.length; i++) {
                const canvas = canvasElements[i] as HTMLCanvasElement;
                const top = canvas.offsetTop;
                const bottom = top + canvas.offsetHeight;

                if (dropY >= top && dropY <= bottom) {
                  pageNumber = parseInt(
                    canvas.dataset.pageNumber || `${i + 1}`,
                    10
                  );
                  break;
                }
              }

              const id = Date.now();
              setDroppedSignatures((prev) => [
                ...prev,
                {
                  id,
                  src: sigUrl,
                  x: dropX - 75,
                  y: dropY - 37.5,
                  width: 150,
                  height: 75,
                  pageNumber,
                },
              ]);
            }}
          >
            {/* Container where pdf canvases will be rendered */}
            <div ref={pdfContainerRef} style={{ pointerEvents: "none" }} />

            {/* Signature images positioned absolute to outer container */}
            {droppedSignatures.map((sig) => (
              <img
                key={sig.id}
                src={sig.src}
                draggable={false}
                alt="signature"
                onPointerDown={(e) => handlePointerDown(e, sig.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  position: "absolute",
                  top: sig.y,
                  left: sig.x,
                  width: sig.width,
                  height: sig.height,
                  cursor: "move",
                  zIndex: 10,
                  touchAction: "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
