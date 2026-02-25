from pydantic import BaseModel

class EncuestaInput(BaseModel):
    usuario_id: int
    usuario_nombre: str
    gusto_estudio: str
    habito_estudio: str
    razonamiento_logico: str
    creatividad: str
    concentracion_memoria: str
    responsabilidad: str