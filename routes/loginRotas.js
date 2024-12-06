const express = require("express");
const router = express.Router();
const BD = require("../db");

//definindo rota da tela de login
// /auth/login
router.get("/login", (req, res) => {
  res.render("admin/login");
});

// processando login do usuario
router.post("/login", async (req, res) => {
  const usuario = req.body.usuario;
  const senha = req.body.senha;

  const buscaDados = await BD.query(
    `Select * from usuarios where usuario = $1 and senha = $2`,
    [usuario, senha]
  );
  //verifica se o login e a senha são validos
  if (buscaDados.rows.length > 0) {
    req.session.usuarioLogado = buscaDados.rows[0].usuario;
    req.session.nomeUsuario = buscaDados.rows[0].nome;
    req.session.idUsuario = buscaDados.rows[0].id;
    res.redirect("/admin/");
  } else {
    res.render("admin/login", { mensagem: "usuario não autenticado" });
  }
});

//criando rota para logout(sair do sistema)
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
