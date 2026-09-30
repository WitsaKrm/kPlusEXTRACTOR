import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LoginButton from "./components/LoginButton";
import DashboardLayout from "./components/DashboardLayout";
import { fetchKPlusEmails } from "@/lib/gmail";
import { parseKPlusEmail, Transaction } from "@/lib/kplusParser";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  let allTransactions: Transaction[] = [];
  let groupedTransactions: Record<string, Transaction[]> = {};

  const params = await searchParams;
  const forceRefresh = params?.refresh === "true";

  let fetchedEmailCount = 0;

  if (!session || !(session as any)?.accessToken) {
    redirect("/api/auth/signin?callbackUrl=%2F");
  }

  try {
    const rawEmails = await fetchKPlusEmails((session as any).accessToken as string, forceRefresh);
    fetchedEmailCount = rawEmails.length;
    allTransactions = rawEmails.map((email) => parseKPlusEmail(email.body, email.id)).filter(tx => tx.transaction_date !== null);

    // Sort transactions by date descending
    allTransactions.sort((a, b) => {
      const dateA = new Date(`${a.transaction_date}T${a.transaction_time || '00:00:00'}`);
      const dateB = new Date(`${b.transaction_date}T${b.transaction_time || '00:00:00'}`);
      return dateB.getTime() - dateA.getTime();
    });

    // Group by month
    allTransactions.forEach((tx) => {
      if (tx.transaction_date) {
        const monthKey = tx.transaction_date.substring(0, 7); // YYYY-MM
        if (!groupedTransactions[monthKey]) {
          groupedTransactions[monthKey] = [];
        }
        groupedTransactions[monthKey].push(tx);
      }
    });
  } catch (error) {
    console.error("Gmail fetch failed, redirecting to sign-in:", error);
    redirect("/api/auth/signin?callbackUrl=%2F");
  }

  return (
    <DashboardLayout 
      email={session.user?.email} 
      allTransactions={allTransactions} 
      groupedTransactions={groupedTransactions} 
      fetchedEmailCount={fetchedEmailCount}
      transactionCount={allTransactions.length}
    />
  );
}
