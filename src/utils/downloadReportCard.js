import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// A4 at 96 DPI: 210mm × 297mm = 794px × 1123px
// We capture at scale 2 for sharpness, so canvas = 1588 × ~2246px
const A4_WIDTH_PX  = 794;
// const A4_WIDTH_MM  = 210;
// const A4_HEIGHT_MM = 297;

export const downloadReportCard = async (
  elementRef,
  filename = "report-card.pdf",
  orientation = "portrait",
) => {
  const element = elementRef.current;
  if (!element) {
    console.error("downloadReportCard: elementRef.current is null");
    return;
  }

  // ── Force the element to exactly A4 width before capture ────────────────
  // This prevents the "tiny top-left corner" bug caused by the element
  // collapsing inside an off-screen container that has no explicit width.
  const originalWidth    = element.style.width;
  const originalMinWidth = element.style.minWidth;
  const originalDisplay  = element.style.display;

  element.style.width    = `${A4_WIDTH_PX}px`;
  element.style.minWidth = `${A4_WIDTH_PX}px`;
  element.style.display  = "block";

  // Force layout recalculation
  element.getBoundingClientRect();

  try {
    const canvas = await html2canvas(element, {
      scale:           2.5,        // higher scale = sharper text when printed
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: "#ffffff",
      logging:         false,
      width:           A4_WIDTH_PX, // explicit width so canvas matches A4
      windowWidth:     A4_WIDTH_PX, // prevent responsive breakpoints from firing
      onclone: (clonedDoc, clonedEl) => {
        // Strip Tailwind stylesheets — prevents oklch crash in html2canvas
        clonedDoc
          .querySelectorAll("style, link[rel='stylesheet']")
          .forEach((el) => el.remove());

        // Ensure the cloned element also has the correct width
        clonedEl.style.width    = `${A4_WIDTH_PX}px`;
        clonedEl.style.minWidth = `${A4_WIDTH_PX}px`;
        clonedEl.style.display  = "block";

        clonedDoc.body.style.cssText =
          "margin:0;padding:0;background:#fff;width:" + A4_WIDTH_PX + "px;";
      },
    });

    // ── Build the PDF ──────────────────────────────────────────────────────
    const pdf = new jsPDF({
      orientation,
      unit:   "mm",
      format: "a4",
      compress: true,
    });

    const pageWidthMm  = pdf.internal.pageSize.getWidth();   // 210mm portrait
    const pageHeightMm = pdf.internal.pageSize.getHeight();  // 297mm portrait

    // Scale the captured canvas to fill the full page width
    const imgWidthMm  = pageWidthMm;
    const imgHeightMm = (canvas.height / canvas.width) * imgWidthMm;

    const imgData = canvas.toDataURL("image/png");

    // First page
    pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm, "", "FAST");

    // Additional pages if content overflows one A4 page
    let remainingMm = imgHeightMm - pageHeightMm;
    let pageOffset  = pageHeightMm;

    while (remainingMm > 0.5) {
      pdf.addPage();
      // Shift image up by one page height each iteration
      pdf.addImage(imgData, "PNG", 0, -pageOffset, imgWidthMm, imgHeightMm, "", "FAST");
      pageOffset  += pageHeightMm;
      remainingMm -= pageHeightMm;
    }

    pdf.save(filename);
  } finally {
    // Always restore original styles even if capture fails
    element.style.width    = originalWidth;
    element.style.minWidth = originalMinWidth;
    element.style.display  = originalDisplay;
  }
};