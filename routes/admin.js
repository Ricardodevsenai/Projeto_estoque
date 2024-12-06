const express = require("express");
const BD = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  const totalProdutos = await BD.query(
    `select count(*) as total_produto from produtos`
  );
  const totalCategorias = await BD.query(
    `select count(*) as total_categoria from categorias`
  );

  const totalUsuarios = await BD.query(
    `select count(*) as total_usuario from usuarios`
  );
  const totalEstoque = await BD.query(
    `select sum(estoque) as estoque_total from produtos`
  );
  const produtosmin = await BD.query(
    `select produtos.id_produto,produtos.nome_produto,produtos.estoque,produtos.estoque_minimo,produtos.valor,produtos.imagem, categorias.nome from produtos left join categorias on produtos.id_categoria = categorias.id_categoria where estoque <= estoque_minimo`
  );

  const abaixo = await BD.query(
    `select count(*) as produtosmin from produtos where estoque <= estoque_minimo`
  );

  const valor = await BD.query(
    `SELECT 
    SUM(produtos.valor) AS valor_total, 
    categorias.nome AS nome_categoria
FROM 
    produtos
LEFT JOIN 
    categorias 
ON 
    produtos.id_categoria = categorias.id_categoria

    where produtos.inativos is null
GROUP BY 
    categorias.nome;
`
  );


  const produtos = await BD.query(
    `  SELECT 
    count(*) AS valor_produtos, 
    categorias.nome AS nome_categoria
FROM 
    produtos
LEFT JOIN 
    categorias 
ON 
    produtos.id_categoria = categorias.id_categoria

    where produtos.inativos is null
GROUP BY 
    categorias.nome; `
  );




  res.render("admin/dashboard", {
    totalProdutos: totalProdutos.rows[0].total_produto,
    totalCategorias: totalCategorias.rows[0].total_categoria,
    totalUsuarios: totalUsuarios.rows[0].total_usuario,
    totalEstoque: totalEstoque.rows[0].estoque_total,
    tabela: produtosmin.rows,
    abaixo: abaixo.rows[0].produtosmin,
    valor: valor.rows,
    produtos:produtos.rows
  });
});

module.exports = router;
