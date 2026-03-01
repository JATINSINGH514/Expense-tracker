import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

function Dashboard() {

  const navigate = useNavigate();

  // ================= STATES =================
  const [data, setData] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH DASHBOARD =================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/dashboard");
      setData(res.data);

    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ================= SAVE BUDGET =================
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();

    if (!budgetInput || budgetInput <= 0) {
      setError("Enter valid budget amount");
      return;
    }

    try {
      setSavingBudget(true);
      setError("");

      await API.post("/budget", { amount: budgetInput });

      setBudgetInput("");
      fetchDashboard();

    } catch {
      setError("Failed to save budget");
    } finally {
      setSavingBudget(false);
    }
  };

  // ================= LOADING =================
  if (loading) return <h2>⏳ Loading dashboard...</h2>;
  if (!data) return <h2>No data available</h2>;

  // ================= PIE DATA =================
  const pieData = [
    { name: "Income", value: data.totalIncome || 0 },
    { name: "Expense", value: data.totalExpense || 0 }
  ];

  const COLORS = ["#28a745", "#dc3545"];

  // ✅ CUSTOM LABEL (FIXED POSITION)
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name
  }) => {
    const RADIAN = Math.PI / 180;
    const radius =
      innerRadius + (outerRadius - innerRadius) * 0.6;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
          <text
            x={x}
            y={y}
            fill="#000"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="bold"
          >
            {`${name} ${(percent * 100).toFixed(0)}%`}
          </text>
    );
  };

  // ================= BAR DATA =================
  const barData = (data.monthlyData || []).map(item => ({
    month: `Month ${item._id.month}`,
    total: item.total
  }));

  // ================= BUDGET PROGRESS =================
  const percentUsed =
    data.budget > 0
      ? Math.min((data.totalExpense / data.budget) * 100, 100)
      : 0;

  const buttonStyle = {
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none"
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* NAVIGATION */}
      <button
        onClick={() => navigate("/transactions")}
        style={{ ...buttonStyle, marginTop: "10px" }}
      >
        Manage Transactions
      </button>

      {/* BUDGET INPUT */}
      <form onSubmit={handleBudgetSubmit} style={{ marginTop: "15px" }}>
        <input
          type="number"
          placeholder="Set Monthly Budget"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          style={{ padding: "8px" }}
        />

        <button
          type="submit"
          disabled={savingBudget}
          style={{ marginLeft: "10px" }}
        >
          {savingBudget ? "Saving..." : "Save Budget"}
        </button>
      </form>

      {/* ALERT */}
      {data.exceeded && (
        <div
          style={{
            backgroundColor: "#ffcccc",
            padding: "10px",
            marginTop: "15px",
            borderRadius: "5px"
          }}
        >
          ⚠️ Budget exceeded this month!
        </div>
      )}

      {/* CARDS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <Card title="Balance" value={data.balance} />
        <Card title="Income" value={data.totalIncome} bg="#d4edda" />
        <Card title="Expense" value={data.totalExpense} bg="#f8d7da" />
        <Card title="Monthly Budget" value={data.budget} bg="#fff3cd" />
      </div>

      {/* BUDGET BAR */}
      <div style={{ marginTop: "25px" }}>
        <h3>Budget Usage</h3>

        <div style={{ background: "#ddd", height: "20px", borderRadius: "10px" }}>
          <div
            style={{
              width: `${percentUsed}%`,
              background: data.exceeded ? "red" : "green",
              height: "100%",
              borderRadius: "10px",
              transition: "0.4s"
            }}
          />
        </div>

        <p>
          ₹ {data.totalExpense} / ₹ {data.budget}
        </p>
      </div>

      {/* CHARTS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "40px",
          paddingRight: "40px"
        }}
      >
        {/* PIE */}
        <div>
          <h3>Income vs Expense</h3>
          <PieChart width={320} height={300}>
            <Pie
              data={pieData}
              cx="65%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
              paddingAngle={3}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹ ${value}`} />
          </PieChart>
        </div>

        {/* BAR */}
        <div>
          <h3>Monthly Expenses</h3>
          <BarChart width={400} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#007bff" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

// ===== CARD COMPONENT =====
const Card = ({ title, value, bg }) => (
  <div
    style={{
      flex: 1,
      padding: "20px",
      borderRadius: "10px",
      backgroundColor: bg || "#e2e3e5",
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}
  >
    <h3>{title}</h3>
    <p>₹ {value}</p>
  </div>
);

export default Dashboard;