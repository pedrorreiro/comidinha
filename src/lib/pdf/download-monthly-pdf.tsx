import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MEAL_SLOTS } from "@/constants/meal-slots";
import { daysInMonth, formatYmd, longDatePt, monthTitlePt } from "@/lib/dates";
import type { DiaryFoodEntry, MealSlotId } from "@/types/diary";

function normalizeSlotContent(raw?: string): string {
  const text = raw?.trim();
  if (!text) return "—";
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/\]\s*Refeição$/i.test(line))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return "—";
  return lines.map((line) => `• ${line}`).join("\n");
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(blob);
  });
}

async function toCircularJpegDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const size = 180;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Evita fundo preto em áreas transparentes ao exportar para JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    // "cover" central para manter proporção sem distorção.
    const srcW = bitmap.width;
    const srcH = bitmap.height;
    const srcAspect = srcW / srcH;
    const dstAspect = 1; // círculo em canvas quadrado

    let cropW = srcW;
    let cropH = srcH;
    if (srcAspect > dstAspect) {
      cropW = srcH * dstAspect;
    } else if (srcAspect < dstAspect) {
      cropH = srcW / dstAspect;
    }
    const cropX = (srcW - cropW) / 2;
    const cropY = (srcH - cropH) / 2;

    ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, size, size);
    ctx.restore();

    const jpegBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((out) => resolve(out), "image/jpeg", 0.92),
    );
    if (!jpegBlob) return null;
    return await blobToDataUrl(jpegBlob);
  } catch {
    return null;
  }
}

function initialsFromName(name?: string): string {
  const clean = (name ?? "").trim();
  if (!clean) return "US";
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? "" : "";
  return `${first}${last}`.toUpperCase() || "US";
}

export async function downloadMonthlyPdf(
  year: number,
  month: number,
  days: Record<string, Partial<Record<MealSlotId, string>>>,
  entries: Record<string, Partial<Record<MealSlotId, DiaryFoodEntry[]>>> = {},
  profile?: {
    name?: string;
    avatarUrl?: string | null;
  },
): Promise<void> {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const monthTitle = monthTitlePt(year, month);
  const monthTitleCap = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);
  const displayName = profile?.name?.trim() || "Usuário";
  const avatarDataUrl = profile?.avatarUrl?.trim()
    ? await toCircularJpegDataUrl(profile.avatarUrl.trim())
    : null;

  const n = daysInMonth(year, month);
  const ymdList = Array.from({ length: n }, (_, i) => formatYmd(year, month, i + 1));
  const filledYmdList = ymdList.filter((ymd) =>
    MEAL_SLOTS.some(
      (slot) =>
        (days[ymd]?.[slot.id] ?? "").trim().length > 0 ||
        (entries[ymd]?.[slot.id]?.length ?? 0) > 0,
    ),
  );

  // Header com bloco visual único (estilo "cabeçalho de relatório")
  const headerX = 44;
  const headerY = 28;
  const headerW = 507;
  const headerH = 78;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(headerX, headerY, headerW, headerH, 10, 10, "FD");

  const avatarX = 56;
  const avatarY = 42;
  const avatarSize = 36;
  if (avatarDataUrl) {
    doc.addImage(avatarDataUrl, "JPEG", avatarX, avatarY, avatarSize, avatarSize);
  } else {
    doc.setDrawColor(219, 228, 239);
    doc.setFillColor(241, 245, 249);
    doc.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(initialsFromName(displayName), avatarX + 8, avatarY + 19);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(15, 23, 42);
  doc.text("Diário alimentar", 102, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text(monthTitleCap, 102, 74);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Paciente: ${displayName}`, 102, 88, { maxWidth: 255 });
  doc.text(`Dias com registro: ${filledYmdList.length}`, 360, 88);

  let currentY = 124;

  if (filledYmdList.length === 0) {
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(44, currentY, 507, 94, 8, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Nenhuma refeição cadastrada", 58, currentY + 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text(
      "Não encontramos registros para este período. Tente selecionar outro mês ou cadastrar refeições antes de exportar novamente.",
      58,
      currentY + 48,
      { maxWidth: 470 },
    );
  } else {
    for (const ymd of filledYmdList) {
      if (currentY > 730) {
        doc.addPage();
        currentY = 44;
      }

      const dayNum = Number(ymd.slice(8, 10));
      const dayTitle = longDatePt(year, month, dayNum);
      const dayTitleCap = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);
      const rows = MEAL_SLOTS.flatMap((slot) => {
        const slotEntries = entries[ymd]?.[slot.id] ?? [];
        if (slotEntries.length > 0) {
          const foods = slotEntries.map((entry) => {
            const name = entry.brandName
              ? `${entry.foodName} (${entry.brandName})`
              : entry.foodName;
            return `• ${name}`;
          });
          const portions = slotEntries.map((entry) => `• ${entry.portionDescription ?? "—"}`);
          const calories = slotEntries.map((entry) =>
            `• ${typeof entry.calories === "number" ? `${Math.round(entry.calories)} kcal` : "—"}`,
          );

          return [{
            slot: slot.label,
            food: foods.join("\n"),
            portion: portions.join("\n"),
            calories: calories.join("\n"),
          }];
        }

        const content = normalizeSlotContent(days[ymd]?.[slot.id]);
        if (content === "—") return [];

        return [{
          slot: slot.label,
          food: content,
          portion: "• —",
          calories: "• —",
        }];
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(dayTitleCap, 44, currentY);

      const tableStartY = currentY + 10;

      autoTable(doc, {
        startY: tableStartY,
        margin: { left: 44, right: 44 },
        head: [["Refeição", "Prato", "Porção", "Calorias"]],
        body: rows.map((row) => [row.slot, row.food, row.portion, row.calories]),
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 11,
          textColor: [30, 41, 59],
          cellPadding: 8,
          valign: "top",
          lineColor: [232, 238, 246],
          lineWidth: 0.8,
        },
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [15, 23, 42],
          fontStyle: "bold",
          halign: "left",
          fontSize: 12,
        },
        columnStyles: {
          0: {
            cellWidth: 90,
            fillColor: [248, 250, 252],
            textColor: [71, 85, 105],
            fontStyle: "bold",
            fontSize: 10,
          },
          1: { cellWidth: 220, fontSize: 10.5 },
          2: { cellWidth: 125, fontSize: 10 },
          3: { cellWidth: 70, fontSize: 10, halign: "right" },
        },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          const pageWidth = doc.internal.pageSize.getWidth();
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Página ${doc.getNumberOfPages()}`,
            pageWidth / 2,
            pageHeight - 20,
            { align: "center" },
          );
        },
      });

      const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY + 120;
      currentY = finalY + 18;
    }
  }

  doc.save(`diario-alimentar-${year}-${String(month).padStart(2, "0")}.pdf`);
}
