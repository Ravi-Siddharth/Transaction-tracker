
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  Rectangle,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./TransactionHistory.css";

const API = "/api";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view transaction history.");
          return;
        }

        const response = await axios.get(`${API}/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTransactions(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(
          err.response?.data?.error ||
          "Unable to load transaction history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateDifference =
        new Date(a.date).getTime() - new Date(b.date).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return String(a._id).localeCompare(String(b._id));
    });

    let runningBalance = 0;

    const data = sorted.map((transaction) => {
      const amount = Number(transaction.amount) || 0;
      const isIncome = transaction.type === "income";
      const change = isIncome ? amount : -amount;

      const start = runningBalance;
      runningBalance += change;

      return {
        name: transaction.title,
        date: String(transaction.date).slice(0, 10),
        type: transaction.type,
        value: change,
        amount,
        balance: runningBalance,
        waterfallRange: [
          Math.min(start, runningBalance),
          Math.max(start, runningBalance),
        ],
        isTotal: false,
      };
    });

    if (data.length > 0) {
      data.push({
        name: "Final Balance",
        date: "",
        type: "total",
        value: runningBalance,
        amount: Math.abs(runningBalance),
        balance: runningBalance,
        waterfallRange: [
          Math.min(0, runningBalance),
          Math.max(0, runningBalance),
        ],
        isTotal: true,
      });
    }

    return data;
  }, [transactions]);

  const renderBar = (props) => {
    const entry = props.payload;

    const fill = entry?.isTotal
      ? "#2878D0"
      : entry?.type === "income"
      ? "#20A464"
      : "#E34B4B";

    return <Rectangle {...props} fill={fill} />;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const entry = payload[0].payload;

    return (
      <div className="history-tooltip">
        <strong>{entry.name}</strong>

        {entry.date && <p>Date: {entry.date}</p>}

        {!entry.isTotal && (
          <p>
            Type:{" "}
            {entry.type === "income" ? "Income" : "Expense"}
          </p>
        )}

        <p>
          {entry.isTotal ? "Final balance" : "Amount"}:{" "}
          {entry.isTotal
            ? entry.balance.toLocaleString("en-IN")
            : `${entry.type === "income" ? "+" : "-"}${entry.amount.toLocaleString("en-IN")}`}
        </p>

        <p>
          Running balance: {entry.balance.toLocaleString("en-IN")}
        </p>
      </div>
    );
  };

  if (loading) {
    return <div className="transaction-history">Loading history...</div>;
  }

  if (error) {
    return (
      <div className="transaction-history history-error">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-history">
        <h2>Transaction History</h2>
        <p>No transactions available to display.</p>
      </div>
    );
  }

  return (
    <section className="transaction-history">
      <h2>Transaction History</h2>

      <p className="history-description">
        See how income and expenses affect your running balance.
      </p>

      <div className="history-legend">
        <span><i className="income-dot" /> Income</span>
        <span><i className="expense-dot" /> Expense</span>
        <span><i className="balance-dot" /> Final balance</span>
      </div>

      <div className="history-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 15, bottom: 65 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              interval={0}
              angle={-35}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              width={85}
              style={{
                fontSize:10
              }}
              tickFormatter={(value) =>
                Number(value).toLocaleString("en-IN")
              }
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="waterfallRange"
              name="Transaction"
              shape={renderBar}
              isAnimationActive={false}
              maxBarSize={55}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TransactionHistory;
