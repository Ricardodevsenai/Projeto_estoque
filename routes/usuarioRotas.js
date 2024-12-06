const express = require("express");
const router = express.Router();
const BD = require("../db");


router.get("/", async (req, res) => {

  const busca = req.query.busca || ''
    const ordenar = req.query.ordenar || 'nome'


    const buscadados =  await BD.query(`select * from usuarios where upper(usuarios.nome) like $1 order by ${ordenar}`, [`%${busca.toUpperCase()}%`]);
    res.render('usuarioTelas/lista', { Dados: buscadados.rows, busca: busca ,ordenar:ordenar })
   })
   

   
   router.get("/novo", (req, res) => {
   res.render('usuarioTelas/criar')
   })
   
   router.post('/novo',async(req,res) => {
    const { nome,usuario,senha} = req.body
    await BD.query(`insert into usuarios (nome,usuario,senha) values ($1,$2,$3)`, [nome,usuario,senha])
res.redirect('/usuario')  
 })
   
   router.post('/:id/deletar',async (req, res) => {
       const {id} = req.params
       await BD.query('delete from usuarios where id_usuario = $1', [id])
   res.redirect('/usuario')
   })
   

   router.get('/:id/editar', async (req, res) => {
       const {id} = req.params
      const resultado = await BD.query("select * from usuarios where  id_usuario = $1", [id])
   res.render('usuarioTelas/editar', {usuarios:resultado.rows[0]})
   })

   
   router.post("/:id/editar",async (req,res) =>{
   const {id} = req.params
   const {nome,usuario,senha} = req.body
   await BD.query('update usuarios set nome = $1, usuario = $2, senha =$3 where id_usuario = $4', [nome,usuario,senha, id])
   res.redirect('/usuario')
   })
   
   module.exports = router;