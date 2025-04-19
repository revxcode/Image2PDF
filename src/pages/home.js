"use client";

import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { MultiBackend } from "react-dnd-multi-backend";

import PDFControls from "@/components/PDFControls";
import PDFPreview from "@/components/PDFPreview";
import { PAPER_SIZES, MARGIN_PRESETS } from "@/utils/constants";
import {
  generateFileName,
  checkIsMobile,
  createImagePreviews,
} from "@/utils/helpers";
import { usePDFSettings } from "@/utils/hooks";

const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      options: {
        enableMouseEvents: true,
        enableKeyboardEvents: true,
      },
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: {
        enableMouseEvents: true,
        enableKeyboardEvents: true,
        delayTouchStart: 300,
        ignoreContextMenu: true,
        scrollAngleRanges: [
          { start: 30, end: 150 },
          { start: 210, end: 330 },
        ],
      },
    },
  ],
};

export default function ImageToPDF() {
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState("portrait");
  const [pdfName, setPdfName] = useState("");
  const [addTimestamp, setAddTimestamp] = useState(true);
  const [pages, setPages] = useState({});
  const [scale, setScale] = useState(checkIsMobile() ? 0.5 : 1);
  const [isMobile, setIsMobile] = useState(false);

  const {
    paperSize,
    setPaperSize,
    marginPreset,
    setMarginPreset,
    customMargin,
    setCustomMargin,
    isInitialized,
    ...settings
  } = usePDFSettings();

  const [margin, setMargin] = useState(MARGIN_PRESETS[marginPreset]);

  const previewRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    setIsMobile(checkIsMobile());
  }, []);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = createImagePreviews(files);

    setImages((prev) => [...prev, ...previews]);
    calculatePages();
  };

  const calculatePages = async () => {
    const size = PAPER_SIZES[paperSize];
    const isPortrait = layout === "portrait";
    const pageWidth = isPortrait ? size.width : size.height;
    const pageHeight = isPortrait ? size.height : size.width;
    const updatedPages = {};
    let cursorY = margin.top;
    let pageIndex = 1;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const image = new Image();
      image.src = img.src;

      await new Promise((resolve) => {
        image.onload = () => {
          let w = image.naturalWidth;
          let h = image.naturalHeight;
          const availableWidth = pageWidth - margin.left - margin.right;
          const scale = availableWidth / w;
          const newH = h * scale;

          if (cursorY + newH > pageHeight - margin.bottom) {
            pageIndex++;
            cursorY = margin.top;
          }
          updatedPages[img.id] = pageIndex;
          cursorY += newH;
          resolve();
        };
      });
    }
    setPages(updatedPages);
  };

  useEffect(() => {
    if (images.length > 0) calculatePages();
  }, [images, layout, margin, paperSize]);

  const downloadPDF = async () => {
    const size = PAPER_SIZES[paperSize];
    const isPortrait = layout === "portrait";
    const pageWidth = isPortrait ? size.width : size.height;
    const pageHeight = isPortrait ? size.height : size.width;

    const pdf = new jsPDF({
      orientation: layout,
      unit: "px",
      format: [pageWidth, pageHeight],
    });

    let cursorY = margin.top;
    let pageIndex = 0;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const image = new Image();
      image.src = img.src;

      await new Promise((resolve) => {
        image.onload = () => {
          let w = image.naturalWidth;
          let h = image.naturalHeight;
          const availableWidth = pageWidth - margin.left - margin.right;
          const scale = availableWidth / w;
          const newW = w * scale;
          const newH = h * scale;

          if (cursorY + newH > pageHeight - margin.bottom) {
            pdf.addPage([pageWidth, pageHeight]);
            pageIndex++;
            cursorY = margin.top;
          }

          pdf.setPage(pageIndex + 1);
          pdf.addImage(
            img.src,
            "JPEG",
            margin.left,
            cursorY,
            newW,
            newH,
            undefined,
            "FAST"
          );
          cursorY += newH;
          resolve();
        };
      });
    }

    pdf.save(generateFileName(pdfName, addTimestamp));
  };

  const moveImage = (dragIndex, dropIndex) => {
    if (dragIndex === dropIndex) return;
    const updatedImages = [...images];
    const [draggedImage] = updatedImages.splice(dragIndex, 1);
    updatedImages.splice(dropIndex, 0, draggedImage);
    setImages(updatedImages);
  };

  const removeImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleScrollWhileDragging = (clientY) => {
    if (!previewRef.current || isMobile) return;

    const { top, bottom, height } = previewRef.current.getBoundingClientRect();
    const scrollZoneHeight = height * 0.2;

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (clientY < top + scrollZoneHeight) {
      scrollIntervalRef.current = setInterval(() => {
        previewRef.current.scrollBy({ top: -10, behavior: "auto" });
      }, 16);
    } else if (clientY > bottom - scrollZoneHeight) {
      scrollIntervalRef.current = setInterval(() => {
        previewRef.current.scrollBy({ top: 10, behavior: "auto" });
      }, 16);
    }
  };

  const handleDragEnd = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleMarginPresetChange = (preset) => {
    setMarginPreset(preset);
    if (preset === "CUSTOM") {
      setMargin(customMargin);
    } else {
      setMargin(MARGIN_PRESETS[preset]);
    }
  };

  const handleCustomMarginChange = (side, value) => {
    const newMargin = { ...customMargin, [side]: parseInt(value) || 0 };
    setCustomMargin(newMargin);
    if (marginPreset === "CUSTOM") {
      setMargin(newMargin);
    }
  };

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className="flex h-screen overflow-hidden md:flex-row flex-col">
        <PDFControls
          isInitialized={isInitialized}
          {...settings}
          handleUpload={handleUpload}
          paperSize={paperSize}
          setPaperSize={setPaperSize}
          layout={layout}
          setLayout={setLayout}
          marginPreset={marginPreset}
          setMarginPreset={setMarginPreset}
          margin={margin}
          setMargin={setMargin}
          handleMarginPresetChange={handleMarginPresetChange}
          customMargin={customMargin}
          setCustomMargin={setCustomMargin}
          handleCustomMarginChange={handleCustomMarginChange}
          scale={scale}
          setScale={setScale}
          pdfName={pdfName}
          setPdfName={setPdfName}
          addTimestamp={addTimestamp}
          setAddTimestamp={setAddTimestamp}
          downloadPDF={downloadPDF}
          images={images}
          PAPER_SIZES={PAPER_SIZES}
          isMobile={isMobile}
        />

        <PDFPreview
          previewRef={previewRef}
          images={images}
          pages={pages}
          layout={layout}
          scale={scale}
          paperSize={paperSize}
          margin={margin}
          isMobile={isMobile}
          moveImage={moveImage}
          removeImage={removeImage}
          handleScrollWhileDragging={handleScrollWhileDragging}
          handleDragEnd={handleDragEnd}
          PAPER_SIZES={PAPER_SIZES}
        />
      </div>
    </DndProvider>
  );
}
