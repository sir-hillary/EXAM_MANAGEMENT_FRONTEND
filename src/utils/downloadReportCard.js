import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadReportCard = async (elementRef, filename = 'report-card.pdf', orientation = 'portrait') => {
  const element = elementRef.current;
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2.5,                 // bumped from 2 → 2.5 for sharper print text
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
      clonedDoc.body.style.background = '#ffffff';
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
    },
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth   = pageWidth;
  const imgHeight  = (canvas.height / canvas.width) * imgWidth;

  let heightLeft = imgHeight;
  let position   = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
};