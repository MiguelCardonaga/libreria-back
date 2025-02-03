const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB, sql } = require('../db'); 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;




/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NOMBRE_COMPLETO:
 *                 type: string
 *               TIPO_DOCUMENTO:
 *                 type: string
 *               NUMERO_DOCUMENTO:
 *                 type: string
 *               CORREO:
 *                 type: string
 *               CONTRASENA:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado con éxito
 *       400:
 *         description: El usuario ya existe
 */
router.post('/register', async (req, res) => {
    const { NOMBRE_COMPLETO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, CORREO, CONTRASENA } = req.body;

    if (!NOMBRE_COMPLETO || !TIPO_DOCUMENTO || !NUMERO_DOCUMENTO || !CORREO || !CONTRASENA) {
        return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('correo', sql.NVarChar, CORREO)
            .query('SELECT * FROM USUARIOS WHERE CORREO = @correo');

        if (result.recordset.length > 0) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(CONTRASENA, 10);

        await pool.request()
            .input('nombre', sql.NVarChar, NOMBRE_COMPLETO)
            .input('tipo_doc', sql.NVarChar, TIPO_DOCUMENTO)
            .input('num_doc', sql.NVarChar, NUMERO_DOCUMENTO)
            .input('correo', sql.NVarChar, CORREO)
            .input('contrasena', sql.NVarChar, hashedPassword)
            .query(`INSERT INTO USUARIOS (NOMBRE_COMPLETO, TIPO_DOCUMENTO, NUMERO_DOCUMENTO, CORREO, CONTRASENA)
                    VALUES (@nombre, @tipo_doc, @num_doc, @correo, @contrasena)`);

        res.status(201).json({ msg: 'Usuario registrado con éxito' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CORREO:
 *                 type: string
 *               CONTRASENA:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', async (req, res) => {
    const { CORREO, CONTRASENA } = req.body;

    if (!CORREO || !CONTRASENA) {
        return res.status(400).json({ msg: 'Correo y contraseña son obligatorios' });
    }

    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('correo', sql.NVarChar, CORREO)
            .query('SELECT ID, NOMBRE_COMPLETO, CORREO, CONTRASENA FROM USUARIOS WHERE CORREO = @correo');

        if (result.recordset.length === 0) {
            return res.status(401).json({ msg: 'Correo o contraseña incorrectos' });
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(CONTRASENA, user.CONTRASENA);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: user.ID, correo: user.CORREO },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ 
            msg: 'Login exitoso', 
            token,
            user: {
                nombreCompleto: user.NOMBRE_COMPLETO,
                correo: user.CORREO
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});


// **Middleware para verificar JWT**




/**
 * @swagger
 * /api/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [User]
 *     security:
 *       - BearerAuth: []  # <--- Esto habilita el candado en Swagger
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       403:
 *         description: Token no válido o expirado
 */

// **Ruta protegida**
router.get('/perfil', verificarToken, async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query('SELECT ID, NOMBRE_COMPLETO, CORREO FROM USUARIOS WHERE ID = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});




///funciones 


function verificarToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ msg: 'Acceso denegado. Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ msg: 'Token no válido' });
    }
}

module.exports = router;
