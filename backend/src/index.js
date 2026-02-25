import express from "express";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Guardar encuesta
app.post("/survey", async (req, res) => {
  const survey = await prisma.survey.create({
    data: req.body,
  });
  res.json(survey);
});

// Predecir riesgo
app.post("/predict", async (req, res) => {
  const response = await axios.post(
    "http://localhost:8000/predict",
    req.body
  );
  res.json(response.data);
});

app.listen(3001, () => {
  console.log("Backend corriendo en http://localhost:3001");
});