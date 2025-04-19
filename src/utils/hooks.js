"use client";

import { useState, useEffect } from "react";
import { MARGIN_PRESETS } from "./constants";

// Enhanced localStorage hook with better error handling
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Only run on client after hydration
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValue(typeof initialValue === "string" ? item : JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    try {
      const valueToStore =
        typeof value === "string" ? value : JSON.stringify(value);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

// Main settings hook with guaranteed valid values
export const usePDFSettings = () => {
  const [paperSize, setPaperSize] = useState("A4");
  const [marginPreset, setMarginPreset] = useState("MODERATE");
  const [customMargin, setCustomMargin] = useState({
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  });
  const [margin, setMargin] = useState(MARGIN_PRESETS[marginPreset]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage after hydration
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedPaperSize = window.localStorage.getItem(
          "image2pdf-paperSize"
        );
        const storedMarginPreset = window.localStorage.getItem(
          "image2pdf-marginPreset"
        );
        const storedCustomMargin = window.localStorage.getItem(
          "image2pdf-customMargin"
        );

        if (storedPaperSize) setPaperSize(storedPaperSize);
        if (storedMarginPreset) setMarginPreset(storedMarginPreset);
        if (storedCustomMargin) setCustomMargin(JSON.parse(storedCustomMargin));

        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading settings:", error);
        setIsInitialized(true);
      }
    };

    loadFromStorage();
  }, []);

  // Update margin when preset changes
  useEffect(() => {
    if (!isInitialized) return;

    const newMargin =
      marginPreset === "CUSTOM"
        ? customMargin
        : MARGIN_PRESETS[marginPreset] || MARGIN_PRESETS.MODERATE;
    setMargin(newMargin);
    window.localStorage.setItem("image2pdf-marginPreset", marginPreset);
    window.localStorage.setItem(
      "image2pdf-customMargin",
      JSON.stringify(customMargin)
    );
  }, [marginPreset, customMargin, isInitialized]);

  return {
    paperSize,
    setPaperSize,
    marginPreset,
    setMarginPreset,
    customMargin,
    setCustomMargin,
    margin,
    isInitialized,
  };
};
