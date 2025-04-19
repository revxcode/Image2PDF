"use client";

import { useState, useEffect } from "react";
import { checkIsMobile } from "@/utils/helpers";

const PDFControls = ({
  handleUpload,
  paperSize,
  setPaperSize,
  layout,
  setLayout,
  marginPreset,
  setMarginPreset,
  customMargin,
  setCustomMargin,
  scale,
  setScale,
  pdfName,
  setPdfName,
  addTimestamp,
  setAddTimestamp,
  downloadPDF,
  images,
  PAPER_SIZES,
  isMobile,
  margin,
  setMargin,
  isInitialized,
  handleMarginPresetChange,
  handleCustomMarginChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isInitialized) {
    return (
      <div className="md:w-80 w-full bg-gray-100 p-4 border-r overflow-y-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="md:w-80 w-full bg-gray-100 p-4 border-r overflow-y-auto -space-y-40">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Image2PDF</h1>
        <p className="text-xs text-gray-500">by GhooDev</p>
      </div>

      <label className="flex flex-col items-center justify-center">
        <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-4xl text-gray-400">+</span>
          <span className="text-sm text-gray-500 mt-1">Add Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between mt-8 mb-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-gray-500 hover:text-blue-600 focus:outline-none"
          >
            {isOpen ? "Hide" : "Show"} Settings
          </button>
        </div>

        <div
          className={
            "space-y-4 w-full  " +
            (!isOpen && isMobile ? "h-0 overflow-hidden" : "")
          }
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paper Size
            </label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(PAPER_SIZES).map((size) => (
                <option key={size} value={size}>
                  {size} ({PAPER_SIZES[size].width}x{PAPER_SIZES[size].height}
                  px)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orientation
            </label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margin Preset
            </label>
            <select
              value={marginPreset}
              onChange={(e) => handleMarginPresetChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None</option>
              <option value="NARROW">Narrow</option>
              <option value="MODERATE">Moderate</option>
              <option value="WIDE">Wide</option>
              <option value="MIRROR">Mirror (for binding)</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {marginPreset === "CUSTOM" && (
            <div className="grid grid-cols-2 gap-2">
              {["top", "right", "bottom", "left"].map((side) => (
                <div key={side}>
                  <label className="block text-xs text-gray-500 capitalize">
                    {side} margin
                  </label>
                  <input
                    type="number"
                    value={customMargin[side]}
                    onChange={(e) =>
                      handleCustomMarginChange(side, e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    min="0"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoom: {Math.round(scale * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max={isMobile ? 2 : 5}
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF Name
            </label>
            <input
              type="text"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              placeholder="Enter PDF name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="addTimestamp"
              checked={addTimestamp}
              onChange={(e) => setAddTimestamp(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="addTimestamp"
              className="ml-2 block text-sm text-gray-700"
            >
              Add timestamp to filename
            </label>
          </div>
        </div>
        <button
          onClick={downloadPDF}
          disabled={images.length === 0}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            images.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Download PDF
        </button>
      </label>
    </div>
  );
};

export default PDFControls;
