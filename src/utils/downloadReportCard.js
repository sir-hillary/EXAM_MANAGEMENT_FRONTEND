import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_PORTRAIT_WIDTH_PX = 794;
const A4_LANDSCAPE_WIDTH_PX = 1123;
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

  // Choose the correct A4 pixel width for the orientation
  const capturePxWidth =
    orientation === "landscape" ? A4_LANDSCAPE_WIDTH_PX : A4_PORTRAIT_WIDTH_PX;

  // ── Force the element to exactly A4 width before capture ────────────────
  // This prevents the "tiny top-left corner" bug caused by the element
  // collapsing inside an off-screen container that has no explicit width.
  const originalWidth = element.style.width;
  const originalMinWidth = element.style.minWidth;
  const originalDisplay = element.style.display;

  element.style.width = `${capturePxWidth}px`;
  element.style.minWidth = `${capturePxWidth}px`;
  element.style.display = "block";

  // Force layout recalculation
  element.getBoundingClientRect();

  try {
    const canvas = await html2canvas(element, {
      scale:           2.5,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: "#ffffff",
      logging:         false,
      width:           capturePxWidth,
      windowWidth:     capturePxWidth,
      onclone: (clonedDoc, clonedEl) => {
        // Strip Tailwind stylesheets — prevents oklch crash in html2canvas
        clonedDoc
          .querySelectorAll("style, link[rel='stylesheet']")
          .forEach((el) => el.remove());

        clonedEl.style.width    = `${capturePxWidth}px`;
        clonedEl.style.minWidth = `${capturePxWidth}px`;
        clonedEl.style.display  = "block";

        clonedDoc.body.style.cssText =
          `margin:0;padding:0;background:#fff;width:${capturePxWidth}px;`;
      },
    });

    // ── Build the PDF ──────────────────────────────────────────────────────
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidthMm = pdf.internal.pageSize.getWidth(); // 210mm portrait
    const pageHeightMm = pdf.internal.pageSize.getHeight(); // 297mm portrait

    // Scale the captured canvas to fill the full page width
    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (canvas.height / canvas.width) * imgWidthMm;

    const imgData = canvas.toDataURL("image/png");

    // First page
    pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm, "", "FAST");

    // Additional pages if content overflows one A4 page
    let remainingMm = imgHeightMm - pageHeightMm;
    let pageOffset = pageHeightMm;

    while (remainingMm > 0.5) {
      pdf.addPage();
      // Shift image up by one page height each iteration
      pdf.addImage(
        imgData,
        "PNG",
        0,
        -pageOffset,
        imgWidthMm,
        imgHeightMm,
        "",
        "FAST",
      );
      pageOffset += pageHeightMm;
      remainingMm -= pageHeightMm;
    }

    pdf.save(filename);
  } finally {
    // Always restore original styles even if capture fails
    element.style.width = originalWidth;
    element.style.minWidth = originalMinWidth;
    element.style.display = originalDisplay;
  }
};
