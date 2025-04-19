"use client";

import DraggableImage from "@/components/DraggableImage";

const PDFPreview = ({
  previewRef,
  images,
  pages,
  layout,
  scale,
  paperSize,
  margin,
  isMobile,
  moveImage,
  removeImage,
  handleScrollWhileDragging,
  handleDragEnd,
  PAPER_SIZES,
}) => {
  return (
    <div
      ref={previewRef}
      className="flex-1 overflow-y-auto bg-gray-200 p-4 flex flex-col items-center py-8"
      style={{ touchAction: isMobile ? "pan-y" : "none" }}
    >
      <div className="w-full max-w-4xl space-y-8">
        {Object.values(
          images.reduce((acc, img, idx) => {
            const page = pages[img.id] || 1;
            if (!acc[page]) acc[page] = [];
            acc[page].push({ ...img, index: idx });
            return acc;
          }, {})
        ).map((pageImages, pageIdx) => (
          <div key={pageIdx} className="relative">
            <div className="absolute -top-6 left-0 w-full text-center text-gray-500 font-semibold">
              Page {pageIdx + 1}
            </div>
            <div
              className={`bg-white shadow-lg rounded-sm overflow-hidden mx-auto ${
                layout === "portrait"
                  ? "h-[calc(var(--page-height)*var(--scale))] w-[calc(var(--page-width)*var(--scale))]"
                  : "h-[calc(var(--page-width)*var(--scale))] w-[calc(var(--page-height)*var(--scale))]"
              }`}
              style={{
                "--scale": scale,
                "--page-width": PAPER_SIZES[paperSize].width + "px",
                "--page-height": PAPER_SIZES[paperSize].height + "px",
              }}
            >
              {pageImages.map((img) => (
                <DraggableImage
                  key={img.id}
                  id={img.id}
                  src={img.src}
                  index={img.index}
                  moveImage={moveImage}
                  removeImage={removeImage}
                  layout={layout}
                  margin={margin}
                  scale={scale}
                  isMobile={isMobile}
                  handleScrollWhileDragging={handleScrollWhileDragging}
                  handleDragEnd={handleDragEnd}
                  paperSize={paperSize}
                  PAPER_SIZES={PAPER_SIZES}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFPreview;
