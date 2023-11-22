const queryDatabase = require('../../database/database');

async function getAllSensorData(req, res) {
  try {
    const query = 'SELECT * FROM sensor_data';
    const sensorData = await queryDatabase(query);

    res.status(200).json(sensorData);
  } catch (error) {
    console.error('Error al obtener datos del sensor:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener datos del sensor.' });
  }
}

async function getUserTravelData(req, res) {
  try {
    const userId = req.params.userId;
      // Consulta para obtener todos los viajes y los datos del sensor relacionados para un usuario específico
      const query = `
          SELECT
              travel.id AS travel_id,
              sensor_data.id AS sensor_data_id,
              sensor_data.velocity,
              sensor_data.rpm,
              sensor_data.coordinates AS sensor_coordinates,
              sensor_data.created_at AS sensor_created_at
          FROM
              travel
          LEFT JOIN
              sensor_data ON travel.id = sensor_data.travel_id
          WHERE
              travel.user_id = ?;
      `;

      const results = await queryDatabase(query, [userId]);

      // Procesar los resultados para organizarlos en una estructura deseada
      const userTravelData = {};

      results.forEach((row) => {
          const { travel_id, sensor_data_id, velocity, rpm, sensor_coordinates, sensor_created_at } = row;

          // Si el viaje no existe en el objeto, inicialízalo
          if (!userTravelData[travel_id]) {
              userTravelData[travel_id] = {
                  sensor_data: [],
              };
          }

          // Agregar datos del sensor al viaje actual
          if (sensor_data_id) {
              userTravelData[travel_id].sensor_data.push({
                  id: sensor_data_id,
                  velocity,
                  rpm,
                  coordinates: sensor_coordinates,
                  created_at: sensor_created_at,
              });
          }
      });

      res.status(200).json(userTravelData);
  } catch (error) {
      console.error('Error al obtener datos de viaje del usuario:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener datos del user sensor.' });
  }
}

module.exports = {
  getAllSensorData,
  getUserTravelData,
};
