const express = require("express");
const router = express.Router();
const BD = require("../db");
const { put, del } = require("@vercel/blob");



//listar disciplina(R - Read)
//rota localhost:3000/disciplina/
router.get("/", async (req, res) => {
  try {
    const busca = req.query.busca || "";
    const ordenar = req.query.ordenar || "nome_produto";

    const buscadados = await BD.query(
      `select produtos.id_produto,produtos.nome_produto,produtos.estoque,produtos.estoque_minimo,produtos.valor,produtos.imagem, categorias.nome from produtos left join categorias on produtos.id_categoria = categorias.id_categoria where (upper(produtos.nome_produto) like $1 or upper(categorias.nome) like $1 ) and inativos is null order by ${ordenar}`,
      [`%${busca.toUpperCase()}%`]
    );

    res.render("produtoTelas/lista", {
      Dados: buscadados.rows,
      busca: busca,
      ordenar: ordenar,
    });
  } catch (erro) {
    console.log("erro ao listar produtos", erro);
    res.redirect("/produto");
  }
});

router.get("/novo", async (req, res) => {
  try {
    const resultado = await BD.query("select * from categorias order by nome");

    res.render("produtoTelas/criar", {
      resultados: resultado.rows,
    });
  } catch (erro) {
    console.log("erro ao abrir tela de cadastro de produto", erro);
    res.render("produtoTelas/criar", { mensagem: erro });
  }
});

const enviarFoto = async (file) => {
  const fileBuffer = file.data
  const originalName = file.name
  const blob = await put(originalName, fileBuffer, {
      access: "public", // Define acesso público ao arquivo
  });
  console.log(`Arquivo enviado com sucesso! URL: ${blob.url}`);
  return blob.url;
};

const excluirFoto = async (imagemUrl) => {
  const nomeArquivo = imagemUrl.split("/").pop();
  if (nomeArquivo) {
      await del(nomeArquivo);
      console.log(`Arquivo ${nomeArquivo} excluído com sucesso.`);
  }
}

router.post("/novo", async (req, res) => {
  try {
    const nome_produto = req.body.nome_produto;
    const estoque = req.body.estoque;
    const estoque_minimo = req.body.estoque_minimo;
    const valor = req.body.valor;
   //const imagem = req.body.imagem;
    const id_categoria = req.body.id_categoria;
    const urlImagem = await enviarFoto(req.files.file);
  
    await BD.query(
      "insert into produtos (nome_produto,estoque,estoque_minimo,valor,imagem, id_categoria) values($1,$2,$3,$4,$5,$6)",
      [nome_produto, estoque, estoque_minimo, valor, urlImagem, id_categoria]
    );
    res.redirect("/produto");
  } catch (erro) {
    console.log("erro ao cadastrar produto", erro);
    res.render("produtoTelas/criar", { mensagem: erro });
  }
});
router.get("/:id/editar", async (req, res) => {
  try {
    const { id } = req.params;
    //const id = req.params.id
    const resultado = await BD.query(
      "select * from produtos where id_produto = $1",
      [id]
    );
    //Lista com todos os profs cadastrados para o select
    const categoriaCadastrados = await BD.query(
      "select * from categorias order by nome"
    );
    const usuarioscadastrados = await BD.query(
      `select nome, id_usuario from usuarios`
    );

    const tabela = await BD.query(
      `
      select movimentacoes.tipo_movimentacao, TO_CHAR(movimentacoes.data_movimentacao, 'DD/MM/YYYY') AS data_movimentacao, movimentacoes.quantidade,  movimentacoes.descricao, movimentacoes.id_usuario, usuarios.nome, usuarios.id_usuario from movimentacoes inner join usuarios on movimentacoes.id_usuario = usuarios.id_usuario where id_produto = $1`,
      [id]
    );
    res.render("produtoTelas/editar", {
      produto: resultado.rows[0],
      categoriaCadastrados: categoriaCadastrados.rows,
      usuarios: usuarioscadastrados.rows,
      tabelas: tabela.rows,
    });
  } catch (erro) {
    console.log("Erro ao editar produto", erro);
  }
});

router.post("/:id/deletar", async (req, res) => {
  const { id } = req.params;
  //await BD.query("delete from produtos where id_produto = $1", [id]);
  await BD.query("update produtos set inativos = 'S' where id_produto = $1", [
    id,
  ]);
  res.redirect("/produto");
});

router.post("/:id/editar", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_produto, id_categoria,estoque,estoque_minimo,valor,imagem } = req.body;

let urlimagem = imagem

if(req.files){
  excluirFoto(urlimagem)
  urlimagem = await enviarFoto(req.files.file)
}

    await BD.query(
      "update produtos set nome_produto = $1,estoque = $2,estoque_minimo = $3,valor = $4 ,imagem = $5, id_categoria = $6 where id_produto = $7",
      [nome_produto,estoque,estoque_minimo,valor,urlimagem, id_categoria, id]
    );

    res.redirect("/produto");
  } catch (erro) {
    console.log("erro ao gravar produto", erro);
  }
});

router.post("/:id/lancar-nota", async (req, res) => {
  const { id } = req.params;
  const {
    data_movimentacao,
    tipo_movimentacao,
    quantidade,
    descricao,
    id_usuario,
  } = req.body;

  await BD.query(
    `insert into movimentacoes (id_produto,data_movimentacao,tipo_movimentacao,quantidade,descricao,id_usuario)  values($1,$2,$3,$4,$5,$6)`,
    [
      id,
      data_movimentacao,
      tipo_movimentacao,
      quantidade,
      descricao,
      id_usuario,
    ]
  );

  res.redirect(`/produto/${id}/editar`);
});

module.exports = router;
