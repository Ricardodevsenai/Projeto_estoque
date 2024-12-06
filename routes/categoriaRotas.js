const express = require("express");
const router = express.Router();
const BD = require("../db");

//listar professores
router.get("/", async (req, res) => {
  const busca = req.query.busca || ''
    const ordenar = req.query.ordenar || 'nome'

  const buscadados = await BD.query(`SELECT * FROM categorias where inativo is null and  upper(categorias.nome) like $1 order by ${ordenar}`, [`%${busca.toUpperCase()}%`]);
  const inativos = await BD.query(`SELECT * FROM categorias where inativo = 'S' and  upper(categorias.nome) like $1 order by ${ordenar}`, [`%${busca.toUpperCase()}%`]);
  res.render("categoriaTelas/lista", { categorias: buscadados.rows, busca: busca ,ordenar:ordenar,inativo:inativos.rows });
});

//rotas para abrir tela para criar um novo processador (C - Create)
//para acessar / professores/novo

router.get("/novo", (req, res) => {
  res.render("categoriaTelas/criar");
});

router.post("/novo", async (req, res) => {
  const { nome } = req.body;
  await BD.query(`insert into categorias (nome) values($1)`, [nome]);
  res.redirect("/categoria");
});

//excluir um professor
router.post("/:id/deletar", async (req, res) => {
  const { id } = req.params;
  // await BD.query("delete from categorias where id_categoria = $1", [id]);
  await BD.query("update categorias set inativo = 'S' where id_categoria = $1", [id]);
  res.redirect("/categoria");
});

router.get("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const resultado = await BD.query(
    "select * from categorias where  id_categoria = $1",
    [id]
  );
  res.render("categoriaTelas/editar", { categorias: resultado.rows[0] });
});

router.post("/:id/editar", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  await BD.query("update categorias set nome = $1 where id_categoria= $2", [nome,id]);
  res.redirect("/categoria");
});

module.exports = router;
