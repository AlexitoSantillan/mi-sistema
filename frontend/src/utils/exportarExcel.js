import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportarExcel = async (datos) => {

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Albeyro ERP";
  workbook.company = "Confitería Albeyro";

  const ws = workbook.addWorksheet("Reporte");

  // =========================
  // ESTADÍSTICAS
  // =========================

  const vencidos = datos.filter(
    p => new Date(p.fecha_vencimiento) < new Date()
  ).length;

  const stockBajo = datos.filter(
    p => Number(p.cantidad_real) < 20
  ).length;

  const ok =
    datos.length - vencidos - stockBajo;

  // =========================
  // ENCABEZADO
  // =========================

  ws.mergeCells("A1:E1");
  ws.getCell("A1").value =
    "CONFITERÍA ALBEYRO";

  ws.getCell("A1").font = {
    bold: true,
    size: 18,
    color: { argb: "FFFFFF" }
  };

  ws.getCell("A1").alignment = {
    horizontal: "center"
  };

  ws.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1E3A8A" }
  };

  ws.mergeCells("A2:E2");

  ws.getCell("A2").value =
    "REPORTE DE CONTROL DE VENCIMIENTOS";

  ws.getCell("A2").font = {
    bold: true,
    size: 14
  };

  ws.getCell("A2").alignment = {
    horizontal: "center"
  };

  ws.addRow([]);

  ws.addRow([
    "Fecha de generación:",
    new Date().toLocaleString()
  ]);

  ws.addRow([
    "Total de registros:",
    datos.length
  ]);

  ws.addRow([
    "Productos vencidos:",
    vencidos
  ]);

  ws.addRow([
    "Stock bajo:",
    stockBajo
  ]);

  ws.addRow([
    "Productos OK:",
    ok
  ]);

  ws.addRow([]);
  ws.addRow([]);

  // =========================
  // TABLA
  // =========================

  const filaCabecera = ws.addRow([
    "Producto",
    "Lote",
    "Existencias",
    "Vencimiento",
    "Estado"
  ]);

  filaCabecera.eachCell(cell => {

    cell.font = {
      bold: true,
      color: { argb: "FFFFFF" }
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2563EB" }
    };

    cell.alignment = {
      horizontal: "center"
    };

  });

  // =========================
  // DATOS
  // =========================

  datos.forEach(item => {

    let estado = "OK";

    if (
      new Date(item.fecha_vencimiento) <
      new Date()
    ) {
      estado = "VENCIDO";
    }
    else if (
      Number(item.cantidad_real) < 20
    ) {
      estado = "STOCK BAJO";
    }

    const row = ws.addRow([
      item.nombre,
      item.lote,
      item.cantidad_real,
      item.fecha_vencimiento,
      estado
    ]);

    row.eachCell(cell => {

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" }
      };

    });

    const estadoCell = row.getCell(5);

    if (estado === "VENCIDO") {

      estadoCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FECACA" }
      };

      estadoCell.font = {
        bold: true
      };

    }

    if (estado === "STOCK BAJO") {

      estadoCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FDE68A" }
      };

      estadoCell.font = {
        bold: true
      };

    }

    if (estado === "OK") {

      estadoCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "BBF7D0" }
      };

    }

  });

  // =========================
  // ANCHOS
  // =========================

  ws.columns = [
    { width: 60 },
    { width: 15 },
    { width: 15 },
    { width: 20 },
    { width: 20 }
  ];

  // =========================
  // FILTRO
  // =========================

  const headerRow =
    11;

  ws.autoFilter = {
    from: {
      row: headerRow,
      column: 1
    },
    to: {
      row: headerRow,
      column: 5
    }
  };

  // =========================
  // CONGELAR CABECERA
  // =========================

  ws.views = [
    {
      state: "frozen",
      ySplit: headerRow
    }
  ];

  // =========================
  // PIE
  // =========================

  ws.addRow([]);
  ws.addRow([]);

  const footer = ws.addRow([
    "Reporte generado automáticamente por Albeyro ERP"
  ]);

  ws.mergeCells(
    `A${footer.number}:E${footer.number}`
  );

  footer.font = {
    italic: true
  };

  footer.alignment = {
    horizontal: "center"
  };

  // =========================
  // EXPORTAR
  // =========================

  const buffer =
    await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `Confiteria_Albeyro_Vencimientos.xlsx`
  );

};