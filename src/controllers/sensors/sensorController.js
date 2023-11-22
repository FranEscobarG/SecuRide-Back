const travelState = require('../../utils/travelState.js');

async function saveSensorData(data, sendSensorData) {
    try {
        const { rpm, velocity, coordinates, createdAt } = data;
        const travelId = travelState.getActiveTravelId();

        if (!travelId || !rpm || !velocity || !coordinates || !createdAt) {
            console.log('Error. No han llegado todos los datos requeridos')
        }

        const query = 'INSERT INTO sensor_data (travel_id, velocity, rpm, coordinates, created_at) VALUES (?, ?, ?, ST_GeomFromText(?), ?)';
        const values = [travelId, velocity, rpm, `POINT(${coordinates})`, createdAt];
        const result = await queryDatabase(query, values);

        sendSensorData({ travelId, velocity, rpm, coordinates, createdAt }); // Cambiado
        console.log('Datos del sensor guardados con éxito. Resulst: ', result);
        // res.status(200).json({ message: 'Datos del sensor guardados con éxito.', data: result });
    } catch (error) {
        console.error('Error al guardar datos del sensor:', error);
        // res.status(500).json({ error: 'Ocurrió un error al guardar datos del sensor.' });
    }
}

const queryDatabase = require('../../database/database');

module.exports = {
    saveSensorData,
};
