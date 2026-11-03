import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../services/api";

import "../styles/auth.css";


function LoginPage() {

  const navigate =
    useNavigate();


  const [
    email,
    setEmail
  ] = useState("");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    recordarme,
    setRecordarme
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    cargando,
    setCargando
  ] = useState(false);


  /* =========================================================
     INICIAR SESIÓN
  ========================================================= */

  const handleSubmit =
    async (
      e
    ) => {

      e.preventDefault();


      setError("");

      setCargando(true);


      try {

        /* ===================================================
           LOGIN
        =================================================== */

        const response =
          await api.post(
            "/auth/login",
            {
              email,
              password
            }
          );


        const {
          token,
          usuario
        } =
          response.data;


        /* ===================================================
           GUARDAR SESIÓN
        =================================================== */

        if (recordarme) {

          localStorage.setItem(
            "token",
            token
          );


          localStorage.setItem(
            "usuario",
            JSON.stringify(
              usuario
            )
          );


          sessionStorage.removeItem(
            "token"
          );

          sessionStorage.removeItem(
            "usuario"
          );


        } else {

          sessionStorage.setItem(
            "token",
            token
          );


          sessionStorage.setItem(
            "usuario",
            JSON.stringify(
              usuario
            )
          );


          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "usuario"
          );

        }


        /* ===================================================
           ADMINISTRADOR
        =================================================== */

        if (
          usuario.rol ===
          "Administrador"
        ) {

          navigate(
            "/admin",
            {
              replace: true
            }
          );

          return;

        }


        /* ===================================================
           ESTUDIANTE
        =================================================== */

        if (
          usuario.rol ===
          "Estudiante"
        ) {

          /*
            Ya tenemos el token guardado,
            por eso podemos consultar
            /configuracion-inicial.
          */

          const perfilResponse =
            await api.get(
              "/configuracion-inicial"
            );


          const perfil =
            perfilResponse.data
              ?.perfil;


          const completado =
            Boolean(
              perfil
                ?.perfil_completado
            );


          /* ===============================================
             ACTUALIZAMOS USUARIO GUARDADO
          =============================================== */

          const usuarioActualizado = {
            ...usuario,

            perfil_completado:
              completado,

            id_carrera:
              perfil?.id_carrera ||
              null,

            carrera:
              perfil?.carrera ||
              null,

            estado_academico:
              perfil?.estado_academico ||
              null
          };


          if (recordarme) {

            localStorage.setItem(
              "usuario",
              JSON.stringify(
                usuarioActualizado
              )
            );


          } else {

            sessionStorage.setItem(
              "usuario",
              JSON.stringify(
                usuarioActualizado
              )
            );

          }


          /* ===============================================
             PRIMER INICIO
          =============================================== */

          if (!completado) {

            navigate(
              "/bienvenida",
              {
                replace: true
              }
            );

            return;

          }


          /* ===============================================
             PERFIL YA CONFIGURADO
          =============================================== */

          navigate(
            "/estudiante",
            {
              replace: true
            }
          );


          return;

        }


        /* ===================================================
           ROL DESCONOCIDO
        =================================================== */

        setError(
          "El usuario no tiene un rol válido"
        );


      } catch (error) {

        console.error(
          "Error al iniciar sesión:",
          error
        );


        setError(
          error.response
            ?.data
            ?.mensaje ||

          "No se pudo iniciar sesión"
        );


      } finally {

        setCargando(false);

      }

    };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <main className="auth-page">


      {/* =====================================================
          IMAGEN IZQUIERDA
      ===================================================== */}

      <section className="auth-left">


        <div className="login-left">


          <img
            src="/images/login.png"
            alt="PoliCV"
            className="login-left-image"
          />


        </div>


      </section>


      {/* =====================================================
          LOGIN
      ===================================================== */}

      <section className="auth-right">


        <div className="auth-box">


          <h1>
            Iniciar sesión
          </h1>


          <p className="subtitle">

            ¡Bienvenido de nuevo!
            Ingresa para continuar.

          </p>


          <form
            onSubmit={
              handleSubmit
            }
          >


            <label>
              Correo institucional
            </label>


            <input
              type="email"
              placeholder="usuario@epn.edu.ec"
              value={
                email
              }
              onChange={
                (e) =>
                  setEmail(
                    e.target.value
                  )
              }
              required
            />


            <label>
              Contraseña
            </label>


            <input
              type="password"
              placeholder="Contraseña"
              value={
                password
              }
              onChange={
                (e) =>
                  setPassword(
                    e.target.value
                  )
              }
              required
            />


            <div className="login-options">


              <label className="remember">


                <input
                  type="checkbox"
                  checked={
                    recordarme
                  }
                  onChange={
                    (e) =>
                      setRecordarme(
                        e.target.checked
                      )
                  }
                />


                Recordarme


              </label>


              <Link
                to="/recuperar-password"
              >

                ¿Olvidaste tu contraseña?

              </Link>


            </div>


            {error && (

              <p className="message error">

                {error}

              </p>

            )}


            <button
              type="submit"
              className="primary-button"
              disabled={
                cargando
              }
            >

              {cargando
                ? "Ingresando..."
                : "Iniciar sesión"}

            </button>


          </form>


          <p className="bottom-text">

            ¿No tienes una cuenta?{" "}


            <Link
              to="/registrarse"
            >

              Crear cuenta

            </Link>


          </p>


        </div>


      </section>


    </main>

  );

}


export default LoginPage;

