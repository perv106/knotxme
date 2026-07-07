const ExcelJS = require("exceljs");

/**
 * Streams an .xlsx file built from `rows` (array of flat objects) as the HTTP response.
 */
async function sendExcel(res, filename, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 22 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { sendExcel };
