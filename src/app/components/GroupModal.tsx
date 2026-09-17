import React from 'react';

interface GroupModalProps {
  showGroupModal: boolean;
  setShowGroupModal: (show: boolean) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  selectedPayees: string[];
  setSelectedPayees: (payees: string[]) => void;
  allPayees: string[];
  saveGroup: () => void;
}

export default function GroupModal({
  showGroupModal,
  setShowGroupModal,
  newGroupName,
  setNewGroupName,
  selectedPayees,
  setSelectedPayees,
  allPayees,
  saveGroup
}: GroupModalProps) {
  if (!showGroupModal) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "white", padding: "1.5rem", borderRadius: "8px", width: "100%", maxWidth: "500px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "80vh"
      }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--text-primary)" }}>Create/Edit Group</h2>
        
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>Group Name</label>
          <input 
            type="text" 
            value={newGroupName} 
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g. Family, Freelance Team"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Select Payees ({selectedPayees.length} selected)
          </label>
          <div style={{ overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "4px", padding: "0.5rem", maxHeight: "300px" }}>
            {allPayees.sort().map(payee => (
              <label key={payee} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", cursor: "pointer", fontSize: "0.875rem" }}>
                <input 
                  type="checkbox" 
                  checked={selectedPayees.includes(payee)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPayees([...selectedPayees, payee]);
                    } else {
                      setSelectedPayees(selectedPayees.filter(p => p !== payee));
                    }
                  }}
                />
                {payee}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
          <button 
            onClick={() => setShowGroupModal(false)}
            style={{ padding: "0.5rem 1rem", background: "white", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}
          >
            Cancel
          </button>
          <button 
            onClick={saveGroup}
            style={{ padding: "0.5rem 1rem", background: "var(--sidebar-active)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}
          >
            Save Group
          </button>
        </div>
      </div>
    </div>
  );
}
