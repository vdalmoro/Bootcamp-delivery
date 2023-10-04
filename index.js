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

  if (!cliente || !produto || !valor === undefined) {
    return res.json({
      error: "Cliente, produto e valor são campos obrigatórios.",
    });
  }
  return res.json(criarPedido(cliente, produto, valor));
});

//Chamada atualizaPedido
app.put("/atualizaPedido/:X", (req, res) => {
  const id = parseInt(req.params.X);
  const { cliente, produto, valor, entregue } = req.body;

  if (!id || !cliente || !produto || !valor || !entregue === undefined) {
    return res.json({
      error: "Id, cliente, produto, valor e status são campos obrigatórios.",
    });
  }
  return res.json(atualizaPedido(id, cliente, produto, valor, entregue));
});

//Chamada atualizaEntrega
app.put("/atualizaEntrega/:X", (req, res) => {
  const id = parseInt(req.params.X);
  const entregue = req.body.entregue;
  if (!id || !entregue === undefined) {
    return res.json({
      error: "Id e status são campos obrigatórios.",
    });
  }
  return res.json(atualizaEntrega(id, entregue));
});

//Chamada deletarPedido
app.delete("/deletarPedido/:X", (req, res) => {
  const id = parseInt(req.params.X);
  if (!id === undefined) {
    return res.json({
      error: "Id é um campo obrigatório.",
    });
  }
  return res.json(deletarPedido(id));
});

//Chamada buscarPedido
app.get("/buscarPedido/:X", (req, res) => {
  const id = parseInt(req.params.X);
  if (!id === undefined) {
    return res.json({
      error: "Id é um campo obrigatório.",
    });
  }
  return res.json(buscarPedido(id));
});

//Chamada conslutarPedidosCliente
app.get("/conslutarPedidos/Cliente/:X", (req, res) => {
  const cliente = req.params.X;
  if (!cliente === undefined) {
    return res.json({
      error: "Cliente é um campo obrigatório.",
    });
  }
  return res.json({
    msg: "O valor total dos pedidos é: " + conslutarPedidosCliente(cliente),
  });
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

//Função atualizaPedido
function atualizaPedido(id, cliente, produto, valor, entregue) {
  const pedidosData = JSON.parse(readFileSync("pedidos.json", "utf8"));
  const pedidoAtual = pedidosData.pedidos.find((pedido) => pedido.id === id);

  if (!pedidoAtual) {
    const err = json({ error: "Pedido não encontrado" });
    return err;
  }

  pedidoAtual.cliente = cliente;
  pedidoAtual.produto = produto;
  pedidoAtual.valor = valor;
  pedidoAtual.entregue = entregue;
  writeFileSync("./pedidos.json", JSON.stringify(pedidosData, null, 2));
  return pedidoAtual;
}

//Função atualizaEntrega
function atualizaEntrega(id, entregue) {
  const pedidosData = JSON.parse(readFileSync("pedidos.json", "utf8"));
  const pedidoAtual = pedidosData.pedidos.find((pedido) => pedido.id === id);

  if (!pedidoAtual) {
    const err = json({ error: "Pedido não encontrado" });
    return err;
  }
  pedidoAtual.entregue = entregue;
  writeFileSync("./pedidos.json", JSON.stringify(pedidosData, null, 2));
  return pedidoAtual;
}

//Função deletarPedido
function deletarPedido(id) {
  const pedidosData = JSON.parse(readFileSync("pedidos.json", "utf8"));
  const index = pedidosData.pedidos.findIndex((pedido) => pedido.id === id);

  if (!index) {
    const err = json({ error: "Pedido não encontrado" });
    return err;
  }
  pedidosData.pedidos.splice(index, 1);
  writeFileSync("./pedidos.json", JSON.stringify(pedidosData, null, 2));
  return index;
}

//Função buscarPedido
function buscarPedido(id) {
  const pedidosData = JSON.parse(readFileSync("pedidos.json", "utf8"));
  const pedidoAtual = pedidosData.pedidos.find((pedido) => pedido.id === id);

  if (!pedidoAtual) {
    const err = json({ error: "Pedido não encontrado" });
    return err;
  }
  return pedidoAtual;
}

//Função conslutarPedidosCliente
function conslutarPedidosCliente(cliente) {
  const pedidosData = JSON.parse(readFileSync("pedidos.json", "utf8"));
  let soma = 0;

  for (const pedidos of pedidosData.pedidos) {
    if (pedidos.cliente === cliente && pedidos.entregue === true) {
      soma += pedidos.valor;
    }
  }
  if (soma === 0) {
    return {
      error: "Cliente não encontrado ou não possui pedidos entregues",
    };
  }
  return soma;
}

//Função conslutarPedidosProduto
