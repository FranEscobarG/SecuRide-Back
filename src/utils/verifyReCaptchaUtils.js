const fetch = require('node-fetch');
require('dotenv').config();

const verifyRecaptcha = async (recaptchaValue) => {
    try {
        console.log('Verifying reCAPTCHA...');

        const recaptchaSecretKey = process.env.RECAPTCHA_SECRET;
        const recaptchaEndpoint = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaValue}`;

        const recaptchaResult = await fetch(recaptchaEndpoint, {
            method: 'POST',
        });
        const recaptchaData = await recaptchaResult.json();

        console.log('reCAPTCHA verification result:', recaptchaData);
        return recaptchaData.success;
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return false;
    }
};

module.exports = {
    verifyRecaptcha,
};