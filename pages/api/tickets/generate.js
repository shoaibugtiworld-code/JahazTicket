// Generates a branded PDF e-ticket after a Duffel order has been created (i.e. after
// payment succeeded and orders/create.js returned a booking reference).
// Call this with the same data orders/create.js returned, plus passenger + offer info.

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { bookingReference, airline, originAirport, destinationAirport, departureDate, arrivalDate, passenger, currency, finalPrice } = req.body;

  if (!bookingReference || !passenger) {
    return res.status(400).json({ error: "bookingReference and passenger are required" });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 400]); // A5-ish landscape ticket size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const brandGreen = rgb(0.298, 0.686, 0.118); // matches #4caf1e
    const dark = rgb(0.05, 0.05, 0.05);
    const muted = rgb(0.45, 0.45, 0.45);

    // Header band
    page.drawRectangle({ x: 0, y: 340, width: 595, height: 60, color: dark });
    page.drawText("Jahaz Ticket", { x: 30, y: 362, size: 20, font: bold, color: brandGreen });
    page.drawText("E-Ticket / Boarding Confirmation", { x: 30, y: 346, size: 10, font, color: rgb(1, 1, 1) });

    // Booking reference box
    page.drawText("Booking Reference", { x: 400, y: 362, size: 9, font, color: rgb(0.8, 0.8, 0.8) });
    page.drawText(bookingReference, { x: 400, y: 346, size: 14, font: bold, color: brandGreen });

    // Route
    page.drawText(`${originAirport}  →  ${destinationAirport}`, {
      x: 30,
      y: 300,
      size: 22,
      font: bold,
      color: dark,
    });
    page.drawText(airline || "Airline", { x: 30, y: 280, size: 11, font, color: muted });

    // Dates
    page.drawText("Departure", { x: 30, y: 250, size: 9, font, color: muted });
    page.drawText(formatDateTime(departureDate), { x: 30, y: 234, size: 11, font: bold, color: dark });

    if (arrivalDate) {
      page.drawText("Arrival", { x: 300, y: 250, size: 9, font, color: muted });
      page.drawText(formatDateTime(arrivalDate), { x: 300, y: 234, size: 11, font: bold, color: dark });
    }

    // Passenger
    page.drawLine({ start: { x: 30, y: 210 }, end: { x: 565, y: 210 }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
    page.drawText("Passenger", { x: 30, y: 190, size: 9, font, color: muted });
    page.drawText(passenger.fullName, { x: 30, y: 174, size: 13, font: bold, color: dark });

    page.drawText("CNIC / Passport", { x: 300, y: 190, size: 9, font, color: muted });
    page.drawText(passenger.idNumber || "-", { x: 300, y: 174, size: 13, font: bold, color: dark });

    // Price
    page.drawLine({ start: { x: 30, y: 150 }, end: { x: 565, y: 150 }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
    page.drawText("Total Paid", { x: 30, y: 130, size: 9, font, color: muted });
    page.drawText(`${currency || ""} ${finalPrice || ""}`, { x: 30, y: 112, size: 16, font: bold, color: brandGreen });

    // Footer
    page.drawText("Please arrive at the airport at least 2 hours before departure for domestic flights,", {
      x: 30,
      y: 50,
      size: 8,
      font,
      color: muted,
    });
    page.drawText("and 3 hours before departure for international flights.", {
      x: 30,
      y: 38,
      size: 8,
      font,
      color: muted,
    });
    page.drawText("jahaztikket.com", { x: 30, y: 20, size: 8, font, color: muted });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${bookingReference}.pdf"`);
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (err) {
    return res.status(500).json({ error: "Couldn't generate ticket PDF", details: err.message });
  }
}
