require('dotenv').config();
const express = require('express');
const swaggerDocs = require('./swagger'); // Importamos Swagger
const cors = require('cors');
// const verificarToken = require('./middleware/auth');


const usuarioRoutes = require('./routes/usuario'); 
 const libreriaRoutes = require('./routes/libreria'); 

const app = express();
app.use(express.json());

app.use(cors());

const PORT = process.env.PORT;

// Inicializar Swagger
swaggerDocs(app);

// app.use('/api', verificarToken);

// esto aqui, le podemos poner las rutas que queramos.
app.use('/api', usuarioRoutes); 
app.use('/api', libreriaRoutes); 

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
