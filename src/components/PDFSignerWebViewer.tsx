import { useEffect, useRef } from "react";
import WebViewer from "@pdftron/webviewer";

export default function PDFSignerWebViewer() {
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    WebViewer(
      {
        path: "/lib/webviewer",
        initialDoc: "/offerletter.pdf",
        licenseKey:
          "demo:1753688332122:61857ab10300000000575ce7fe6cf7b196c7e100851cc1bd794aeb3fa7",
      },
      viewerRef.current
    ).then((instance: any) => {
      instance.UI.setHeaderItems((header: any[]) => {
        header.push({
          type: "actionButton",
          img: '<svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="#000"/></svg>',
          onClick: () => instance.UI.openElements(["signatureModal"]),
        });
      });
    });
  }, []);

  return <div ref={viewerRef} className="w-full h-screen" />;
}
