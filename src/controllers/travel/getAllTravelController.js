const queryDatabase = require('../../database/database');

async function getAllTravelData(req, res) {
  try {
    const query = 'SELECT * FROM travel';
    const sensorData = await queryDatabase(query);

    res.status(200).json(sensorData);
  } catch (error) {
    console.error('Error al obtener datos del sensor:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos del sensor.' });
  }
}


module.exports = {
  getAllTravelData,
};
