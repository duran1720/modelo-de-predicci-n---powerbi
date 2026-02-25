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
    # Eliminar tabla existente si existe
    cursor.execute("DROP TABLE IF EXISTS surveys")
    print("✓ Tabla surveys eliminada")

    # Crear tabla con la estructura correcta
    create_table_sql = """
    CREATE TABLE surveys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100),
      gusta_matematica INT,
      gusta_quimica INT,
      horas_estudio INT,
      dificultad_logica INT,
      pierde_matematica INT,
      pierde_quimica INT,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)
    print("✓ Tabla surveys creada")

    # Insertar datos
    insert_data_sql = """
    INSERT INTO surveys 
    (nombre, gusta_matematica, gusta_quimica, horas_estudio, dificultad_logica, pierde_matematica, pierde_quimica)
    VALUES
    (%s, %s, %s, %s, %s, %s, %s)
    """

    datos = [
        ('Ana', 5, 2, 1, 2, 0, 1),
        ('Carlos', 1, 4, 1, 1, 1, 0),
        ('Luisa', 2, 1, 0, 1, 1, 1),
        ('Pedro', 4, 5, 4, 4, 0, 0),
        ('Sofia', 1, 2, 0, 1, 1, 1),
        ('Mateo', 3, 3, 2, 3, 0, 0),
        ('Valentina', 2, 4, 1, 2, 1, 1),
        ('Diego', 5, 5, 4, 4, 0, 0)
    ]

    cursor.executemany(insert_data_sql, datos)
    connection.commit()
    print(f"✓ {cursor.rowcount} estudiantes insertados")

    # Verificar que los datos se insertaron
    cursor.execute("SELECT COUNT(*) as total FROM surveys")
    resultado = cursor.fetchone()
    print(f"✓ Total de estudiantes en BD: {resultado[0]}")

except Exception as e:
    print(f"✗ Error: {e}")
    connection.rollback()

finally:
    cursor.close()
    connection.close()
    print("✓ Conexión cerrada")
