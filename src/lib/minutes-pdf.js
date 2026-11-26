import { fmt } from "@/lib/labels";

const BRAND = [43, 111, 100];
const INK = [39, 67, 96];
const MUTED = [107, 114, 128];

const plain = (s = "") =>
  String(s)
    .replace(/\r/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "");

const slugify = (s) =>
  String(s || "ata")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "ata";

// Gera o PDF da ata no navegador e dispara o download.
export async function downloadMinutesPdf({ meeting, minutes, approvals = [], t, locale = "pt-BR" }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const C = W - M * 2;
  let y = M;

  const pageBreak = (needed) => {
    if (y + needed > H - 24) {
      doc.addPage();
      y = M;
    }
  };

  const paragraph = (text, { size = 10, color = INK, lineHeight = 5.4, font = "normal", indent = 0 } = {}) => {
    doc.setFont("helvetica", font);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, C - indent);
    lines.forEach((line) => {
      pageBreak(lineHeight);
      doc.text(line, M + indent, y);
      y += lineHeight;
    });
  };

  // Cabeçalho
  doc.setFillColor(...BRAND);
  doc.rect(M, y, C, 1.6, "F");
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("ACT AI", M, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(t("pdf.docTitle"), W - M, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(meeting.title || "", C);
  titleLines.forEach((line) => {
    doc.text(line, M, y);
    y += 7.5;
  });
  y += 2;

  const meta = [
    [t("form.date"), fmt(meeting.scheduledAt, true, locale)],
    [t("form.type"), t(`location.${meeting.locationType}`)],
    [t("detail.organizer"), meeting.organizerUserId],
    [t("detail.reviewer"), meeting.reviewerUserId],
    [t("detail.approver"), meeting.approverUserId],
    [t("ver.version"), `v${minutes.version || 1}`],
    [t("pdf.status"), t(`status.${meeting.status}`)],
  ].filter(([, v]) => v);

  doc.setFontSize(9);
  meta.forEach(([label, value]) => {
    pageBreak(5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`${label}:`, M, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(String(value), M + 34, y);
    y += 5;
  });

  if (minutes.templateName) {
    pageBreak(5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`${t("tpl.used")}:`, M, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(minutes.templateName, M + 34, y);
    y += 5;
  }

  y += 3;
  doc.setDrawColor(226, 232, 236);
  doc.setLineWidth(0.2);
  doc.line(M, y, W - M, y);
  y += 7;

  // Corpo da ata
  plain(minutes.content).split("\n").forEach((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      y += 2.6;
      return;
    }
    const bullet = /^[-*•]\s+/.test(line);
    paragraph(bullet ? `• ${line.replace(/^[-*•]\s+/, "")}` : line, { indent: bullet ? 3 : 0 });
  });

  // Aprovação
  const approval = approvals
    .filter((a) => a.decision === "aprovado")
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  if (approval) {
    y += 6;
    pageBreak(30);
    doc.setFillColor(240, 246, 244);
    const boxTop = y - 5;
    let inner = 11;
    if (approval.comment) inner += doc.splitTextToSize(approval.comment, C - 12).length * 4.6;
    if (approval.contentHash) inner += 12;
    doc.roundedRect(M, boxTop, C, inner, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text(t("ap.approved"), M + 6, y + 1);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    doc.text(`${approval.approverName || ""} · ${fmt(approval.created_date, true, locale)}`, M + 6, y + 6.5);
    y += 11;
    if (approval.comment) {
      paragraph(approval.comment, { size: 8.5, color: MUTED, lineHeight: 4.6, indent: 6 });
    }
    if (approval.contentHash) {
      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.splitTextToSize(`SHA-256: ${approval.contentHash}`, C - 12).forEach((line) => {
        doc.text(line, M + 6, y);
        y += 3.4;
      });
    }
  }

  // Rodapé em todas as páginas
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 236);
    doc.line(M, H - 16, W - M, H - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`Act AI · ${t("pdf.footer")}`, M, H - 11);
    doc.text(`${t("pdf.page")} ${p} ${t("pdf.of")} ${pages}`, W - M, H - 11, { align: "right" });
  }

  doc.save(`ata-${slugify(meeting.title)}-v${minutes.version || 1}.pdf`);
}