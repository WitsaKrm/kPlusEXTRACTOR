import React from 'react';
import { useRouter } from 'next/navigation';
import LoginButton from './LoginButton';

interface TopbarProps {
  currentView: string;
  isGroupView: boolean;
  selectedGroupName: string;
  selectedGroupMonth: string;
  setSelectedGroupMonth: (month: string) => void;
  months: string[];
  formatMonth: (yyyy_mm: string) => string;
  email: string | null | undefined;
  fetchedEmailCount: number;
  transactionCount: number;
}

export default function Topbar({
  currentView,
  isGroupView,
  selectedGroupName,
  selectedGroupMonth,
  setSelectedGroupMonth,
  months,
  formatMonth,
  email,
  fetchedEmailCount,
  transactionCount
}: TopbarProps) {
  const router = useRouter();
  const hasData = fetchedEmailCount > 0 || transactionCount > 0;

  return (
    <header className="topbar">
      <div className="topbar-title" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {currentView === "expense_summary" ? "Overall Expense Summary" : 
         isGroupView ? `Group Report: ${selectedGroupName}` : 
         `Report: ${formatMonth(currentView)}`}
         
        {isGroupView && (
          <select 
            value={selectedGroupMonth}
            onChange={(e) => setSelectedGroupMonth(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              fontSize: "0.875rem",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontWeight: "normal"
            }}
          >
            <option value="all">All Months ({months.length} เดือน)</option>
            {months.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span
          style={{
            fontSize: "0.75rem",
            color: hasData ? "#166534" : "#991b1b",
            backgroundColor: hasData ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${hasData ? "#86efac" : "#fca5a5"}`,
            borderRadius: "999px",
            padding: "4px 10px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
          title={hasData ? `${fetchedEmailCount} emails loaded • ${transactionCount} transactions parsed` : "No Gmail data loaded yet. Check login or Gmail access permissions."}
        >
          {hasData ? `Loaded ${fetchedEmailCount} emails • ${transactionCount} transactions` : "No data loaded yet"}
        </span>

        {email && (
          <button 
            onClick={() => {
              router.push("/?refresh=true");
            }}
            title="Force fetch new emails from Gmail"
            style={{ background: "var(--sidebar-active)", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            Refresh Data
          </button>
        )}
        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{email}</span>
        <LoginButton />
      </div>
    </header>
  );
}
