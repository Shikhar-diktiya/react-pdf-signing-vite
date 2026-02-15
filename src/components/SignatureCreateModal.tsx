import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X } from "lucide-react";

type SignatureCreateModalProps = {
  onClose: () => void;
  onSave: (signatureData: string) => void;
};

export default function SignatureCreateModal({
  onClose,
  onSave,
}: SignatureCreateModalProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");
  const [typedSignature, setTypedSignature] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const handleClear = () => {
    if (activeTab === "draw" && sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    } else if (activeTab === "type") {
      setTypedSignature("");
    } else if (activeTab === "upload") {
      setUploadedImage(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20%",
        left: "25%",
        width: 400,
        background: "#fff",
        border: "2px solid #333",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
        padding: 20,
        borderRadius: "12px",
        zIndex: 1000,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ position: "relative" }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Create Signature
        </h2>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {(["draw", "type", "upload"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveTab(mode)}
              style={{
                padding: "6px 12px",
                fontSize: "14px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: activeTab === mode ? "#2563EB" : "#f5f5f5",
                color: activeTab === mode ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div
          style={{
            height: 150,
            width: "100%",
            border: "2px dashed #999",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          {activeTab === "draw" && (
            <SignatureCanvas
              penColor="black"
              ref={sigCanvasRef}
              canvasProps={{
                width: 350,
                height: 150,
                style: {
                  border: "1px solid #333",
                  borderRadius: "6px",
                  width: "100%",
                  height: "100%",
                },
              }}
            />
          )}

          {activeTab === "type" && (
            <input
              type="text"
              placeholder="Type your signature"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              style={{
                fontSize: "24px",
                fontFamily: "'Lucida Handwriting', cursive",
                border: "none",
                background: "transparent",
                textAlign: "center",
                width: "100%",
                outline: "none",
              }}
            />
          )}

          {activeTab === "upload" && (
            <>
              {!uploadedImage ? (
                <label
                  style={{
                    color: "#2563EB",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
              ) : (
                <img
                  src={uploadedImage}
                  alt="Uploaded Signature"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={handleClear}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1f0202ff",
              color: "#f5f2f2ff",
              border: "1px solid #150707ff",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Clear
          </button>
          <button
            onClick={() => {
              let signatureData: string | null = null;

              if (activeTab === "draw") {
                if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
                  signatureData = sigCanvasRef.current
                    .getCanvas()
                    .toDataURL("image/png");
                } else {
                  alert("Please draw a signature first.");
                  return;
                }
              } else if (activeTab === "type") {
                if (typedSignature.trim()) {
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;

                  canvas.width = 200;
                  canvas.height = 50;
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.font = "32px 'Lucida Handwriting', cursive";
                  ctx.fillStyle = "black";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillText(
                    typedSignature.trim(),
                    canvas.width / 2,
                    canvas.height / 2
                  );
                  signatureData = canvas.toDataURL("image/png");
                } else {
                  alert("Please type a signature.");
                  return;
                }
              } else if (activeTab === "upload") {
                if (uploadedImage) {
                  signatureData = uploadedImage;
                } else {
                  alert("Please upload an image.");
                  return;
                }
              }

              if (signatureData) {
                onSave(signatureData);
                onClose();
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#021509ff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
