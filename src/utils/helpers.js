export const generateFileName = (pdfName, addTimestamp) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  return `${pdfName || "document"}${addTimestamp ? `_${timestamp}` : ""}.pdf`;
};

export const checkIsMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const createImagePreviews = (files) => {
  return files.map((file, idx) => ({
    id: `${Date.now()}-${idx}`,
    file,
    src: URL.createObjectURL(file),
  }));
};
