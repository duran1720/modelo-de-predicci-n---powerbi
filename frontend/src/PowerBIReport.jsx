function PowerBIReport() {
  return (
    <section className="powerbi-section">

      <div className="powerbi-header">
        <h2> Análisis Institucional Avanzado</h2>
        <p>Visualización estratégica generada en Power BI</p>
      </div>

      <div className="powerbi-container">
        <iframe
          title="Power BI Dashboard"
          src="https://app.powerbi.com/view?r=eyJrIjoiZWMzZDhhMmMtZGNlNS00ZmFlLTg2NmYtZGUyNWRjOTY4MWY4IiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9"
          allowFullScreen
        ></iframe>
      </div>

    </section>
  );
}

export default PowerBIReport;
