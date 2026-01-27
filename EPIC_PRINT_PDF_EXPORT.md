# Epic Portfolio Print & PDF Export Feature

## Overview
Added print and PDF export functionality to the Epic Portfolio table view at `/projects/epics`. Users can now easily generate printouts or PDF documents of their project portfolio.

## Features Added

### 1. Print Button
- **Location**: Header of Epic Portfolio page (top right)
- **Color**: Green button with printer icon
- **Functionality**: Opens native print dialog for browser/system printing
- **Output**: Print-friendly version with black text on white background

### 2. PDF Export Button  
- **Location**: Header of Epic Portfolio page (top right, next to Print)
- **Color**: Orange button with download icon
- **Functionality**: Generates a downloadable PDF file
- **Output**: Filename includes today's date (e.g., `epics-2026-01-27.pdf`)

## How to Use

### Print the Table
1. Navigate to `/projects/epics`
2. Switch to "Table View" if needed
3. Apply any filters or sorting as desired
4. Click the green **"Print"** button
5. Adjust print settings (margins, pages, etc.)
6. Click "Print" to save or print to paper

### Export to PDF
1. Navigate to `/projects/epics`
2. Switch to "Table View" if needed  
3. Apply any filters or sorting as desired
4. Click the orange **"PDF"** button
5. The file will download automatically (e.g., `epics-2026-01-27.pdf`)

## Technical Implementation

### Files Modified
1. **`lib/pdf-export.ts`** (NEW)
   - `exportTableToPDF()` function using jsPDF and html2canvas
   - `printElement()` function for native printing
   - Handles multi-page PDF generation
   - Converts dark mode to light mode for readability

2. **`app/projects/epics/components/EpicPortfolioClient.tsx`**
   - Added Print and PDF buttons to header
   - Imported pdf-export utilities
   - Added print and PDF icons from tabler-icons

3. **`app/projects/epics/components/EpicTableView.tsx`**
   - Wrapped table in `<div id="portfolio-table">` for export targeting

4. **`app/globals.css`**
   - Added `@media print` styles
   - Converts dark theme to light theme for printing
   - Optimizes table layout for printing
   - Prevents page breaks in unwanted places

### Dependencies
- **jspdf**: Generates PDF documents
- **html2canvas**: Converts HTML to canvas for PDF embedding

## Features
- ✅ Print-friendly black-on-white styling
- ✅ Multi-page PDF support (automatically creates new pages if needed)
- ✅ Preserves table structure and formatting
- ✅ Uses browser's native print dialog
- ✅ Works with filtered/sorted data (exports what you see)
- ✅ Automatic filename with date for PDF exports

## Printing Tips
1. **Best Results**: Use Table View for clearest output
2. **Filters**: Apply any filters before printing/exporting
3. **Sorting**: Sort by any column - export reflects the sorted order
4. **Margins**: Adjust printer margins to fit content properly
5. **PDF Settings**: In print dialog, set destination to "Save as PDF" for better control

## Browser Compatibility
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (may need to adjust popup settings)

## Troubleshooting
- **PDF doesn't download**: Check browser's popup/download settings
- **Print dialog won't open**: Ensure popups aren't blocked
- **Formatting looks wrong**: Try adjusting print margins to "Minimal" or "None"
- **Content gets cut off**: Use landscape orientation in print settings

