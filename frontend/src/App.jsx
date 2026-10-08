import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;