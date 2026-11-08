import { describe, expect, it } from "vitest";
import QRCode from "qrcode";

describe("PhonePe Dynamic UPI QR Code Generation", () => {
  it("dynamically generates correct UPI deep-link URL and scannable QR data URL according to stay value", async () => {
    const ratePerDay = 320;
    const stayDays = 3;
    const totalStayValue = ratePerDay * stayDays; // 960
    const roomNumber = "103";
    const guestName = "John Doe";
    const phonePeUpiId = "hotelres@ybl";
    const payeeName = "Aura Stays";
    const upiNote = `Room ${roomNumber} stay - ${guestName}`;

    // Standard UPI URI format accepted by PhonePe and Indian UPI apps
    const params = new URLSearchParams({
      pa: phonePeUpiId,
      pn: payeeName,
      am: String(totalStayValue),
      cu: "INR",
      tn: upiNote,
    });
    const upiUrl = `upi://pay?${params.toString()}`;

    expect(upiUrl).toContain("am=960");
    expect(upiUrl).toContain("cu=INR");
    expect(upiUrl).toContain("pa=hotelres%40ybl");
    expect(upiUrl).toContain("Room+103+stay+-+John+Doe");

    // Generate scannable QR data URL
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 170,
      margin: 1,
      color: {
        dark: "#2a0d45",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(qrDataUrl.length).toBeGreaterThan(500);
  });

  it("updates dynamic amount when stay duration or room rate changes", async () => {
    const calcStayValue = (rate: number, days: number) => rate * days;

    // Room 101: 250/day for 2 days
    const stay1 = calcStayValue(250, 2);
    expect(stay1).toBe(500);

    // Change room to Deluxe Suite (450/day) for 4 days
    const stay2 = calcStayValue(450, 4);
    expect(stay2).toBe(1800);

    const upiUrl = `upi://pay?${new URLSearchParams({
      pa: "myhotel@phonepe",
      pn: "Aura Stays",
      am: String(stay2),
      cu: "INR",
      tn: "Room 301 stay",
    }).toString()}`;

    expect(upiUrl).toContain("am=1800");

    const qrDataUrl = await QRCode.toDataURL(upiUrl);
    expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
