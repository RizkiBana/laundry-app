import QRCode from "qrcode";

export async function generatePaymentQR(
  amount: number,
  orderNumber: string
): Promise<string> {
  const bankName = process.env.BANK_NAME || "BCA";
  const bankAccount = process.env.BANK_ACCOUNT || "1234567890";
  const bankHolder = process.env.BANK_HOLDER || "Rizki Laundry";

  const paymentData = JSON.stringify({
    bank: bankName,
    account: bankAccount,
    holder: bankHolder,
    amount,
    orderNumber,
    note: `Pembayaran ${orderNumber}`,
  });

  return QRCode.toDataURL(paymentData, {
    width: 300,
    margin: 2,
    color: { dark: "#1e40af", light: "#ffffff" },
  });
}

export function getBankInfo() {
  return {
    bankName: process.env.BANK_NAME || "BCA",
    bankAccount: process.env.BANK_ACCOUNT || "1234567890",
    bankHolder: process.env.BANK_HOLDER || "Rizki Laundry",
  };
}
