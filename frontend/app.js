document.getElementById("btnPredecir").addEventListener("click", async () => {
  const n1 = Number(document.getElementById("nota1").value);
  const n2 = Number(document.getElementById("nota2").value);
  const n3 = Number(document.getElementById("nota3").value);

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerText = "Consultando modelo...";

  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        gusta_matematica: n1,
        horas_estudio: n2,
        dificultad_logica: n3
      })
    });

    const data = await response.json();
    resultadoDiv.innerText = "Resultado: Riesgo " + data.nivel + " (" + (data.riesgo * 100) + "%)";

  } catch (error) {
    resultadoDiv.innerText = "Error conectando con el backend";
    console.error(error);
  }
});