import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportTableToPDF(
  elementId: string,
  filename: string = "export.pdf"
) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      return;
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // Get canvas dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    let heightLeft = (canvas.height * imgWidth) / canvas.width;
    let position = 0;

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    // Add image to PDF, handling multiple pages
    while (heightLeft >= 0) {
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, 
        (canvas.height * imgWidth) / canvas.width
      );
      heightLeft -= pageHeight;
      position -= pageHeight;

      if (heightLeft > 0) {
        pdf.addPage();
      }
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}

export function printElement(elementId: string) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      return;
    }

    // Create a new window for printing
    const printWindow = window.open("", "", "height=800,width=1200");
    if (!printWindow) {
      alert("Failed to open print window. Please check your pop-up settings.");
      return;
    }

    // Get the HTML content
    const elementHTML = element.outerHTML;

    // Write HTML to the print window with styling
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Print</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: white;
            color: #000;
            padding: 20px;
            line-height: 1.4;
          }
          
          @media print {
            body {
              padding: 0;
            }
            table {
              page-break-inside: avoid;
            }
            tr {
              page-break-inside: avoid;
            }
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            border: 1px solid #ccc;
            padding: 12px;
            text-align: left;
          }
          
          th {
            background: #f5f5f5;
            font-weight: 600;
            color: #000;
          }
          
          tr:nth-child(even) {
            background: #fafafa;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-bottom: 10px;
            color: #000;
          }
          
          .bg-zinc-800, .bg-blue-600, .bg-green-600, .bg-red-600, 
          .bg-yellow-600, .bg-purple-600, .bg-orange-600, .bg-indigo-900,
          .bg-zinc-900, .bg-slate-900 {
            background: white !important;
            color: #000 !important;
          }
          
          .text-zinc-400, .text-zinc-300, .text-gray-400, .text-gray-300 {
            color: #666 !important;
          }
          
          .text-white {
            color: #000 !important;
          }
        </style>
      </head>
      <body>
        ${elementHTML}
      </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } catch (error) {
    console.error("Error printing:", error);
    alert("Failed to print. Please try again.");
  }
}
