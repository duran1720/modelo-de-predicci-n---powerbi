import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

# Conexión a la base de datos
connection = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "prediccionEjemplo")
)

cursor = connection.cursor()

try:
    # Crear tabla users si no existe
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL,
      fecha_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ultimo_login TIMESTAMP,
      activo BOOLEAN DEFAULT TRUE
    )
    """
    cursor.execute(create_table_sql)
    connection.commit()
    print("✓ Tabla users creada o ya existe")

except Exception as e:
    print(f"✗ Error: {e}")
    connection.rollback()

finally:
    cursor.close()
    connection.close()
    print("✓ Conexión cerrada")
