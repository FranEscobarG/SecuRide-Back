const bcrypt = require('bcrypt');
require('dotenv').config();
const userLogState = require('../../utils/userLogState.js');

const queryDatabase = require('../../database/database');
const { generateToken } = require('../../auth/middleware/middleWare');
const { verifyRecaptcha } = require('../../utils/verifyReCaptchaUtils');

async function loginUserController(req, res) {
  try {
    const { email, password, recaptchaValue } = req.body;

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Autentificacion invalida. ¿Ya está registrado?' });
    }

    const isValidateCaptcha = await verifyRecaptcha(recaptchaValue);
    if (!isValidateCaptcha) {
      return res.status(400).json({ error: 'No olvide completar el Captcha' });
    }

    const isValidatePasswd = await bcrypt.compare(password, user.password);
    if (!isValidatePasswd) {
      return res.status(401).json({ error: 'Autentificacion invalida.' });
    }

    const token = generateToken(user.id, user.full_name);
    userLogState.setActiveUserId(user.id)
    res.cookie('token', token, {
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      httpOnly: true, // This is a good practice for security
    });
    
    res.status(200).json({ message: 'Inicio de Sesión validado', token, usernameID: user.id, fullName: user.full_name });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Lo sentimos ha ocurrido un error durante su Inicio de sesión. Por favor, inténtelo más tarde.' });
  }
}
async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = ?';
  const results = await queryDatabase(query, [email]);
  return results.length > 0 ? results[0] : null;
}

async function logOutUserController(req, res) {
  res.cookie("token", "", { expires: new Date(0), });
  return res.sendStatus(200); //.json({ message: 'Cerro sesion', })
}

module.exports = {
  loginUserController,
  logOutUserController,
};
