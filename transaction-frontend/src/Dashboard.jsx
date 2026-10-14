import React, { useState, useEffect } from "react";
import axios from "axios";
import TransactionHistory from "./TransactionHistory";
import Sidebar from "./Sidebar";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import "./App.css";

function Dashboard() {
  const [transaction, setTransaction] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [date, setDate] = useState("");
  const [editId, setEditId] = useState(null);


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Please log in to view transactions.");
          return;
        }

        const res = await axios.get(
          "/api/transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTransaction(
          Array.isArray(res.data) ? res.data : []
        );
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };

    fetchTransactions();
  }, []);

  
  const totalCredit = transaction
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const totalDebit = transaction
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);
  const pieData = [
    {
      name: "Credit",
      value: totalCredit,
      fill: "black",
    },
    {
      name: "Debit",
      value: totalDebit,
      fill: "red",
    },
  ];

  
  const addTransaction = async (e) => {
    e.preventDefault();

    if (!title.trim() || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than zero");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in first.");
        return;
      }

      const transactionData = {
        title: title.trim(),
        amount: Number(amount),
        type,
        date,
      };

      if (editId) {
        const res = await axios.put(
          `/api/transactions/${editId}`,
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedTransaction =
          res.data.transaction || res.data;

        setTransaction((previous) =>
          previous.map((item) =>
            item._id === editId ? updatedTransaction : item
          )
        );

        setEditId(null);
      } else {
        const res = await axios.post(
          "/api/transactions",
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newTransaction =
          res.data.transaction || res.data;

        setTransaction((previous) => [
          ...previous,
          newTransaction,
        ]);
      }

      setTitle("");
      setAmount("");
      setType("income");
      setDate("");
    } catch (err) {
      console.error("Failed to save transaction:", err);
      alert(
        err.response?.data?.error ||
        "Unable to save transaction."
      );
    }
  };

  
  const editTransaction = (item) => {
    setEditId(item._id);
    setTitle(item.title);
    setAmount(String(item.amount));
    setType(item.type);

    
    const rawDate = String(item.date || "").slice(0, 10);
    let formattedDate = rawDate;

    if (/^\d{2}-\d{2}-\d{4}$/.test(rawDate)) {
      const [day, month, year] = rawDate.split("-");
      formattedDate = `${year}-${month}-${day}`;
    }

    setDate(formattedDate);
  };

  
  const cancelEdit = () => {
    setEditId(null);
    setTitle("");
    setAmount("");
    setType("income");
    setDate("");
  };

  
  const deleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `/api/transactions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransaction((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (editId === id) {
        cancelEdit();
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert(
        err.response?.data?.error ||
        "Unable to delete transaction."
      );
    }
  };

  
  const totalIncome = totalCredit;
  const totalExpense = totalDebit;
  const balance = totalIncome - totalExpense;

  return (
    <div className="app">
    
      <Sidebar />

      
      <div className="dashboard-content">
        <nav className="navbar">
          <h2>Transaction Results</h2>
        </nav>

        <div className="container">
          <h1>Dashboard</h1>

          
          <div className="summary">
            <div className="card">
              <h3>Current Balance</h3>
              <p>
                ₹{balance.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="card">
              <h3>Total Income</h3>
              <p>
                ₹{totalIncome.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="card">
              <h3>Total Expense</h3>
              <p>
                ₹{totalExpense.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          
          <div className="form-transaction">
            <h2>
              {editId ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <form onSubmit={addTransaction}>
              <input
                type="text"
                placeholder="Transaction title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="number"
                placeholder="Amount"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <button type="submit" className="add-btn">
                {editId ? "Update Transaction" : "Add Transaction"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

        
          <div className="transactions">
            <h2>Transactions</h2>

            {transaction.length === 0 ? (
              <p>No transaction found</p>
            ) : (
              transaction.map((item) => (
                <div className="transaction" key={item._id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{String(item.date).slice(0, 10)}</p>
                  </div>

                  <div>
                    <strong
                      className={
                        item.type === "income" ? "income" : "expense"
                      }
                    >
                      {item.type === "income" ? "+" : "-"}
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </strong>

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => editTransaction(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deleteTransaction(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          
          <div className="chart-container">
            <h2>Credit Vs Debit</h2>

            <div className="pie-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="75%"
                    startAngle={180}
                    endAngle={0}
                    outerRadius="75%"
                    label
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />

                  <Tooltip
                    formatter={(value, name) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      name,
                    ]}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
