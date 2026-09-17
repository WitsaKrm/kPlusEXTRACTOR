"use client";

import React, { useState, useEffect } from "react";
import { Transaction } from "@/lib/kplusParser";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ExpenseSummaryView from "./ExpenseSummaryView";
import MonthlyReportView from "./MonthlyReportView";
import GroupModal from "./GroupModal";

interface DashboardLayoutProps {
  email: string | null | undefined;
  groupedTransactions: Record<string, Transaction[]>;
  allTransactions: Transaction[];
}

export default function DashboardLayout({ email, groupedTransactions, allTransactions }: DashboardLayoutProps) {
  const months = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
  const [currentView, setCurrentView] = useState<string>(months.length > 0 ? months[0] : "expense_summary");
  const [customCategories, setCustomCategories] = useState<Record<string, string>>({});
  const [customGroups, setCustomGroups] = useState<Record<string, string[]>>({});
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string | null>(null);

  // Group Modal State
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedPayees, setSelectedPayees] = useState<string[]>([]);
  const [selectedGroupMonth, setSelectedGroupMonth] = useState<string>("all");
  
  // All unique payees for selection
  const allPayees = Array.from(new Set(allTransactions.map(tx => tx.receiver_name).filter(Boolean))) as string[];

  // Reset filter when view changes
  useEffect(() => {
    setSelectedAccountFilter(null);
  }, [currentView]);

  // Load custom data from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem("customCategories");
    if (savedCategories) setCustomCategories(JSON.parse(savedCategories));

    const savedGroups = localStorage.getItem("customGroups");
    if (savedGroups) setCustomGroups(JSON.parse(savedGroups));
  }, []);

  const handleUpdateCategory = (payee: string, currentCategory: string) => {
    const newCategory = prompt(`Enter new category for ${payee}:`, currentCategory);
    if (newCategory !== null && newCategory.trim() !== "") {
      const updated = { ...customCategories, [payee]: newCategory.trim() };
      setCustomCategories(updated);
      localStorage.setItem("customCategories", JSON.stringify(updated));
    }
  };

  const handleManageGroup = () => {
    setNewGroupName("");
    setSelectedPayees([]);
    setShowGroupModal(true);
  };

  const handleEditGroup = (groupName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewGroupName(groupName);
    setSelectedPayees(customGroups[groupName] || []);
    setShowGroupModal(true);
  };

  const saveGroup = () => {
    if (!newGroupName || newGroupName.trim() === "") {
      alert("Please enter a group name.");
      return;
    }
    if (selectedPayees.length === 0) {
      alert("Please select at least one payee.");
      return;
    }
    
    const updated = { ...customGroups, [newGroupName.trim()]: selectedPayees };
    setCustomGroups(updated);
    localStorage.setItem("customGroups", JSON.stringify(updated));
    setShowGroupModal(false);
  };

  const deleteGroup = (groupName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the group '${groupName}'?`)) {
      const updated = { ...customGroups };
      delete updated[groupName];
      setCustomGroups(updated);
      localStorage.setItem("customGroups", JSON.stringify(updated));
      if (currentView === `group_${groupName}`) {
        setCurrentView("expense_summary");
      }
    }
  };

  // Apply custom categories to transactions
  const processedTransactions = allTransactions.map(tx => {
    const payee = tx.receiver_name || "Unknown";
    if (customCategories[payee]) {
      return { ...tx, category: customCategories[payee] };
    }
    return tx;
  });

  // Calculate top expenses across ALL processed transactions
  const totalExpenses = processedTransactions
    .filter(tx => tx.transaction_type === "expense")
    .reduce((acc, tx) => {
      const target = tx.receiver_name || "Unknown";
      acc[target] = (acc[target] || 0) + (tx.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const topExpenses = Object.entries(totalExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // Calculate selected month stats
  let monthIncome = 0;
  let monthExpense = 0;
  let monthByAccount: Record<string, number> = {};
  let displayTransactions: Transaction[] = [];

  const isGroupView = currentView.startsWith("group_");
  const selectedGroupName = isGroupView ? currentView.replace("group_", "") : "";

  if (currentView !== "expense_summary") {
    if (isGroupView) {
      // Group View: filter by group payees and optionally by month
      const groupPayees = customGroups[selectedGroupName] || [];
      displayTransactions = processedTransactions.filter(
        tx => tx.receiver_name && groupPayees.includes(tx.receiver_name) &&
              (selectedGroupMonth === "all" || (tx.transaction_date && tx.transaction_date.substring(0, 7) === selectedGroupMonth))
      );
    } else {
      // Monthly View
      displayTransactions = processedTransactions.filter(
        tx => tx.transaction_date && tx.transaction_date.substring(0, 7) === currentView
      );
    }
    
    displayTransactions.forEach(tx => {
      if (tx.amount && tx.transaction_type === "expense") {
        monthExpense += tx.amount;
        const target = tx.receiver_name || "Unknown";
        monthByAccount[target] = (monthByAccount[target] || 0) + tx.amount;
      }
    });
  }

  const formatMonth = (yyyy_mm: string) => {
    const [year, month] = yyyy_mm.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Prepare Chart Data
  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];
  
  // Top 5 Payees for Bar Chart
  const top5Expenses = topExpenses.slice(0, 5);

  const barChartData = top5Expenses.map(([name, value]) => ({
    name: name.length > 12 ? name.substring(0, 12) + "..." : name,
    value,
    fullName: name,
  }));

  // Group expenses by Category for Pie Chart
  const categoryExpenses = processedTransactions
    .filter(tx => tx.transaction_type === "expense")
    .reduce((acc, tx) => {
      const cat = tx.category || "Others";
      acc[cat] = (acc[cat] || 0) + (tx.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryExpenses)
    .map(([name, value]) => ({ name, value, fullName: name }))
    .sort((a, b) => b.value - a.value);

  // Time Analysis
  const timeAnalysis = {
    "Morning (06:00 - 11:59)": 0,
    "Afternoon (12:00 - 16:59)": 0,
    "Evening (17:00 - 20:59)": 0,
    "Night (21:00 - 05:59)": 0,
  };

  processedTransactions.filter(tx => tx.transaction_type === "expense").forEach(tx => {
    if (tx.transaction_time && tx.amount) {
      const hour = parseInt(tx.transaction_time.substring(0, 2), 10);
      if (hour >= 6 && hour < 12) timeAnalysis["Morning (06:00 - 11:59)"] += tx.amount;
      else if (hour >= 12 && hour < 17) timeAnalysis["Afternoon (12:00 - 16:59)"] += tx.amount;
      else if (hour >= 17 && hour < 21) timeAnalysis["Evening (17:00 - 20:59)"] += tx.amount;
      else timeAnalysis["Night (21:00 - 05:59)"] += tx.amount;
    }
  });

  const timeChartData = Object.entries(timeAnalysis)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value, fullName: name }));

  return (
    <div className="layout-wrapper">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        months={months}
        customGroups={customGroups}
        handleManageGroup={handleManageGroup}
        handleEditGroup={handleEditGroup}
        deleteGroup={deleteGroup}
        formatMonth={formatMonth}
      />

      <div className="main-wrapper">
        <Topbar 
          currentView={currentView}
          isGroupView={isGroupView}
          selectedGroupName={selectedGroupName}
          selectedGroupMonth={selectedGroupMonth}
          setSelectedGroupMonth={setSelectedGroupMonth}
          months={months}
          formatMonth={formatMonth}
          email={email}
        />

        <main className="content">
          {currentView === "expense_summary" ? (
            <ExpenseSummaryView 
              barChartData={barChartData}
              pieChartData={pieChartData}
              timeChartData={timeChartData}
              topExpenses={topExpenses}
              COLORS={COLORS}
            />
          ) : (
            <MonthlyReportView 
              isGroupView={isGroupView}
              selectedGroupName={selectedGroupName}
              monthExpense={monthExpense}
              monthByAccount={monthByAccount}
              displayTransactions={displayTransactions}
              selectedAccountFilter={selectedAccountFilter}
              setSelectedAccountFilter={setSelectedAccountFilter}
              handleUpdateCategory={handleUpdateCategory}
            />
          )}
        </main>
      </div>

      <GroupModal 
        showGroupModal={showGroupModal}
        setShowGroupModal={setShowGroupModal}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        selectedPayees={selectedPayees}
        setSelectedPayees={setSelectedPayees}
        allPayees={allPayees}
        saveGroup={saveGroup}
      />
    </div>
  );
}
