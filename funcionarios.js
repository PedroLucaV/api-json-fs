import fs from "fs";

const verDadosFuncionarios = (callback) => {
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

export default verDadosFuncionarios;