import { timeStamp } from "console";
import express from "express";
import { promises as fs, read, readFileSync, write, writeFileSync } from "fs";

const { readFile, writeFile } = fs;
const app = express();
app.use(express.json());

app.listen(3000, async () => {
  try {
    await readFile("pedidos.json");
    console.log("API Started!");
  } catch (err) {
    const initialJson = {
      nextId: 1,
      pedidos: [],
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

//Chamada criarPedido
app.post("/criarPedido", (req, res) => {
  const { cliente, produto, valor } = req.body;

  if (!cliente || !produto || !valor) {
    return res.json({
      error: "Cliente, produto e valor são campos obrigatórios.",
    });
  }
  return res.json(criarPedido(cliente, produto, valor));
});

//Função criarPedido
function criarPedido(cliente, produto, valor) {
  const pedidosData = JSON.parse(readFileSync("pedidos.json", "utf8"));
  const novoPedido = {
    id: pedidosData.nextId,
    cliente,
    produto,
    valor,
    entregue: false,
    timestamp: new Date(),
  };

  pedidosData.nextId++;
  pedidosData.pedidos.push(novoPedido);
  writeFileSync("./pedidos.json", JSON.stringify(pedidosData, null, 2));
  return novoPedido;
}
