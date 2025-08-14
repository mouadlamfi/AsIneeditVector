import { useState } from 'react';

interface ExportOptions {
  filename?: string;
  format?: 'a4' | 'letter' | 'custom';
  quality?: number;
}

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (element: HTMLElement, options: ExportOptions = {}) => {
    setIsExporting(true);
    
    try {
      // Lazy load heavy libraries only when needed
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        useCORS: true,
        scale: options.quality || 2,
        height: element.scrollHeight,
        width: element.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: options.format || 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(options.filename || 'design.pdf');
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    isExporting,
  };
}