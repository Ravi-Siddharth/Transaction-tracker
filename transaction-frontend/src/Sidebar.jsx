import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import {Gauge, BadgeDollarSign, UserShield} from "lucide-react";


function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sidebar">

      <div className="sidebar-title">
        Transaction Tracker
      </div>

      <div className="profile-section">

        <div className="profile-icon">
          @
        </div>

        <h3>
          {user
            ? `${user.firstName || ""} ${user.lastName || ""}`
            : "User"}
        </h3>

        <p>
          {user?.email || "user@example.com"}
        </p>

      </div>

      <div className="sidebar-menu">

        <button onClick={() => navigate("/dashboard")}>
            <Gauge />
           Dashboard
        </button>

        <button onClick={() => navigate("/transactions")}>
            <BadgeDollarSign />
           Transactions
        </button>

        <button onClick={() => navigate("/profile")}>
            <UserShield />
           Profile
        </button>

      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        🚪 Logout
      </button>

    </div>
  );
}

export default Sidebar;