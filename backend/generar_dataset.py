import pandas as pd
import random

num_estudiantes = 300
materias = ["Matemáticas", "Lenguaje", "Artística", "Sociales"]

data = []

for i in range(1, num_estudiantes + 1):
    estudiante_id = f"EST_{i:03d}"
    
    # Generar probabilidades simuladas
    probabilidades = {m: random.randint(10, 90) for m in materias}
    
    # Determinar materia crítica
    materia_critica = max(probabilidades, key=probabilidades.get)
    
    for materia in materias:
        prob = probabilidades[materia]
        
        if prob >= 70:
            nivel = "alto"
        elif prob >= 40:
            nivel = "medio"
        else:
            nivel = "bajo"
        
        data.append({
            "estudiante_id": estudiante_id,
            "materia": materia,
            "probabilidad_riesgo": prob,
            "nivel_riesgo": nivel,
            "materia_critica": materia_critica
        })

df = pd.DataFrame(data)

df.to_csv("predicciones_estudiantes.csv", index=False)

print("Dataset generado correctamente ✅")