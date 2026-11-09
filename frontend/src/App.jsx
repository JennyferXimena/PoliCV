import { BrowserRouter,Routes,Route } from "react-router-dom";

import PaginaInicio from "./pages/publicas/PaginaInicio";
import PaginaTerminosPrivacidad from "./pages/publicas/PaginaTerminosPrivacidad";

import PaginaInicioSesion from "./pages/autenticacion/PaginaInicioSesion";
import PaginaRegistro from "./pages/autenticacion/PaginaRegistro";
import PaginaRecuperarContrasena from "./pages/autenticacion/PaginaRecuperarContrasena";
import PaginaRestablecerContrasena from "./pages/autenticacion/PaginaRestablecerContrasena";
import PaginaVerificarCorreo from "./pages/autenticacion/PaginaVerificarCorreo";

import PaginaEstadisticasAdministrador from "./pages/administrador/PaginaEstadisticasAdministrador";
import PaginaUsuariosAdministrador from "./pages/administrador/PaginaUsuariosAdministrador";
import PaginaSeccionesAdministrador from "./pages/administrador/PaginaSeccionesAdministrador";
import PaginaPlantillasAdministrador from "./pages/administrador/PaginaPlantillasAdministrador";
import PaginaPropuestasAdministrador from "./pages/administrador/PaginaPropuestasAdministrador";
import PaginaPerfilAdministrador from "./pages/administrador/PaginaPerfilAdministrador";

import PaginaBienvenidaEstudiante from "./pages/estudiante/PaginaBienvenidaEstudiante";
import PaginaPanelEstudiante from "./pages/estudiante/PaginaPanelEstudiante";
import PaginaPerfil from "./pages/estudiante/PaginaPerfil";
import PaginaCurriculumsEstudiante from "./pages/estudiante/PaginaCurriculumsEstudiante";
import PaginaDetalleCurriculum from "./pages/estudiante/PaginaDetalleCurriculum";
import PaginaPropuestasEstudiante from "./pages/estudiante/PaginaPropuestasEstudiante";
import PaginaAsistenteIAEstudiante from "./pages/estudiante/PaginaAsistenteIAEstudiante";
import PaginaCrearCVconIA from "./pages/estudiante/PaginaCrearCVconIA";
import PaginaMejorarCVconIA from "./pages/estudiante/PaginaMejorarCVconIA";
import PaginaEstadisticasCurriculumsAdministrador from "./pages/administrador/PaginaEstadisticasCurriculumsAdministrador";

import RutaProtegida from "./components/rutas/RutaProtegida";
import GuardiaPerfilEstudiante from "./components/rutas/GuardiaPerfilEstudiante";

function RutaAdministrador({ children }) {
  return (
    <RutaProtegida allowedRoles={["Administrador"]}>
      {children}
    </RutaProtegida>
  );
}

function RutaEstudiante({ children }) {
  return (
    <RutaProtegida allowedRoles={["Estudiante"]}>
      <GuardiaPerfilEstudiante>
        {children}
      </GuardiaPerfilEstudiante>
    </RutaProtegida>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicio />} />

        <Route
          path="/terminos-y-privacidad"
          element={<PaginaTerminosPrivacidad />}
        />

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
          element={<PaginaVerificarCorreo />}
        />

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
          path="/admin/perfil"
          element={
            <RutaAdministrador>
              <PaginaPerfilAdministrador />
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

        <Route
          path="/bienvenida"
          element={
            <RutaProtegida allowedRoles={["Estudiante"]}>
              <PaginaBienvenidaEstudiante />
            </RutaProtegida>
          }
        />

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
        
        <Route
          path="/admin/curriculums-estadisticas"
          element={
            <RutaAdministrador>
              <PaginaEstadisticasCurriculumsAdministrador />
            </RutaAdministrador>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;