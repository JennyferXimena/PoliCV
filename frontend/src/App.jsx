import { BrowserRouter, Routes, Route } from "react-router-dom";

/* PÁGINAS PÚBLICAS */
import PaginaInicio from "./pages/publicas/PaginaInicio";
import PaginaTerminosPrivacidad from "./pages/publicas/PaginaTerminosPrivacidad";

/* AUTENTICACIÓN */
import PaginaInicioSesion from "./pages/autenticacion/PaginaInicioSesion";
import PaginaRegistro from "./pages/autenticacion/PaginaRegistro";
import PaginaRecuperarContrasena from "./pages/autenticacion/PaginaRecuperarContrasena";
import PaginaRestablecerContrasena from "./pages/autenticacion/PaginaRestablecerContrasena";
import PaginaVerificarCorreo from "./pages/autenticacion/PaginaVerificarCorreo";

/* ADMINISTRADOR */
import PaginaEstadisticasAdministrador from "./pages/administrador/PaginaEstadisticasAdministrador";
import PaginaUsuariosAdministrador from "./pages/administrador/PaginaUsuariosAdministrador";
import PaginaSeccionesAdministrador from "./pages/administrador/PaginaSeccionesAdministrador";
import PaginaPlantillasAdministrador from "./pages/administrador/PaginaPlantillasAdministrador";
import PaginaPropuestasAdministrador from "./pages/administrador/PaginaPropuestasAdministrador";

/* ESTUDIANTE */
import PaginaBienvenidaEstudiante from "./pages/estudiante/PaginaBienvenidaEstudiante";
import PaginaPanelEstudiante from "./pages/estudiante/PaginaPanelEstudiante";
import PaginaPerfil from "./pages/estudiante/PaginaPerfil";
import PaginaCurriculumsEstudiante from "./pages/estudiante/PaginaCurriculumsEstudiante";
import PaginaDetalleCurriculum from "./pages/estudiante/PaginaDetalleCurriculum";
import PaginaPropuestasEstudiante from "./pages/estudiante/PaginaPropuestasEstudiante";
import PaginaAsistenteIAEstudiante from "./pages/estudiante/PaginaAsistenteIAEstudiante";
import PaginaCrearCVconIA from "./pages/estudiante/PaginaCrearCVconIA";
import PaginaMejorarCVconIA from "./pages/estudiante/PaginaMejorarCVconIA";

/* PROTECCIÓN DE RUTAS */
import RutaProtegida from "./components/rutas/RutaProtegida";
import GuardiaPerfilEstudiante from "./components/rutas/GuardiaPerfilEstudiante";

/* =========================================================
   PROTECCIÓN ADMINISTRADOR
========================================================= */
function RutaAdministrador({ children }) {
  return (
    <RutaProtegida allowedRoles={["Administrador"]}>
      {children}
    </RutaProtegida>
  );
}

/* =========================================================
   PROTECCIÓN ESTUDIANTE
   Verifica:
   1. Que tenga rol Estudiante
   2. Que haya completado su configuración inicial
========================================================= */
function RutaEstudiante({ children }) {
  return (
    <RutaProtegida allowedRoles={["Estudiante"]}>
      <GuardiaPerfilEstudiante>
        {children}
      </GuardiaPerfilEstudiante>
    </RutaProtegida>
  );
}

/* =========================================================
   APP
========================================================= */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== PÚBLICAS ==================== */}
        <Route path="/" element={<PaginaInicio />} />

        <Route
          path="/terminos-y-privacidad"
          element={<PaginaTerminosPrivacidad />}
        />

        {/* ================= AUTENTICACIÓN ================= */}
        <Route
          path="/iniciar-sesion"
          element={<PaginaInicioSesion />}
        />

        <Route
          path="/registrarse"
          element={<PaginaRegistro />}
        />

        <Route
          path="/recuperar-contrasena"
          element={<PaginaRecuperarContrasena />}
        />

        <Route
          path="/restablecer-contrasena"
          element={<PaginaRestablecerContrasena />}
        />
        <Route 
        path="/verificar-correo" 
        element={<PaginaVerificarCorreo />} />

        {/* =================================================
            ADMINISTRADOR
        ================================================= */}

        {/* El administrador inicia directamente en Estadísticas */}
        <Route
          path="/admin"
          element={
            <RutaAdministrador>
              <PaginaEstadisticasAdministrador />
            </RutaAdministrador>
          }
        />

        <Route
          path="/admin/estadisticas"
          element={
            <RutaAdministrador>
              <PaginaEstadisticasAdministrador />
            </RutaAdministrador>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <RutaAdministrador>
              <PaginaUsuariosAdministrador />
            </RutaAdministrador>
          }
        />

        <Route
          path="/admin/secciones"
          element={
            <RutaAdministrador>
              <PaginaSeccionesAdministrador />
            </RutaAdministrador>
          }
        />

        <Route
          path="/admin/plantillas"
          element={
            <RutaAdministrador>
              <PaginaPlantillasAdministrador />
            </RutaAdministrador>
          }
        />

        <Route
          path="/admin/propuestas"
          element={
            <RutaAdministrador>
              <PaginaPropuestasAdministrador />
            </RutaAdministrador>
          }
        />

        {/* =================================================
            ESTUDIANTE - PRIMER INGRESO
        ================================================= */}

        {/*
          Esta página NO usa GuardiaPerfilEstudiante porque precisamente se muestra cuando el perfil todavía
          no está completado.
        */}
        <Route
          path="/bienvenida"
          element={
            <RutaProtegida allowedRoles={["Estudiante"]}>
              <PaginaBienvenidaEstudiante />
            </RutaProtegida>
          }
        />

        {/* =================================================
            ESTUDIANTE - PERFIL COMPLETADO
        ================================================= */}

        <Route
          path="/estudiante"
          element={
            <RutaEstudiante>
              <PaginaPanelEstudiante />
            </RutaEstudiante>
          }
        />

        <Route
          path="/perfil"
          element={
            <RutaEstudiante>
              <PaginaPerfil />
            </RutaEstudiante>
          }
        />

        <Route
          path="/estudiante/curriculums"
          element={
            <RutaEstudiante>
              <PaginaCurriculumsEstudiante />
            </RutaEstudiante>
          }
        />

        <Route
          path="/estudiante/curriculums/:id"
          element={
            <RutaEstudiante>
              <PaginaDetalleCurriculum />
            </RutaEstudiante>
          }
        />

        <Route
          path="/estudiante/propuestas"
          element={
            <RutaEstudiante>
              <PaginaPropuestasEstudiante />
            </RutaEstudiante>
          }
        />

        {/* ==================== IA ==================== */}

        <Route
          path="/estudiante/asistente-ia"
          element={
            <RutaEstudiante>
              <PaginaAsistenteIAEstudiante />
            </RutaEstudiante>
          }
        />

        <Route
          path="/estudiante/crear-cv-ia"
          element={
            <RutaEstudiante>
              <PaginaCrearCVconIA />
            </RutaEstudiante>
          }
        />

        <Route
          path="/estudiante/asistente-ia/mejorar"
          element={
            <RutaEstudiante>
              <PaginaMejorarCVconIA />
            </RutaEstudiante>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;