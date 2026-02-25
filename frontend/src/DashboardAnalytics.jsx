import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from "recharts";

function DashboardAnalytics({ resultados }) {
  // Validaciones de seguridad
  if (!resultados || typeof resultados !== 'object' || Object.keys(resultados).length === 0) {
    return (
      <div style={{ 
        padding: '30px', 
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#b0b0b0'
      }}>
        <p>No hay datos disponibles para mostrar el dashboard</p>
      </div>
    );
  }

  const data = Object.entries(resultados).map(([materia, info]) => ({
    materia,
    probabilidad: info.probabilidad
  }));

  const promedio =
    data.reduce((acc, item) => acc + item.probabilidad, 0) / data.length;

  const materiaCritica = data.reduce((max, item) =>
    item.probabilidad > max.probabilidad ? item : max
  );

  /* ---------- SCORE SEMÁFORO ---------- */

  let scoreColor = "#2e7d32"; // verde
  let scoreText = "RIESGO BAJO";

  if (promedio > 60) {
    scoreColor = "#7a1c1c";
    scoreText = "RIESGO ALTO";
  } else if (promedio > 40) {
    scoreColor = "#ed6c02";
    scoreText = "RIESGO MEDIO";
  }

  const colores = ["#7a1c1c", "#a83232", "#c94c4c", "#e57373"];

  const distribucion = data.map((item, index) => ({
    name: item.materia,
    value: item.probabilidad,
    fill: colores[index % colores.length]
  }));

  return (
    <div className="dashboard-analytics">

      <h2>Panel Ejecutivo</h2>

      {/* KPI SECTION */}
      <div className="kpi-section">

        <motion.div 
          className="kpi-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Riesgo Global</h3>
          <div className="kpi-number">
            <CountUp end={promedio} decimals={1} duration={2} />%
          </div>
        </motion.div>

        <motion.div 
          className="kpi-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Materia Crítica</h3>
          <div className="kpi-number">
            {materiaCritica.materia.toUpperCase()}
          </div>
          <span className="kpi-sub">
            {materiaCritica.probabilidad}%
          </span>
        </motion.div>

        <motion.div 
          className="kpi-card"
          style={{ borderTop: `6px solid ${scoreColor}` }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Score Académico</h3>
          <div className="kpi-number" style={{ color: scoreColor }}>
            <CountUp end={100 - promedio} decimals={1} duration={2} />%
          </div>
          <span style={{ color: scoreColor, fontWeight: "bold" }}>
            {scoreText}
          </span>
        </motion.div>

      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid">

        <div className="chart-box">
          <h4>Comparación por Materia</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid stroke="#dcdcdc" strokeDasharray="3 3" />
              <XAxis dataKey="materia" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="probabilidad" fill="#7a1c1c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h4>Perfil de Riesgo (Radar)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="materia" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Riesgo"
                dataKey="probabilidad"
                stroke="#7a1c1c"
                fill="#7a1c1c"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box full-width">
          <h4>Distribución de Riesgo</h4>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={distribucion}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {distribucion.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default DashboardAnalytics;