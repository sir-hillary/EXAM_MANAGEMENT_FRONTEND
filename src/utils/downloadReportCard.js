import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadReportCard = async (elementRef, filename = 'report-card.pdf') => {
  const element = elementRef.current;
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => {
        // Ignore any <style> or <link rel="stylesheet"> tags
        if (el.tagName === 'STYLE') return true;
        if (el.tagName === 'LINK' && el.rel === 'stylesheet') return true;
        return false;
      },
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')
          .forEach(el => el.remove());
        clonedDoc.body.style.background = '#ffffff';
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth   = pageWidth;
    const imgHeight  = (canvas.height / canvas.width) * imgWidth;

    let heightLeft = imgHeight;
    let position   = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position   -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error('PDF generation failed:', err);
    throw err;
  }
};