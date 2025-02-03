const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

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

module.exports = verificarToken;
