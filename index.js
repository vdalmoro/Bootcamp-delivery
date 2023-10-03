import express from "express";
import { promises as fs, read, readFileSync, write } from "fs";

const { readFile, writeFile } = fs;
const app = express();
app.use(express.json());

app.listen(3000, async () => {
  try {
    await readFile("pedidos.json");
    console.log("API Started!");
  } catch (err) {
    const initialJson = {
      brand: "Teste",
      models: [],
    };
    writeFile("pedidos.json", JSON.stringify(initialJson))
      .then(() => {
        console.log("Arquivo criado API Started!");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

//Chamada teste
app.get("/teste", (req, res) => {
  res.send(req.method);
});
