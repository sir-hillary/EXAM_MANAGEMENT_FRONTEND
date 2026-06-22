import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadReportCard = async (
  elementRef,
  filename = "report-card.pdf",
) => {
  const element = elementRef.current;
  if (!element) return;

  console.log(getComputedStyle(element).backgroundColor);
  console.log(getComputedStyle(element).color);
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2× for crisp text on retina / print quality
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: true,
    });

    const imgData = canvas.toDataURL("image/png");

    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Scale image to fit A4 width exactly
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;

    // If content exceeds one page, tile it across multiple pages
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw err;
  }
};
