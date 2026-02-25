import { useState } from "react";
import { motion } from "framer-motion";
import "./Login.css";

function Login({ onLogin }) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al iniciar sesión");
      }

      const data = await res.json();

      if (data.success) {
        // Guardar usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify({
          id: data.id,
          nombre: data.nombre,
        }));
        
        // Llamar callback del padre
        onLogin({
          id: data.id,
          nombre: data.nombre,
        });
      } else {
        setError(data.mensaje);
      }
    } catch (err) {
      setError(err.message || "Error conectando con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <h1>Sistema Predictivo Académico</h1>
          <p className="subtitle">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="nombre">Tu Nombre</label>
            <motion.input
              id="nombre"
              type="text"
              placeholder="Ej: Juan García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              whileFocus={{ scale: 1.02 }}
              className="form-input"
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="login-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Validando..." : "Acceder"}
          </motion.button>
        </form>

        <div className="login-info">
          <p>
            <strong>Nota:</strong> Si es tu primera vez, se creará tu cuenta automáticamente.
          </p>
        </div>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon"></span>
            <span className="feature-text">Análisis de riesgo académico</span>
          </div>
          <div className="feature">
            <span className="feature-icon"></span>
            <span className="feature-text">Comparación de estudiantes</span>
          </div>
          <div className="feature">
            <span className="feature-icon"></span>
            <span className="feature-text">Predicción inteligente con IA</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
