from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from schemas import EncuestaInput
from utils import convertir_respuestas, calcular_riesgos, interpretar_riesgo, generar_analisis
import joblib
import os
import mysql.connector
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI()

# ✅ CORS (ESTO ES LO QUE FALTABA)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],  # puertos comunes de Vite en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ia", "model.pkl")

model = joblib.load(MODEL_PATH)

# ===== SCHEMAS =====
class LoginRequest(BaseModel):
    nombre: str

class LoginResponse(BaseModel):
    id: int
    nombre: str
    mensaje: str
    success: bool

# ===== ENDPOINTS =====

@app.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "prediccionEjemplo")
        )

        cursor = connection.cursor(dictionary=True)
        
        # Verificar si el usuario existe
        cursor.execute("SELECT id, nombre FROM users WHERE nombre = %s", (request.nombre,))
        usuario = cursor.fetchone()

        if usuario:
            # Actualizar último login
            cursor.execute(
                "UPDATE users SET ultimo_login = %s WHERE id = %s",
                (datetime.now(), usuario["id"])
            )
            connection.commit()
            cursor.close()
            connection.close()
            
            return {
                "id": usuario["id"],
                "nombre": usuario["nombre"],
                "mensaje": f"Bienvenido {usuario['nombre']}",
                "success": True
            }
        else:
            # Crear nuevo usuario
            cursor.execute(
                "INSERT INTO users (nombre, ultimo_login) VALUES (%s, %s)",
                (request.nombre, datetime.now())
            )
            connection.commit()
            nuevo_id = cursor.lastrowid
            cursor.close()
            connection.close()
            
            return {
                "id": nuevo_id,
                "nombre": request.nombre,
                "mensaje": f"Usuario {request.nombre} registrado exitosamente",
                "success": True
            }

    except Exception as e:
        return {
            "id": -1,
            "nombre": "",
            "mensaje": f"Error: {str(e)}",
            "success": False
        }

@app.post("/predict")
def predict(data: EncuestaInput):
    try:
        valores = convertir_respuestas(data)
        riesgos = calcular_riesgos(valores)

        resultados = {}
        materia_critica = None
        mayor_riesgo = -1

        for materia, score in riesgos.items():
            porcentaje, nivel = interpretar_riesgo(score)
            
            # Generar motivo y recomendación específica para cada materia
            motivo, recomendacion = generar_analisis(materia, valores, porcentaje)

            resultados[materia] = {
                "probabilidad": porcentaje,
                "riesgo": nivel,
                "motivo": motivo,
                "recomendacion": recomendacion
            }

            if porcentaje > mayor_riesgo:
                mayor_riesgo = porcentaje
                materia_critica = materia

        # Mapear respuestas a valores numéricos para guardar
        # valores es una lista: [gusto, habito, logica, creatividad, concentracion, responsabilidad]
        gusto_mat = round(valores[3] / 2)  # creatividad (para matemáticas)
        gusto_quim = round(valores[0] / 2)  # gusto_estudio (para química)
        horas_est = round(valores[1] / 2.5)  # habito_estudio (para horas)
        dif_logica = round(valores[2] / 2.5)  # razonamiento_logico
        pierde_mat = 1 if valores[4] < 4 else 0  # concentracion_memoria
        pierde_quim = 1 if valores[5] < 4 else 0  # responsabilidad
        gusto_artistica = round(valores[3] / 2)
        gusto_sociales = round(valores[0] / 2)
        pierde_artistica = 1 if valores[4] < 4 else 0
        pierde_sociales = 1 if valores[5] < 4 else 0

        # Guardar en base de datos
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "prediccionEjemplo")
        )

        cursor = connection.cursor()
        insert_query = """
        INSERT INTO surveys (
            nombre, 
            gusta_matematica, 
            gusta_quimica,
            gusta_artistica,
            gusta_sociales,
            horas_estudio, 
            dificultad_logica, 
            pierde_matematica, 
            pierde_quimica,
            pierde_artistica,
            pierde_sociales
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
        survey_id = cursor.lastrowid

        materias_data = [
            ("Matemática", gusto_mat, pierde_mat),
            ("Química", gusto_quim, pierde_quim),
            ("Artística", gusto_artistica, pierde_artistica),
            ("Sociales", gusto_sociales, pierde_sociales)
        ]

        for materia, gusto, pierde in materias_data:
            cursor.execute("""
                INSERT INTO survey_materias (survey_id, nombre, materia, gusto, pierde)
                VALUES (%s, %s, %s, %s, %s)
            """, (survey_id, data.usuario_nombre, materia, gusto, pierde))
        cursor.execute(insert_query, (
            data.usuario_nombre,
            gusto_mat,
            gusto_quim,
            gusto_artistica,
            gusto_sociales,
            horas_est,
            dif_logica,
            pierde_mat,
            pierde_quim,
            pierde_artistica,
            pierde_sociales
        ))
        connection.commit()
        cursor.close()
        connection.close()

        return {
            "materia_critica": materia_critica,
            "resultados": resultados,
            "guardado": True
        }
    
    except Exception as e:
        return {
            "materia_critica": None,
            "resultados": {},
            "guardado": False,
            "error": str(e)
        }
@app.get("/compare")
def compare_students():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "prediccionEjemplo")
        )

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM surveys")
        estudiantes = cursor.fetchall()
        cursor.close()
        connection.close()

        resultados = []

        for est in estudiantes:
            gusta_mat = est.get("gusta_matematica", 0) or 0
            gusta_quim = est.get("gusta_quimica", 0) or 0
            horas = est.get("horas_estudio", 0) or 0
            dificultad = est.get("dificultad_logica", 0) or 0
            pierde_mat = est.get("pierde_matematica", 0) or 0
            pierde_quim = est.get("pierde_quimica", 0) or 0
            gusta_artistica = est.get("gusta_artistica", 0) or 0
            gusta_sociales = est.get("gusta_sociales", 0) or 0
            pierde_artistica = est.get("pierde_artistica", 0) or 0
            pierde_sociales = est.get("pierde_sociales", 0) or 0


            riesgo = (
                (1 - gusta_mat/5) * 25 +
                (1 - gusta_quim/5) * 25 +
                (1 - horas/4) * 20 +
                (1 - dificultad/4) * 20 +
                (pierde_mat * 5) +
                (pierde_quim * 5) +
                (pierde_artistica * 5) +
                (pierde_sociales * 5)
            )

            resultados.append({
                "nombre": est.get("nombre", "Desconocido"),
                "riesgo_global": round(riesgo, 2),
                "gusta_matematica": gusta_mat,
                "gusta_quimica": gusta_quim,
                "horas_estudio": horas,
                "dificultad_logica": dificultad,
                "pierde_matematica": pierde_mat,
                "pierde_quimica": pierde_quim
            })

        return {"estudiantes": resultados}
    
    except Exception as e:
        return {"error": str(e)}