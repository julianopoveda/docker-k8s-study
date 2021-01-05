var express = require('express');
var app = express();
var sqlite3 = require("sqlite3");
var fs = require("fs");
var file = "juri.db"
var exists = fs.existsSync(file);
const bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  var db = new sqlite3.Database(file);
  db.serialize(function () {
    if (!exists) {
      console.log("db nao existe");
      return;
    }

    processos = [];

    db.each("select * from processos", function (err, row) {
      processos.push(row);
    }, function (err, rownumber) {
      res.send(processos);
    });

  });

  db.close();
});

app.post("/", function (req, res) {
  var db = new sqlite3.Database(file);
  db.run("insert into processos(numero, uf_sigla, cidade, reu, cliente, status) values(?)", req.body);
  res.send("Processo lançado");
})

app.put("/status", function (req, res) {
  db.run("update processos set status=$status where numero=$numero", {
    $status: req.status,
    $numero: req.numero
  });
})

app.delete("/", function (req, res) {
  db.run("delete from processos where numero=$numero", {$numero: req.numero});
})

app.listen('3000');
console.log("Server running on port 3000");


class processo {
  numero
  uf_sigla
  cidade
  reu
  cliente
  status
}
