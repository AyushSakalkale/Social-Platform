import {Route, Routes} from "react-router-dom";
import HomePage from "./HomePage.jsx";
import LoginPage from "./LoginPage.jsx";
import SignUpPage from "./SignUpPage.jsx";
import NotificationPage from "./Notification.jsx";
import ProfilePage from "./ProfilePage.jsx";
import ForgetPasswordPage from "./ForgotPassword.jsx";
import ResetPasswordPage from "./ResetPassword.jsx";
function Body() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forget-password" element={<ForgetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
    </div>
  );
}

export default Body;
