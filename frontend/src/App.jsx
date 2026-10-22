import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSectionsPage from "./pages/AdminSectionsPage";
import AdminTemplatesPage from "./pages/AdminTemplatesPage";
import StudentProposalsPage from "./pages/StudentProposalsPage";
import AdminProposalsPage from "./pages/AdminProposalsPage";
import AdminStatisticsPage from "./pages/AdminStatisticsPage";
import StudentCVPage from "./pages/StudentCVPage";
import StudentCVDetailPage from "./pages/StudentCVDetailPage";
import StudentAIAssistantPage from "./pages/StudentAIAssistantPage";
import StudentAICreateCVPage from "./pages/StudentAICreateCVPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

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
          path="/restablecer-password"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/perfil"
          element={<ProfilePage />}
        />

        <Route
          path="/estudiante"
          element={
            <ProtectedRoute allowedRoles={["Estudiante"]}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/secciones"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminSectionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/plantillas"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminTemplatesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/propuestas"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminProposalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/estadisticas"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminStatisticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estudiante/propuestas"
          element={
            <ProtectedRoute allowedRoles={["Estudiante"]}>
              <StudentProposalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estudiante/curriculums"
          element={
            <ProtectedRoute allowedRoles={["Estudiante"]}>
              <StudentCVPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estudiante/curriculums/:id"
          element={
            <ProtectedRoute allowedRoles={["Estudiante"]}>
              <StudentCVDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estudiante/asistente-ia"
          element={
            <ProtectedRoute allowedRoles={["Estudiante"]}>
              <StudentAIAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estudiante/crear-cv-ia"
          element={
            <ProtectedRoute allowedRoles={["Estudiante"]}>
              <StudentAICreateCVPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;