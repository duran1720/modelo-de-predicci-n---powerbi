import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./App.css";
import DashboardAnalytics from "./DashboardAnalytics";
import StudentsComparison from "./StudentsComparison";
import Login from "./Login";


function App() {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    gusto_numeros: "",
    gusto_lectura: "",
    gusto_arte: "",
    facilidad_logica: "",
    constancia_estudio: "",
    organizacion: "",
  });

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("predict"); // "predict" o "compare"

  // Verificar si hey usuario guardado en localStorage al cargar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error("Error al parsear usuario:", e);
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  const handleLogin = (usuarioData) => {
    setUsuario(usuarioData);
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
    setResultado(null);
    setViewMode("predict");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (
      !form.gusto_numeros ||
      !form.gusto_lectura ||
      !form.gusto_arte ||
      !form.facilidad_logica ||
      !form.constancia_estudio ||
      !form.organizacion
    ) {
      alert("Por favor, completa todos los campos antes de predecir");
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const payload = {
        usuario_id: usuario.id,
        usuario_nombre: usuario.nombre,
        gusto_estudio: form.gusto_numeros,
        habito_estudio: form.constancia_estudio,
        razonamiento_logico: form.facilidad_logica,
        creatividad: form.gusto_arte,
        concentracion_memoria: form.gusto_lectura,
        responsabilidad: form.organizacion,
      };

      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Error HTTP: ${res.status} - ${errorData}`);
      }

      const data = await res.json();
      
      if (!data || !data.resultados) {
        throw new Error("Error: Respuesta inválida del servidor");
      }
      
      if (data.error) {
        throw new Error(`Error del servidor: ${data.error}`);
      }
      
      setResultado(data);
    } catch (err) {
      alert("Error conectando con el backend: " + err.message);
      console.error(err);
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  // Si no hay usuario autenticado, mostrar login
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* HEADER CON DATOS DEL USUARIO Y LOGOUT */}
      <div className="app-header">
        <div className="header-left">
          <h1>Sistema Predictivo Académico</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-badge">{usuario.nombre}</span>
            <span className="user-id">ID: {usuario.id}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </div>

      <p className="subtitle">
        Responde la encuesta y descubre qué materias requieren mayor atención
      </p>

      {/* TABS DE NAVEGACIÓN */}
      <div className="nav-tabs">
        <button
          className={`tab-btn ${viewMode === "predict" ? "active" : ""}`}
          onClick={() => setViewMode("predict")}
        >
          Predicción Personal
        </button>
        <button
          className={`tab-btn ${viewMode === "compare" ? "active" : ""}`}
          onClick={() => setViewMode("compare")}
        >
          Comparación de Estudiantes
        </button>
      </div>

      {/* VISTA DE PREDICCIÓN */}
      {viewMode === "predict" ? (
        <>
          {/* FORMULARIO */}
          <div className="form">
        <label>¿Cómo te sientes con los números y cálculos?</label>
        <select name="gusto_numeros" onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="bajo">Me cuestan mucho</option>
          <option value="medio">Normal</option>
          <option value="alto">Se me dan bien</option>
        </select>

        <label>¿Te gusta leer y analizar textos?</label>
        <select name="gusto_lectura" onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="bajo">Muy poco</option>
          <option value="medio">A veces</option>
          <option value="alto">Mucho</option>
        </select>

        <label>¿Te interesan actividades artísticas o creativas?</label>
        <select name="gusto_arte" onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="bajo">No mucho</option>
          <option value="medio">Algo</option>
          <option value="alto">Muchísimo</option>
        </select>

        <label>¿Qué tan fácil se te hace razonar problemas lógicos?</label>
        <select name="facilidad_logica" onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="bajo">Muy difícil</option>
          <option value="medio">Normal</option>
          <option value="alto">Fácil</option>
        </select>

        <label>¿Eres constante con el estudio?</label>
        <select name="constancia_estudio" onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="bajo">Casi nunca</option>
          <option value="medio">A veces</option>
          <option value="alto">Siempre</option>
        </select>

        <label>¿Qué tan organizado eres con tareas y tiempos?</label>
        <select name="organizacion" onChange={handleChange}>
          <option value="">Selecciona</option>
          <option value="bajo">Desorganizado</option>
          <option value="medio">Normal</option>
          <option value="alto">Muy organizado</option>
        </select>

        <button onClick={submit} disabled={loading}>
          {loading ? "Analizando..." : "Predecir"}
        </button>
          </div>

          {/* RESULTADOS */}
          {resultado && (
            <div className="results">
              <h2>Resultado del Análisis</h2>

              <div className="cards">
                {Object.entries(resultado.resultados).map(([materia, data]) => {
                  const esCritica = resultado.materia_critica === materia;

                  return (
                    <motion.div
                      key={materia}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`card moderna ${data.riesgo.toLowerCase()} ${
                        esCritica ? "critical-glow" : ""
                      }`}
                    >
                      <div className="card-header">
                        <h3>{materia.toUpperCase()}</h3>
                        {esCritica && (
                          <span className="badge">RIESGO CRÍTICO</span>
                        )}
                      </div>

                      <div className="porcentaje">
                        {data.probabilidad}%
                      </div>

                      <div className="nivel">{data.riesgo}</div>

                      <div className="bloque">
                        <strong>Motivo</strong>
                        <p>{data.motivo}</p>
                      </div>

                      <div className="bloque">
                        <strong>Recomendación</strong>
                        <p>{data.recomendacion}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Insight Inteligente */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="insight-box"
              >
                <h3>Insight Inteligente</h3>
                <p>
                  La materia con mayor riesgo es{" "}
                  <strong>{resultado.materia_critica}</strong>.
                  Se recomienda reforzar hábitos de estudio,
                  realizar seguimiento semanal y aplicar estrategias
                  de mejora personalizadas.
                </p>
              </motion.div>

              {/* Dashboard Futurista */}
              <DashboardAnalytics resultados={resultado.resultados} />
            </div>
          )}
        </>
      ) : (
        <>
          {/* VISTA DE COMPARACIÓN */}
          <StudentsComparison usuario={usuario} />
        </>
      )}
    </div>
  );
}

export default App;