const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '20h' });
};

const verifyToken = (req, res, next) => {
    // const {token} = req.cookies;
    // Verifica si el token de autorización está presente en los encabezados
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // El token no está presente
        return res.status(401).json({ error: 'Acceso no autorizado. Token no proporcionado.' });
    }

    // Verifica el formato del token (debería comenzar con "Bearer ")
    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        // El formato del token no es válido
        return res.status(401).json({ error: 'Formato de token no válido.' });
    }

    // El token está en tokenParts[1]
    const token = tokenParts[1];

    // if (!token) {
    //     return res.status(401).json({ error: 'Token no proporcionado' });
    // }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado, inicie sesión nuevamente' });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Token inválido' });
            } else {
                return res.status(500).json({ error: 'Error al verificar el token' });
            }
        }

        req.user = decoded;
        next();
    });
};


module.exports = {
    verifyToken,
    generateToken
};