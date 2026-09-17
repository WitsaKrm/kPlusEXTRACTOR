export type TransactionType = "income" | "expense";

export interface Transaction {
  transaction_date: string | null;
  transaction_time: string | null;
  amount: number | null;
  transaction_type: TransactionType | null;
  sender_name: string | null;
  receiver_name: string | null;
  reference_no: string | null;
  category?: string;
  status?: "Success" | "Failed" | "Unknown";
  emailId?: string;
}

export function parseKPlusEmail(emailBody: string, emailId?: string): Transaction {
  const transaction: Transaction = {
    transaction_date: null,
    transaction_time: null,
    amount: null,
    transaction_type: null,
    sender_name: null,
    receiver_name: null,
    reference_no: null,
    category: "Others",
    status: "Unknown",
    emailId: emailId,
  };

  // Extract Date and Time (handles both "วันที่ทำรายการ:" and "วันที่:")
  const dateMatch = emailBody.match(/(?:วันที่ทำรายการ|วันที่)\s*:\s*(\d{2}\/\d{2}\/\d{2,4})(?:\s+(\d{2}:\d{2}:\d{2}))?/);
  if (dateMatch) {
    const parts = dateMatch[1].split("/");
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    transaction.transaction_date = `${year}-${parts[1]}-${parts[0]}`;
    if (dateMatch[2]) {
      transaction.transaction_time = dateMatch[2].substring(0, 5); // take HH:mm
    }
  }

  // Sometimes time is separate
  if (!transaction.transaction_time) {
    const timeMatch = emailBody.match(/เวลา\s*:\s*(\d{2}:\d{2}(?::\d{2})?)/);
    if (timeMatch) transaction.transaction_time = timeMatch[1].substring(0, 5);
  }

  // Flexible amount match
  const amountMatch = emailBody.match(/(?:จำนวนเงิน\s*\(บาท\)|จำนวนเงิน)\s*:\s*([\d,]+\.\d{2})/);
  if (amountMatch) transaction.amount = parseFloat(amountMatch[1].replace(/,/g, ""));

  // Identify transaction type
  const isExpense = emailBody.match(/โอนเงินจากบัญชี|ชำระเงินจากบัญชี|ซื้อกองทุน|สับเปลี่ยนกองทุน|โอนเงินให้|ชำระเงินให้/);
  const isIncome = emailBody.match(/รับเงินจาก|รับเงินโอน|มีเงินโอนเข้า/);
  
  if (isExpense) {
    transaction.transaction_type = "expense";
  } else if (isIncome) {
    transaction.transaction_type = "income";
  } else if (emailBody.match(/สำเร็จ|Success/)) {
    // Default to expense if we can't figure it out but it succeeded and has an amount
    transaction.transaction_type = "expense";
  }

  const senderMatch = emailBody.match(/(?:โอนเงินจากบัญชี|ชำระเงินจากบัญชี|ชื่อบัญชีผู้โอน)\s*:\s*([^\r\n<]+)/);
  if (senderMatch) transaction.sender_name = senderMatch[1].trim();

  // For transfers, receiver could be "ชื่อบัญชี:", "เพื่อเข้าบัญชีบริษัท:", "ชื่อบัญชีผู้รับโอน:"
  const receiverMatch = emailBody.match(/(?:ชื่อบัญชี|เพื่อเข้าบัญชีบริษัท|ชื่อบัญชีผู้รับโอน)\s*:\s*([^\r\n<]+)/);
  if (receiverMatch) {
    // Clean up extra spaces inside the name (e.g. "นาย อัษฎาวุฒิ" -> "นายอัษฎาวุฒิ" or standardize it)
    transaction.receiver_name = receiverMatch[1].trim().replace(/\s+/g, " ");
  } else {
    // For funds, receiver is "กองทุน:"
    const fundMatch = emailBody.match(/กองทุน\s*:\s*([^\r\n<]+)/);
    if (fundMatch) transaction.receiver_name = "กองทุน " + fundMatch[1].trim();
  }

  const refMatch = emailBody.match(/(?:เลขที่รายการ|หมายเลขอ้างอิง)\s*:\s*([a-zA-Z0-9]+)/);
  if (refMatch) transaction.reference_no = refMatch[1].trim();

  // Extract Status
  if (emailBody.match(/สำเร็จ|Success/i)) {
    transaction.status = "Success";
  } else if (emailBody.match(/ไม่สำเร็จ|ล้มเหลว|Failed/i)) {
    transaction.status = "Failed";
  } else {
    // K PLUS mostly sends emails for successful transactions, default to Success if unsure but has reference
    transaction.status = transaction.reference_no ? "Success" : "Unknown";
  }

  // Auto-Categorization Logic
  if (transaction.transaction_type === "expense") {
    const rName = transaction.receiver_name?.toLowerCase() || "";
    
    if (rName.includes("shopee") || rName.includes("lazada") || rName.includes("tiktok") || rName.includes("spay")) {
      transaction.category = "Shopping";
    } else if (rName.includes("กองทุน") || rName.includes("k-") || rName.includes("หุ้น") || rName.includes("บลจ")) {
      transaction.category = "Investment";
    } else if (rName.includes("ไฟฟ้านครหลวง") || rName.includes("กปน") || rName.includes("โทรคมนาคม") || rName.includes("ais") || rName.includes("true") || rName.includes("dtac")) {
      transaction.category = "Utilities & Bills";
    } else if (rName.includes("นาย ") || rName.includes("นาง ") || rName.includes("นางสาว ") || rName.includes("ด.ช.") || rName.includes("ด.ญ.")) {
      transaction.category = "P2P Transfer";
    } else if (rName.includes("บริษัท") || rName.includes("จำกัด") || rName.includes("co.,ltd") || rName.includes("payment")) {
      transaction.category = "Services & Bills";
    } else if (transaction.receiver_name) {
      // If it doesn't match above but doesn't look like a company, guess it's a person
      transaction.category = "P2P Transfer";
    } else {
      transaction.category = "Others";
    }
  } else {
    transaction.category = "Income";
  }

  return transaction;
}

export function summarizeTransactions(transactions: Transaction[]) {
  const summary = {
    totalExpense: 0,
    totalIncome: 0,
    byAccount: {} as Record<string, number>,
  };

  transactions.forEach((tx) => {
    if (tx.amount) {
      if (tx.transaction_type === "expense") {
        summary.totalExpense += tx.amount;
        const target = tx.receiver_name || "Unknown";
        summary.byAccount[target] = (summary.byAccount[target] || 0) + tx.amount;
      } else if (tx.transaction_type === "income") {
        summary.totalIncome += tx.amount;
        const source = tx.sender_name || "Unknown";
        summary.byAccount[source] = (summary.byAccount[source] || 0) + tx.amount;
      }
    }
  });

  return summary;
}
