import React from 'react';
import { Transaction } from "@/lib/kplusParser";

interface MonthlyReportViewProps {
  isGroupView: boolean;
  selectedGroupName: string;
  monthExpense: number;
  monthByAccount: Record<string, number>;
  displayTransactions: Transaction[];
  selectedAccountFilter: string | null;
  setSelectedAccountFilter: (account: string | null) => void;
  handleUpdateCategory: (payee: string, currentCategory: string) => void;
}

export default function MonthlyReportView({
  isGroupView,
  selectedGroupName,
  monthExpense,
  monthByAccount,
  displayTransactions,
  selectedAccountFilter,
  setSelectedAccountFilter,
  handleUpdateCategory
}: MonthlyReportViewProps) {
  return (
    <>
      <div className="summary-grid">
        <div className="card" style={{ borderTop: "4px solid var(--expense-color)" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textTransform: "uppercase" }}>
            {isGroupView ? `Total Expense (${selectedGroupName})` : "Total Expense"}
          </h3>
          <p className="stat-value stat-expense">฿{monthExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Expense by Account / Person
        </div>
        {Object.keys(monthByAccount).length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No expenses found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th style={{ textAlign: "right" }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthByAccount)
                .sort((a, b) => b[1] - a[1])
                .map(([account, amount]) => (
                  <tr 
                    key={account} 
                    onClick={() => setSelectedAccountFilter(selectedAccountFilter === account ? null : account)}
                    style={{ 
                      cursor: "pointer", 
                      backgroundColor: selectedAccountFilter === account ? "var(--sidebar-hover)" : "transparent",
                      transition: "background-color 0.2s"
                    }}
                    title="Click to filter transactions below"
                  >
                    <td style={{ fontWeight: 500 }}>
                      {account}
                      {selectedAccountFilter === account && (
                        <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: "var(--sidebar-active)", background: "#e0e7ff", padding: "2px 6px", borderRadius: "10px" }}>
                          Filtering...
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      ฿{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Recent Transactions 
            {selectedAccountFilter 
              ? ` for ${selectedAccountFilter} (${displayTransactions.filter(tx => tx.receiver_name === selectedAccountFilter).length})` 
              : ` (${displayTransactions.length})`}
          </div>
          {selectedAccountFilter && (
            <button 
              onClick={() => setSelectedAccountFilter(null)}
              style={{ background: "var(--sidebar-active)", color: "white", border: "none", padding: "4px 12px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Clear Filter
            </button>
          )}
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Category</th>
                <th>Counterparty</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "right", width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {displayTransactions
                .filter(tx => !selectedAccountFilter || tx.receiver_name === selectedAccountFilter)
                .map((tx, idx) => {
                  const payee = tx.receiver_name || "Unknown";
                  return (
                    <tr key={idx}>
                      <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {tx.transaction_date} {tx.transaction_time}
                      </td>
                      <td>
                        {tx.status === "Success" ? (
                          <span style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            SUCCESS
                          </span>
                        ) : tx.status === "Failed" ? (
                          <span style={{ color: "#dc2626", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            FAILED
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600 }}>UNKNOWN</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="badge badge-income" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
                            {tx.category || "Others"}
                          </span>
                          <button 
                            onClick={() => handleUpdateCategory(payee, tx.category || "Others")}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                            title="Edit Category"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {payee}
                      </td>
                      <td style={{ 
                        textAlign: "right",
                        fontWeight: "bold",
                        color: "var(--text-primary)"
                      }}>
                        -฿{tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {tx.emailId && (
                          <a 
                            href={`https://mail.google.com/mail/u/0/#all/${tx.emailId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Original Email in Gmail"
                            style={{ color: "var(--sidebar-active)", display: "inline-flex", padding: "4px" }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
