const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '20h' });
};

const verifyToken = (req, res, next) => {
    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

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