const sql = require('mssql/msnodesqlv8');

//se usa un driver para poder conectar a sql server y no la libreia mssql
const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-EIVGE7UB\\SQLEXPRESS;Database=libreria;Trusted_Connection=yes;'
};

async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log('Conectado a SQL Server');
        return pool;
    } catch (err) {
        console.error('Error de conexión:', err);
    }
}

module.exports = { connectDB, sql };
