import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
  ScatterChart,
  Scatter
} from "recharts";

function StudentsComparison({ usuario }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/compare");
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setEstudiantes(data.estudiantes || []);
      setError(null);
    } catch (err) {
      setError("Error al cargar la comparación: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="comparison-container"><p>Cargando...</p></div>;
  }

  if (error) {
    return (
      <div className="comparison-container">
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={fetchStudents}>Reintentar</button>
      </div>
    );
  }

  const colores = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", "#AA96DA", "#FCBAD3", "#A8E6CF"];

  // Datos para gráfico de barras (comparación de riesgo)
  const riesgoData = estudiantes.map((est) => ({
    nombre: est.nombre.substring(0, 3),
    riesgo_global: est.riesgo_global,
    nombreCompleto: est.nombre,
  }));

  // Datos para scatter plot (múltiples variables)
  const scatterData = estudiantes.map((est, idx) => ({
    x: est.gusta_matematica || 0,
    y: est.horas_estudio || 0,
    name: est.nombre,
    fill: colores[idx % 3],
    riesgo: est.riesgo_global,
  }));

  // Tabla detallada
  const promedioRiesgo =
    estudiantes.reduce((sum, est) => sum + est.riesgo_global, 0) / estudiantes.length;
  
  const maxRiesgo = Math.max(...estudiantes.map((est) => est.riesgo_global));
  const minRiesgo = Math.min(...estudiantes.map((est) => est.riesgo_global));

  return (
    <div className="comparison-container">
      <h2>Comparación de Estudiantes</h2>

      {/* KPIs */}
      <div className="kpi-row">
        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Riesgo Promedio</h3>
          <p className="kpi-value">{promedioRiesgo.toFixed(1)}%</p>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Riesgo Máximo</h3>
          <p className="kpi-value" style={{ color: "#d32f2f" }}>
            {maxRiesgo.toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Riesgo Mínimo</h3>
          <p className="kpi-value" style={{ color: "#388e3c" }}>
            {minRiesgo.toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Total de Estudiantes</h3>
          <p className="kpi-value">{estudiantes.length}</p>
        </motion.div>
      </div>

      {/* GRÁFICO DE RIESGOS */}
      <motion.div
        className="chart-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Comparación de Riesgo Global</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riesgoData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff40" />
            <XAxis dataKey="nombre" stroke="#ffffff" style={{ fontSize: "14px", fontWeight: "bold" }} />
            <YAxis stroke="#ffffff" style={{ fontSize: "14px", fontWeight: "bold" }} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  return (
                    <div className="tooltip">
                      <p>{payload[0].payload.nombreCompleto}</p>
                      <p>Riesgo: {payload[0].value.toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="riesgo_global" radius={[8, 8, 0, 0]}>
              {riesgoData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.riesgo_global > 60 ? "#FF6B6B" : entry.riesgo_global > 40 ? "#FFD93D" : "#6BCB77"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* GRÁFICO SCATTER */}
      <motion.div
        className="chart-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Relación: Gusto por Matemática vs Horas de Estudio</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff40" />
            <XAxis
              dataKey="x"
              name="Gusto Matemática (1-5)"
              stroke="#ffffff"
              style={{ fontSize: "14px", fontWeight: "bold" }}
              label={{ value: "Gusto Matemática", position: "insideBottomRight", offset: -5, fill: "#ffffff", fontSize: 14, fontWeight: "bold" }}
            />
            <YAxis
              dataKey="y"
              name="Horas Estudio"
              stroke="#ffffff"
              style={{ fontSize: "14px", fontWeight: "bold" }}
              label={{ value: "Horas Estudio", angle: -90, position: "insideLeft", fill: "#ffffff", fontSize: 14, fontWeight: "bold" }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="tooltip">
                      <p><strong>{data.name}</strong></p>
                      <p>Gusto Matemática: {data.x}</p>
                      <p>Horas Estudio: {data.y}</p>
                      <p>Riesgo Global: {data.riesgo.toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Estudiantes" data={scatterData}>
              {scatterData.map((entry, index) => (
                <Cell key={`scatter-${index}`} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      {/* TABLA DETALLADA */}
      <motion.div
        className="table-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3>Detalle de Estudiantes</h3>
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Riesgo Global</th>
                <th>Gusto Mat.</th>
                <th>Gusto Quím.</th>
                <th>Horas Est.</th>
                <th>Dificultad Lógica</th>
                <th>Pierde Mat.</th>
                <th>Pierde Quím.</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est, idx) => {
                const esUsuarioActual = usuario && est.nombre === usuario.nombre;
                
                return (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                    style={{
                      backgroundColor: esUsuarioActual
                        ? "rgba(0, 198, 255, 0.15)"
                        : est.riesgo_global > 60
                        ? "#ffebee"
                        : est.riesgo_global > 40
                        ? "#fff3e0"
                        : "#e8f5e9",
                      border: esUsuarioActual ? "2px solid rgba(0, 198, 255, 0.4)" : "none",
                      fontWeight: esUsuarioActual ? "bold" : "normal",
                    }}
                  >
                    <td className="nombre-col">
                      <strong>{est.nombre}</strong>
                      {esUsuarioActual && <span className="user-badge-small">TÚ</span>}
                    </td>
                    <td>
                      <span
                        className="riesgo-badge"
                        style={{
                          backgroundColor:
                            est.riesgo_global > 60
                              ? "#FF6B6B"
                              : est.riesgo_global > 40
                              ? "#FFD93D"
                              : "#6BCB77",
                          color: est.riesgo_global > 40 ? "#000" : "white",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        {est.riesgo_global.toFixed(1)}%
                      </span>
                    </td>
                    <td>{est.gusta_matematica || "-"}</td>
                    <td>{est.gusta_quimica || "-"}</td>
                    <td>{est.horas_estudio || "-"}</td>
                    <td>{est.dificultad_logica || "-"}</td>
                    <td>{est.pierde_matematica === 1 ? "✓" : "-"}</td>
                    <td>{est.pierde_quimica === 1 ? "✓" : "-"}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        className="action-buttons"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <button onClick={fetchStudents} className="refresh-btn">
          Actualizar datos
        </button>
      </motion.div>
    </div>
  );
}

export default StudentsComparison;
