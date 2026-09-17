import React from 'react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  months: string[];
  customGroups: Record<string, string[]>;
  handleManageGroup: () => void;
  handleEditGroup: (groupName: string, e: React.MouseEvent) => void;
  deleteGroup: (groupName: string, e: React.MouseEvent) => void;
  formatMonth: (yyyy_mm: string) => string;
}

// Short label for mobile bottom tab
function shortMonth(yyyy_mm: string) {
  const [, month] = yyyy_mm.split("-");
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return months[parseInt(month) - 1] || month;
}

function shortGroup(name: string) {
  // Take first 4 chars, uppercase
  return name.substring(0, 5).toUpperCase();
}

export default function Sidebar({
  currentView,
  setCurrentView,
  months,
  customGroups,
  handleManageGroup,
  handleEditGroup,
  deleteGroup,
  formatMonth
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        K PLUS Extractor
      </div>
      <div className="sidebar-menu">
        {/* Expense Summary */}
        <div 
          className={`menu-item ${currentView === "expense_summary" ? "active" : ""}`}
          onClick={() => setCurrentView("expense_summary")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          <span className="menu-label">Expense Summary</span>
          <span className="menu-short-label">ALL</span>
        </div>
        
        {/* Monthly Reports section label */}
        <div className="sidebar-label" style={{ padding: "1.5rem 1.5rem 0.5rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sidebar-text)", fontWeight: 700 }}>
          Monthly Reports
        </div>

        {months.map(month => (
          <div 
            key={month} 
            className={`menu-item ${currentView === month ? "active" : ""}`}
            onClick={() => setCurrentView(month)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className="menu-label">{formatMonth(month)}</span>
            <span className="menu-short-label">{shortMonth(month)}</span>
          </div>
        ))}

        {/* Groups section label */}
        <div className="sidebar-label" style={{ padding: "1.5rem 1.5rem 0.5rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sidebar-text)", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>My Groups</span>
          <button onClick={handleManageGroup} style={{ background: "none", border: "none", color: "var(--sidebar-active)", cursor: "pointer" }} title="Manage Groups">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        {Object.keys(customGroups).length === 0 && (
          <div className="sidebar-label" style={{ padding: "0 1.5rem", fontSize: "0.75rem", color: "var(--sidebar-text)", opacity: 0.7 }}>
            No groups created.
          </div>
        )}

        {/* Manage Groups button shown in mobile tab area */}
        <div
          className="menu-item mobile-add-group"
          onClick={handleManageGroup}
          title="Manage Groups"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span className="menu-short-label">+GRP</span>
        </div>

        {Object.keys(customGroups).map(group => (
          <div 
            key={`group_${group}`} 
            className={`menu-item ${currentView === `group_${group}` ? "active" : ""}`}
            onClick={() => setCurrentView(`group_${group}`)}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span className="menu-label" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{group}</span>
              <span className="menu-short-label">{shortGroup(group)}</span>
            </div>
            <div className="menu-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button 
                onClick={(e) => handleEditGroup(group, e)} 
                style={{ background: "none", border: "none", color: "var(--sidebar-active)", cursor: "pointer", padding: "2px" }}
                title="Edit Group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button 
                onClick={(e) => deleteGroup(group, e)} 
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", opacity: 0.5, padding: "2px" }}
                title="Delete Group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
