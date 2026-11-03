import {
  useEffect,
  useState
} from "react";

import {
  Navigate
} from "react-router-dom";

import api from "../services/api";


function StudentProfileGuard({
  children
}) {

  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    perfilCompletado,
    setPerfilCompletado
  ] = useState(false);


  const [
    error,
    setError
  ] = useState(false);


  useEffect(() => {

    let activo = true;


    const verificarPerfil =
      async () => {

        try {

          const response =
            await api.get(
              "/configuracion-inicial"
            );


          if (!activo) {
            return;
          }


          const completado =
            Boolean(
              response.data
                ?.perfil
                ?.perfil_completado
            );


          setPerfilCompletado(
            completado
          );


        } catch (error) {

          console.error(
            "Error al verificar el perfil:",
            error
          );


          if (activo) {
            setError(true);
          }


        } finally {

          if (activo) {
            setCargando(false);
          }

        }

      };


    verificarPerfil();


    return () => {
      activo = false;
    };

  }, []);


  /* =========================================================
     CARGANDO
  ========================================================= */

  if (cargando) {

    return (
      <main
        style={{
          padding: "40px"
        }}
      >
        Verificando información del estudiante...
      </main>
    );

  }


  /* =========================================================
     ERROR DE SESIÓN
  ========================================================= */

  if (error) {

    return (
      <Navigate
        to="/iniciar-sesion"
        replace
      />
    );

  }


  /* =========================================================
     PERFIL NO COMPLETADO
  ========================================================= */

  if (!perfilCompletado) {

    return (
      <Navigate
        to="/bienvenida"
        replace
      />
    );

  }


  /* =========================================================
     PERFIL COMPLETADO
  ========================================================= */

  return children;
}


export default StudentProfileGuard;