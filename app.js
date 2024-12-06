const express = require('express')
const path =  require('path')
const session = require("express-session")
const app = express()
const fileUpload = require("express-fileupload")

app.set('views', path.join(__dirname, 'views')); // Configura o diretório das views
app.set('view engine', 'ejs')  //Configura o motor de templates para EJS
app.use(express.static(path.join(__dirname, 'public'))); //Define pasta para arquivos css / img
app.use(express.urlencoded({ extended: true })) //Para processar os dados do formulário
app.use(express.json());  // utilizar dados em formato JSON
app.use(session({
    secret: 'sesisenai', //um segredo para assinar sessão
    resave: false,
    saveUninitialized: true,
}))
app.use(fileUpload())

const verificarAutenticacao = (req,res,next)=>{
    if(req.session.usuarioLogado){
        //disponibilizando o nomeUsuario da seção para a tela ejs
        res.locals.nomeUsuario = req.session.nomeUsuario;
next()
        
    }
    else{{
        res.redirect('/auth/login')
    }
}
}
//rota da página principal "Landing Page"
app.get('/', (req, res) => {
    //carregando o arquivo ejs da pasta view
    res.render('landing/index')
})

//utilizando rotas admin
const adminrotas = require('./routes/admin')
app.use('/admin', verificarAutenticacao, adminrotas)

//utilizando rotas de professores
const categoriarotas = require('./routes/categoriaRotas')
app.use('/categoria', verificarAutenticacao, categoriarotas)


const produtoRotas = require('./routes/produtoRotas')
app.use('/produto', verificarAutenticacao, produtoRotas)

const usuarioRotas = require('./routes/usuarioRotas')
app.use('/usuario',verificarAutenticacao, usuarioRotas)

const loginRotas = require("./routes/loginRotas")
app.use('/auth',loginRotas)




const porta = 3000
app.listen(porta, () => {
    console.log(`Servidor rodando na porta http://localhost:${porta}`)
})