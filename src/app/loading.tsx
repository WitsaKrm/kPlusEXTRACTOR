export default function Loading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "var(--background-color)",
      color: "var(--text-primary)"
    }}>
      <div className="spinner"></div>
      <p style={{ marginTop: "1rem", fontWeight: 500, color: "var(--text-secondary)" }}>
        Fetching your K PLUS transactions...
      </p>
      
      <style>{`
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: var(--sidebar-active);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
