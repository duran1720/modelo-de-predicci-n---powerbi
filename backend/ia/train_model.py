import pandas as pd
from sklearn.linear_model import LogisticRegression
import joblib

data = pd.read_csv("data.csv")

X = data[[
  "gusta_matematica",
  "horas_estudio",
  "dificultad_logica"
]]

y = data["pierde_matematica"]

model = LogisticRegression()
model.fit(X, y)

joblib.dump(model, "model.pkl")
print("Modelo entrenado")