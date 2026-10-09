import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/iniciar-sesion"
          element={<LoginPage />}
        />

        <Route
          path="/registrarse"
          element={<RegisterPage />}
        />

        <Route
          path="/recuperar-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/perfil"
          element={<ProfilePage />}
        /> 
        <Route
          path="/restablecer-password"
          element={<ResetPasswordPage />}
        /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;