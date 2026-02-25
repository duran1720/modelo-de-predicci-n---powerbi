MAPEO_RESPUESTAS = {
    "bajo": 2,
    "medio": 6,
    "alto": 10,
}

def convertir_respuestas(data):
    try:
        return [
            MAPEO_RESPUESTAS.get(data.gusto_estudio, 6),
            MAPEO_RESPUESTAS.get(data.habito_estudio, 6),
            MAPEO_RESPUESTAS.get(data.razonamiento_logico, 6),
            MAPEO_RESPUESTAS.get(data.creatividad, 6),
            MAPEO_RESPUESTAS.get(data.concentracion_memoria, 6),
            MAPEO_RESPUESTAS.get(data.responsabilidad, 6),
        ]
    except Exception as e:
        print(f"Error en convertir_respuestas: {e}")
        raise

def calcular_riesgos(valores):
    gusto, habito, logica, creatividad, concentracion, responsabilidad = valores

    matematicas = (logica * 0.4 + habito * 0.3 + concentracion * 0.3)
    quimica     = (logica * 0.35 + concentracion * 0.35 + habito * 0.3)
    artistica   = (creatividad * 0.5 + gusto * 0.3 + responsabilidad * 0.2)
    sociales    = (concentracion * 0.4 + responsabilidad * 0.4 + gusto * 0.2)

    return {
        "matematicas": matematicas,
        "quimica": quimica,
        "artistica": artistica,
        "sociales": sociales
    }

def interpretar_riesgo(score):
    porcentaje = int(100 - score * 10)

    if porcentaje >= 70:
        nivel = "Alto"
    elif porcentaje >= 40:
        nivel = "Medio"
    else:
        nivel = "Bajo"

    return porcentaje, nivel

def generar_analisis(materia, valores, porcentaje):
    """Genera motivo y recomendación específica para cada materia"""
    gusto, habito, logica, creatividad, concentracion, responsabilidad = valores
    
    if materia == "matematicas":
        # Factores: logica (40%), habito (30%), concentracion (30%)
        motivos = []
        if logica < 6:
            motivos.append("baja comprensión de conceptos lógicos")
        if habito < 6:
            motivos.append("falta de hábitos de estudio consistentes")
        if concentracion < 6:
            motivos.append("dificultad para mantener concentración en problemas complejos")
        
        motivo = "Posible " + " y ".join(motivos) if motivos else "Factores varios de desempeño"
        
        if porcentaje >= 70:
            recomendacion = "Urgente: Requiere tutorías personalizadas en razonamiento lógico y resolución de problemas. Establece sesiones de 1 hora diaria."
        elif porcentaje >= 40:
            recomendacion = "Recomendado: Práctica constante de ejercicios progresivos. Agrupa temas por dificultad e incrementa la concentración."
        else:
            recomendacion = "Mantén tu ritmo actual. Profundiza en temas avanzados para fortalecer habilidades."
        
        return motivo, recomendacion
    
    elif materia == "quimica":
        # Factores: logica (35%), concentracion (35%), habito (30%)
        motivos = []
        if logica < 6:
            motivos.append("dificultad con conceptos abstractos y ecuaciones químicas")
        if concentracion < 6:
            motivos.append("problemas de concentración en prácticas de laboratorio")
        if habito < 6:
            motivos.append("estudios irregulares que afectan retención de fórmulas")
        
        motivo = "Posible " + " y ".join(motivos) if motivos else "Factores varios de desempeño"
        
        if porcentaje >= 70:
            recomendacion = "Crítico: Involúcrate en prácticas de laboratorio supervisadas. Estudia ecuaciones químicas con visualización molecular."
        elif porcentaje >= 40:
            recomendacion = "Recomendado: Realiza experimentos prácticos. Crea mapas mentales de reacciones químicas."
        else:
            recomendacion = "Buena base. Continúa practicando ecuaciones y síntesis química."
        
        return motivo, recomendacion
    
    elif materia == "artistica":
        # Factores: creatividad (50%), gusto (30%), responsabilidad (20%)
        motivos = []
        if creatividad < 6:
            motivos.append("limitada expresión creativa y originalidad")
        if gusto < 6:
            motivos.append("bajo interés en materias artísticas")
        if responsabilidad < 6:
            motivos.append("falta de compromiso con proyectos artísticos")
        
        motivo = "Posible " + " y ".join(motivos) if motivos else "Factores varios de desempeño"
        
        if porcentaje >= 70:
            recomendacion = "Importante: Explora diferentes técnicas artísticas (pintura, música, teatro). Participa en talleres creativos."
        elif porcentaje >= 40:
            recomendacion = "Recomendado: Aumenta prácticas artísticas regulares. Colabora con compañeros en proyectos creativos."
        else:
            recomendacion = "Excelente desempeño. Considera desarrollar un portfolios de tus trabajos."
        
        return motivo, recomendacion
    
    elif materia == "sociales":
        # Factores: concentracion (40%), responsabilidad (40%), gusto (20%)
        motivos = []
        if concentracion < 6:
            motivos.append("dificultad para retener información histórica y conceptual")
        if responsabilidad < 6:
            motivos.append("falta de dedicación a lecturas y análisis de textos")
        if gusto < 6:
            motivos.append("bajo interés en temas sociales e históricos")
        
        motivo = "Posible " + " y ".join(motivos) if motivos else "Factores varios de desempeño"
        
        if porcentaje >= 70:
            recomendacion = "Necesario: Aumenta lecturas sobre historia y ciencias sociales. Participa en debates y discusiones de temas actuales."
        elif porcentaje >= 40:
            recomendacion = "Recomendado: Lee documentos históricos resumidos. Ve documentales educativos sobre el tema."
        else:
            recomendacion = "Buen desempeño. Considera desarrollar investigaciones en temas de interés social."
        
        return motivo, recomendacion
    
    return "Análisis pendiente", "Continúa estudiando"
