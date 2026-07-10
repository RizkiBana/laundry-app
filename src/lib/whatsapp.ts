export async function sendWhatsAppNotification(
  phone: string,
  message: string
): Promise<boolean> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;

  // Format nomor Indonesia
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.slice(1);
  }

  if (apiUrl && apiKey) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Fallback: buka link wa.me (untuk development)
  console.log(`[WhatsApp] To: ${formattedPhone}\n${message}`);
  return true;
}

export function buildStatusNotification(
  customerName: string,
  orderNumber: string,
  status: string,
  statusLabel: string
): string {
  return `Halo ${customerName}! 👋

Pesanan laundry Anda *${orderNumber}* telah diperbarui.

Status: *${statusLabel}*

Terima kasih telah menggunakan layanan kami! 🧺`;
}

export function buildOrderNotification(
  customerName: string,
  orderNumber: string,
  totalAmount: string
): string {
  return `Halo ${customerName}! 👋

Pesanan laundry Anda telah berhasil dibuat.

No. Pesanan: *${orderNumber}*
Total: *${totalAmount}*

Silakan lakukan pembayaran dan upload bukti pembayaran melalui dashboard pelanggan.

Terima kasih! 🧺`;
}

export function buildPaymentNotification(
  customerName: string,
  orderNumber: string
): string {
  return `Halo ${customerName}! 👋

Pembayaran untuk pesanan *${orderNumber}* telah kami terima dan dikonfirmasi.

Pesanan Anda akan segera diproses. Terima kasih! ✅`;
}

export function getWhatsAppLink(phone: string, message: string): string {
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.slice(1);
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
