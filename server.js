import http from "http";
import { parse } from 'url';
const model = {
  "nome": "José Maria",
  "cargo": "Professor",
  "cpf": "123.456.789-00",
  "email": "joseMaria@example.com",
  "telefone": "(12) 93456-7890",
  "data_contratacao": "2022-01-10",
  "salario": 4500,
  "habilidades": ["Front-End", "Back-End", "Docker", "SQL"],
  "idade": 18,
  "senha": "123456",
  "confirmaSenha": "123456"
}
import fs from "fs";
import { verDadosFuncionarios, mudarDados } from "./controller.js"

const PORT = 8888;

const server = http.createServer((req, res) => {
  const { url, method } = req;
  const queryData = parse(req.url, true).query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  verDadosFuncionarios((err, funcionarios) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify("Erro ao ler o arquivo"));
    }
    if (url === "/empregados" && method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(funcionarios));
    } else if (url === "/empregados" && method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const newItem = JSON.parse(body);
        if (!newItem.hasOwnProperty('idade') || !newItem.hasOwnProperty('nome') || !newItem.hasOwnProperty('cargo') || !newItem.hasOwnProperty('cpf') || !newItem.hasOwnProperty('senha') || !newItem.hasOwnProperty('confirmaSenha') || !newItem.hasOwnProperty('email') || !newItem.hasOwnProperty('telefone') || !newItem.hasOwnProperty('data_contratacao') || !newItem.hasOwnProperty('salario') || !newItem.hasOwnProperty('habilidades')) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: `Não foi autorizado a criação do empregado, está faltando informações, siga o modelo:`, modelo: model })
          );
        } else {
          if (newItem.idade < 18) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Não foi autorizado! Precisa ser maior de 18 anos!" })
            );
          } else if (newItem.senha !== newItem.confirmaSenha) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Não foi autorizado! As senhas não condizem" })
            );
          } else {
            newItem.id = funcionarios.length + 1; // Gerar um novo ID
            funcionarios.push(newItem);
            mudarDados(funcionarios, newItem, () => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({ message: "Erro interno do servidor" })
                );
              }
              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify(newItem));
            })
          }
        }
      });
    } else if (url.startsWith("/empregados/") && method === "PUT") {
      const id = parseInt(url.split("/")[2]);
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const updatedItem = JSON.parse(body);
        // Procurar o empregado pelo ID e atualizar seus dados
        const index = funcionarios.findIndex((item) => item.id === id);
        if (index !== -1) {
          if (!updatedItem.hasOwnProperty('idade') || !updatedItem.hasOwnProperty('nome') || !updatedItem.hasOwnProperty('cargo') || !updatedItem.hasOwnProperty('cpf') || !updatedItem.hasOwnProperty('senha') || !updatedItem.hasOwnProperty('confirmaSenha') || !updatedItem.hasOwnProperty('email') || !updatedItem.hasOwnProperty('telefone') || !updatedItem.hasOwnProperty('data_contratacao') || !updatedItem.hasOwnProperty('salario') || !updatedItem.hasOwnProperty('habilidades')) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: `Não foi autorizado a atualização do empregado, está faltando informações, siga o modelo:`, modelo: model })
            );
          } if (updatedItem.idade < 18) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Não foi autorizado! Precisa ser maior de 18 anos!" })
            );
          } else if (updatedItem.senha !== updatedItem.confirmaSenha) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Não foi autorizado! As senhas não condizem" })
            );
          }
          funcionarios[index] = { ...funcionarios[index], ...updatedItem, id: id, cpf: funcionarios[index].cpf };
          mudarDados(funcionarios, funcionarios[index], () => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "Erro interno do servidor" })
              );
            }
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(funcionarios[index]));
          })
          
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Empregado não encontrado" }));
        }
      });
    } else if (url.startsWith("/empregados/") && method === "DELETE") {
      const id = parseInt(url.split("/")[2]);
      const index = funcionarios.findIndex((item) => item.id === id);
      if (index !== -1) {
        funcionarios.splice(index, 1);
        mudarDados(funcionarios, '', () => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Erro interno do servidor" })
            );
          }
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify("Funcionario apagado com sucesso!"));
        })
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Empregado não encontrado" }));
      }
    } else if (method === 'GET' && url === ('/empregados/count/')) {
      const lengthPart = funcionarios.length
      if (lengthPart === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: "Não foi encontrado participantes registrados" }))
      } else {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ message: `Existem ${lengthPart} participantes cadastrados!`, value: `${lengthPart}` }))
      }

    } else if (method === 'GET' && url.startsWith('/empregados/porCargo/')) {
      const empregadoCargo = url.split('/')[3]
      const findEmploy = funcionarios.filter(dado => dado.cargo == empregadoCargo)

      if (findEmploy.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: "Empregado não encontrado, espero ter ajudado" }))
      } else {
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(findEmploy))
      }
    } else if (method === 'GET' && url.startsWith('/empregados/porHabilidade/')) {
      const empregadoHabi = url.split('/')[3]
      const findEmploy = funcionarios.filter(dado => dado.habilidades.find(habilidades => habilidades == empregadoHabi))

      if (findEmploy.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: "Não foi encontrado um empregado com essa habilidade" }))
      } else {
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(findEmploy))
      }
    } else if (method === 'GET' && url.startsWith('/empregados/porFaixaSalarial')) {
      const minSalary = parseFloat(queryData.min);
      const maxSalary = parseFloat(queryData.max);
      const funcionariosNaFaixa = funcionarios.filter(funcionario => funcionario.salario >= minSalary && funcionario.salario <= maxSalary)
      if (funcionariosNaFaixa.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: "Não foram encontrados funcionarios com essa Faixa salarial!" }))
      } else {
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(funcionariosNaFaixa))
      }
    } else if (method === 'GET' && url.startsWith('/empregados/')) {
      const empregadoId = url.split('/')[2]
      const findEmploy = funcionarios.find(dado => dado.id == empregadoId)

      if (findEmploy.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: "Empregado não encontrado, espero ter ajudado" }))
      } else {
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify(findEmploy))
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Rota não encontrada" }));
    }
  })
});

server.listen(PORT, () => {
  console.log(`Servidor on PORT:${PORT}🚀`);
});