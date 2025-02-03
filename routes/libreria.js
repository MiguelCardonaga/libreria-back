const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth');
const { connectDB, sql } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(express.json());

app.use('/api', verificarToken);

// TODO LO QUE VAYA AQUÍ NECESITA VALIDACIÓN POR TOKEN

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/registrarLibro:
 *   post:
 *     summary: Registrar un nuevo libro
 *     tags: [Libros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TITULO:
 *                 type: string
 *               AUTOR:
 *                 type: string
 *               AÑO_PUBLICACION:
 *                 type: integer
 *               GENERO_ID:
 *                 type: integer
 *               ESTADO_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Libro registrado con éxito
 *       400:
 *         description: El libro ya existe
 */
router.post('/registrarLibro', verificarToken, async (req, res) => {
    const { TITULO, AUTOR, AÑO_PUBLICACION, GENERO_ID, ESTADO_ID } = req.body;

    if (!TITULO) {
        return res.status(400).json({ msg: 'El titulo es obligatorio' });
    }

    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('titulo', sql.NVarChar, TITULO)
            .query('SELECT * FROM LIBROS WHERE TITULO = @titulo');

        if (result.recordset.length > 0) {
            return res.status(400).json({ msg: 'El libro ya existe' });
        }

        await pool.request()
            .input('titulo', sql.NVarChar, TITULO)
            .input('autor', sql.NVarChar, AUTOR)
            .input('año_publicacion', sql.Int, AÑO_PUBLICACION)
            .input('genero_id', sql.Int, GENERO_ID)
            .input('estado_id', sql.Int, ESTADO_ID)
            .query(`INSERT INTO LIBROS (TITULO, AUTOR, AÑO_PUBLICACION, GENERO_ID, ESTADO_ID)
                    VALUES (@titulo, @autor, @año_publicacion, @genero_id, @estado_id)`);

        res.status(201).json({ msg: 'Libro registrado con éxito' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

/**
 * @swagger
 * /api/traertodo:
 *   get:
 *     summary: Obtener todos los libros registrados
 *     tags: [Libros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de libros obtenida con éxito
 *       403:
 *         description: Token no válido o expirado
 */
router.get('/traertodo', verificarToken, async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query('SELECT * FROM LIBROS WHERE ESTADO_ID <> 6');

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron libros' });
        }

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

/**
 * @swagger
 * /api/traerlibro:
 *   post:
 *     summary: Traer libro por nombre
 *     tags: [Libros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NOMBRE:
 *                 type: string
 *     responses:
 *       200:
 *         description: Libro encontrado
 *       400:
 *         description: No se pudo encontrar el libro
 */
router.post('/traerlibro',verificarToken, async (req, res) => {
    const { NOMBRE } = req.body;

    if (!NOMBRE) {
        return res.status(400).json({ msg: 'El NOMBRE es obligatorio' });
    }

    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('nombre', sql.NVarChar, NOMBRE)
            .query("SELECT TOP 1 a.ID, a.TITULO, a.AUTOR, a.AÑO_PUBLICACION, b.ESTADO, c.GENERO FROM LIBROS a LEFT JOIN ESTADOS b on a.ESTADO_ID = b.ID LEFT JOIN GENEROS c on a.GENERO_ID = c.ID WHERE TITULO = @nombre");

        return res.status(200).json(result.recordset);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error en el servidor' });
    }
});

/**
 * @swagger
 * /api/EliminarLibro:
 *   post:
 *     summary: Cambiar estado de libro/eliminar
 *     tags: [Libros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NOMBRE:
 *                 type: string
 *     responses:
 *       201:
 *         description: Libro eliminado con éxito
 *       400:
 *         description: No se pudo eliminar el libro
 */
router.post('/EliminarLibro',verificarToken, async (req, res) => {
    const { NOMBRE } = req.body;

    if (!NOMBRE) {
        return res.status(400).json({ msg: 'El NOMBRE es obligatorio' });
    }

    try {
        const pool = await connectDB();

        await pool.request()
            .input('NOMBRE', sql.NVarChar, NOMBRE)
            .query(`UPDATE LIBROS SET ESTADO_ID = 6 WHERE TITULO = @NOMBRE`);

        res.status(201).json({ msg: 'Libro actualizado con éxito' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

/**
 * @swagger
 * /api/actualizarEstado/{NOMBRE}:
 *   put:
 *     summary: Actualizar estado de un libro
 *     tags: [Libros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: NOMBRE
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ESTADO_ID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Estado del libro actualizado
 */
router.put('/actualizarEstado/:NOMBRE',verificarToken, async (req, res) => {
    const { NOMBRE } = req.params;
    const { ESTADO_ID } = req.body;

    if (!ESTADO_ID) {
        return res.status(400).json({ msg: 'El ESTADO_ID es obligatorio' });
    }

    try {
        const pool = await connectDB();

        await pool.request()
            .input('NOMBRE', sql.NVarChar, NOMBRE)
            .input('ESTADO_ID', sql.Int, ESTADO_ID)
            .query('UPDATE LIBROS SET ESTADO_ID = @ESTADO_ID WHERE TITULO = @NOMBRE');

        res.status(200).json({ msg: 'Estado del libro actualizado con éxito' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

module.exports = router;
