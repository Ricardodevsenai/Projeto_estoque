const { Pool } = require('pg')

const BD = new Pool({
    user: 'postgres', // nome usuario
    host: 'localhost', // endereço do servidor
    database: 'estoque',  // nome do banco de dados
    password: 'admin', // senha do banco de dados
    port: 5432, // porta de conexão do servidor
})
module.exports = BD