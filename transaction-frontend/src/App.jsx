import { BrowserRouter,Routes,Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";
import Profile from "./Profile";
import ForgotPassword from "./ForgotPassword";
import OtpVerification from "./OtpVerification";
import ResetPassword from "./ResetPassword";
function App() {
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
    </BrowserRouter>
  );
}
export default App;