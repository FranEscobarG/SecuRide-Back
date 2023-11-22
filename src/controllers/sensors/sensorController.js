const travelState = require('../../utils/travelState.js');

async function saveSensorData(data, sendSensorData) {
    try {
        const { rpm, velocity, coordinates, createdAt, fallDetected } = data;
        const travelId = travelState.getActiveTravelId();

        if ( !rpm || !velocity || !createdAt) {
            console.log('Error. No han llegado todos los datos requeridos')
        }

        if(coordinates != null){
            // Cambios en la construcción de la consulta SQL
            const query = 'INSERT INTO sensor_data (travel_id, velocity, rpm, coordinates, created_at) VALUES (?, ?, ?, ST_GeomFromText(?), ?)';
            const values = [travelId, velocity, rpm, `POINT(${coordinates})`, createdAt];
            const result = await queryDatabase(query, values);

            sendSensorData({ travelId, velocity, rpm, coordinates, createdAt }); // Cambiado
            console.log('Datos del sensor guardados con éxito. Resulst: ', result);
        }
        // else {
        //     const query = 'INSERT INTO sensor_data (travel_id, velocity, rpm, created_at) VALUES (?, ?, ?, ?)';
        //     const values = [travelId, velocity, rpm, createdAt];
        //     result = await queryDatabase(query, values);
        // }

        if(fallDetected){
            console.log("CAIDA DETECTADA\n")
        }
        
    } catch (error) {
        console.error('Error al guardar datos del sensor:', error);
    }
}

const queryDatabase = require('../../database/database');

module.exports = {
    saveSensorData,
};
