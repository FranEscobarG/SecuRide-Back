const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');
require('dotenv').config();

const { isStrongPassword, generateHashedPassword } = require('../../utils/passwordUtils');
const queryDatabase = require('../../database/database');

async function createUserController(req, res) {
  try {
    const { full_name, emergency_number, weight, email, password } = req.body;

    if (!full_name || !emergency_number || !weight || !email || !password) {
      return res.status(400).json({ error: '!Por favor, no dejes campos vácios¡' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'Error. La contraseña debe tener al menos 8 caracteres, mayúsculas y números' });
    }

    const allowedDomains = ['gmail.com', 'ids.upchiapas.edu.mx', 'yahoo.com.mx', 'hotmail.com'];

    const emailDomain = email.split('@')[1];

    if (!allowedDomains.includes(emailDomain)) {
      return res.status(400).json({ error: 'Error. Dominio de correo desconocido.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Error. Ingrese un email válido' });
    }

    const existingUserQuery = 'SELECT * FROM users WHERE email = ?';
    const results = await queryDatabase(existingUserQuery, [email]);
    if (results.length > 0) {
      return res.status(400).json({ error: 'Error. El correo ya esta en uso.' });
    }

    const hashedPassword = await generateHashedPassword(password);
    await insertUser(full_name, emergency_number, weight, email, hashedPassword);
    res.status(200).json({ message: '!Usuario registrado con exito¡' });
    
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Lo sentimos ha ocurrido un error durante su registro. Por favor, inténtelo más tarde.' });
  }
}

async function insertUser(full_name, emergency_number, weight, email, hashedPassword) {
  const insertQuery = 'INSERT INTO users (full_name, emergency_contact_number, weight, email, password) VALUES (?, ?, ?, ?, ?)';
  const insertValues = [full_name, emergency_number, weight, email, hashedPassword];

  return queryDatabase(insertQuery, insertValues);
}


module.exports = {
  createUserController,
};
