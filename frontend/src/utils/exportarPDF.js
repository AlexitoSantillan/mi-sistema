import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarPDF = (datos) => {
  const doc = new jsPDF();

  // TÍTULO
  doc.setFontSize(18);
  doc.text("Reporte de Vencimientos", 14, 20);

  // FILAS
  const filas = datos.map((item) => [
    item.nombre,
    item.lote,
    item.cantidad,
    item.fecha_vencimiento,
  ]);

  // TABLA
  autoTable(doc, {
    startY: 30,
    head: [["Producto", "Lote", "Cantidad", "Fecha Vencimiento"]],
    body: filas,
  });

  // DESCARGAR PDF
  doc.save("vencimientos.pdf");
};
