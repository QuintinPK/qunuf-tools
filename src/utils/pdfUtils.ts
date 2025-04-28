
export const handlePDFAction = (pdfBlob: Blob | undefined, fileName: string, isDownload: boolean = false) => {
  if (!pdfBlob) {
    console.error('No PDF blob available');
    return;
  }

  const url = URL.createObjectURL(pdfBlob);
  
  if (isDownload) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    window.open(url, '_blank');
  }
  
  // Clean up the URL object after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
