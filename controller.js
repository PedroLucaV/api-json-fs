import fs from "fs";

export const verDadosFuncionarios = (callback) => {
  fs.readFile("funcionarios.json", "utf-8", (err, data) => {
    if (err) {
      callback(err)
    }
    try { //Caso seja sucesso
      const funcionario = JSON.parse(data)
      callback(null, funcionario)
    } catch (error) { //Caso erro
      callback(error)
    }
  })
}

export const mudarDados = (funcionarios, novoFunc, callback) => {
  fs.writeFile("funcionarios.json", JSON.stringify(funcionarios, null, 2), (err) => {
    if(err){
      callback(err)
      return
    }
    callback()
  })
}

// fs.writeFile(
//   "funcionarios.json",
//   JSON.stringify(funcionarios, null, 2),
//   (err) => {
//     if (err) {
      
//       return;
//     }
//     res.writeHead(201, { "Content-Type": "application/json" });
//     res.end(JSON.stringify(newItem));
//   }
// );