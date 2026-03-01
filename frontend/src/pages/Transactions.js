import { useEffect, useState } from "react";
import API from "../api/axios";

function Transactions() {

  // ================= STATES =================
  const [transactions, setTransactions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    type: "income",
    note: ""
  });

  // Filters + Pagination
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ================= FETCH =================
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/transactions", {
        params: {
          page,
          category: categoryFilter,
          startDate,
          endDate
        }
      });

      setTransactions(res.data.transactions);
     // calculate total pages manually
     const pages = Math.ceil(res.data.total / res.data.limit);
  setTotalPages(pages);
      } catch (err) {
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount) {
      setError("Category and Amount are required");
      return;
    }

    if (formData.amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editId) {
        await API.put(`/transactions/${editId}`, formData);
        setEditId(null);
      } else {
        await API.post("/transactions", formData);
      }

      setFormData({
        category: "",
        amount: "",
        type: "income",
        note: ""
      });

      fetchTransactions();

    } catch (err) {
      setError("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      setLoading(true);
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = (transaction) => {
    setFormData({
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      note: transaction.note || ""
    });

    setEditId(transaction._id);
  };

  // ================= EXPORT CSV =================
  const handleExport = async () => {
    try {
      const response = await API.get("/transactions/export", {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `transactions-${new Date().toISOString().slice(0,10)}.csv`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Export failed");
    }
  };

  const inputStyle = {
    padding: "8px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Transactions</h2>

      {/* ERROR MESSAGE */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* EXPORT */}
      <button onClick={handleExport} style={{ marginBottom: "15px" }}>
        Export CSV 📄
      </button>

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          style={inputStyle}
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />

        <input
          style={inputStyle}
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
        />

        <select
          style={inputStyle}
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          style={inputStyle}
          name="note"
          placeholder="Note"
          value={formData.note}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editId ? "Update" : "Add"}
        </button>
      </form>

      {/* ================= FILTERS ================= */}
      <div style={{ marginBottom: "20px" }}>
        <input
          style={inputStyle}
          placeholder="Filter category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />

        <input
          style={inputStyle}
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          style={inputStyle}
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button onClick={() => { setPage(1); fetchTransactions(); }}>
          Apply Filters
        </button>
      </div>

      {/* ================= TABLE ================= */}
      {loading ? (
        <p>⏳ Loading transactions...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff"
          }}
          border="1"
          cellPadding="10"
        >
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Note</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id}>
                  <td>{t.category}</td>
                  <td>₹ {t.amount}</td>
                  <td style={{ color: t.type === "income" ? "green" : "red" }}>
                    {t.type}
                  </td>
                  <td>{t.note}</td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(t)}>Edit</button>
                    <button onClick={() => handleDelete(t._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* ================= PAGINATION ================= */}
      <div style={{ marginTop: "20px" }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Transactions;