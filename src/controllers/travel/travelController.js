const moment = require('moment');
const travelState = require('../../utils/travelState.js');
const userLogState = require('../../utils/userLogState.js');


// POST QUE SE HARA DESDE EL FRONT
async function startTravel(req, res) {
    try {
        const userId = req.user.userId;
        console.log(req.user)

        if (!userId) {
            return res.status(400).json({ error: 'No se ha encontrado el usuario.' });
        }

        const query = 'INSERT INTO travel (user_id) VALUES (?)';
        const values = [userId];
        const travelResult = await queryDatabase(query, values);

        if (!travelResult || !travelResult.insertId) {
            return res.status(500).json({ error: 'Ocurrió un error al iniciar el viaje.' });
        }

        const travelID = travelResult.insertId;
        travelState.setActiveTravelId(travelID);  // Almacena el travelId activo en el objeto compartido
        userLogState.setActiveUserId(userId)
        console.log("Viaje iniciado para el user:", userId)
        
        // Validar la respuesta en el front, de aquí se obtendrá la travelID que se necesita para endTravel
        res.status(200).json({ message: 'Viaje iniciado con éxito.', success: true, travelID: travelID });
        
        // Envía el evento después de que se ha enviado la respuesta al cliente
        socketHandler.sendTravelStarted(travelID);

    } catch (error) {
        console.error('Error al iniciar el viaje:', error);
        res.status(500).json({ error: 'Ocurrió un error al iniciar el viaje.' });
    }
}

/* ENTONCES ESTE ES UN POST QUE SE HARA DESDE EL FRONT con el travelID obtenido del POST para startTravel */
async function endTravel(req, res) {
    try {
        const { travelId } = req.body;

        if (!travelId) {
            return res.status(400).json({ error: 'No se ha encontrado el viaje.' });
        }
        console.log("Viaje encontrado: ", travelId)

        res.status(200).json({ message: 'Viaje terminado con éxito.', success: true, travelId: travelId });

        socketHandler.sendTravelEnded(JSON.stringify({ travelId: travelId }));
        console.log("Viaje terminado: ", travelId)
        // Resetea el travelId activo en el objeto compartido
        travelState.setActiveTravelId(null);

    } catch (error) {
        console.error('Error al terminar el viaje:', error);
        res.status(500).json({ error: 'Ocurrió un error al terminar el viaje.' });
    }
}

async function updateTravel() {
    try {
        const travelId = travelState.getActiveTravelId();;
        const userId = userLogState.getActiveUserId();
        console.log(req.user)
        const userQuery = 'SELECT weight FROM users WHERE id = ?';
        const userValues = [userId];
        const userResult = await queryDatabase(userQuery, userValues);
        if (!userResult || !userResult[0] || !userResult[0].weight) {
            return res.status(500).json({ error: 'No se pudo obtener el peso del usuario.' });
        }
        const userWeight = userResult[0].weight;

        const data = await obtenerCoordenadasYFechaPorTravelId(travelId);
        const coordinates = data.map(item => item.coordinates);
        const createdDates = data.map(item => item.created_at);
        // Obtener la primera y última coordenada
        const startCoordinates = coordinates[0];
        const endCoordinates = coordinates[data.length - 1];
        // Obtener la primera y última fecha de creación
        const startDatetime = createdDates[0];
        const endDatetime = createdDates[data.length - 1];

        // Calcula la distancia recorrida utilizando las coordenadas
        const distance = calcularDistanciaRecorrida(coordinates);

        // Calcula la duración y las calorías quemadas
        const { duration, calories_burned } = calcularDuracionYCalorias({
            startDatetime: moment(startDatetime),
            endDatetime: moment(endDatetime),
            userWeight,
        });
        
        if (!userId || !travelId || !startDatetime || !endDatetime || !startCoordinates || !endCoordinates || !distance) {
            return res.status(400).json({ error: 'No se ha encontrado el usuario y viaje.' });
        }

        const query = 'UPDATE travel SET start_datetime = ?, end_datetime = ?, duration = ?, start_coordinates = POINT(?), end_coordinates = POINT(?), calories_burned = ?, distance = ? WHERE id = ?';
        const values = [startDatetime, endDatetime, duration, startCoordinates, endCoordinates, calories_burned, distance, travelId];
        const travelUpdateResult = await queryDatabase(query, values);

        if(travelUpdateResult){
            console.log("Datos del viaje actualizados")
        }
    } catch (error) {
        console.error('Error al iniciar el viaje:', error);
        // res.status(500).json({ error: 'Ocurrió un error al iniciar el viaje.' });
    }
}
// Función para calcular la duración y las calorías quemadas
function calcularDuracionYCalorias(data) {
    const { startDatetime, endDatetime, userWeight } = data;
    // Calcula la duración en minutos
    const duration = moment.duration(endDatetime.diff(startDatetime)).asMinutes();

    // Utiliza el valor MET de 7.2 para ciclismo
    const metValue = 7.2;
    // Calcula las calorías quemadas
    const calories_burned = (metValue * userWeight * duration) / 1440; // 1440 minutos en un día

    return {
        duration,
        calories_burned,
    };
}
async function obtenerCoordenadasYFechaPorTravelId(travelId) {
    const query = 'SELECT ST_X(coordinates) as x, ST_Y(coordinates) as y, created_at FROM sensor_data WHERE travel_id = ? ORDER BY created_at';
    const values = [travelId];
    const result = await queryDatabase(query, values);

    return result.map(row => {
        return {
            coordinates: [row.x, row.y],
            created_at: row.created_at
        };
    });
}
const calcularDistanciaRecorrida = (coordinates) => {
    let distanciaTotal = 0;

    // Itera sobre las coordenadas para calcular la distancia entre puntos consecutivos
    for (let i = 1; i < coordinates.length; i++) {
        const [x1, y1] = coordinates[i - 1];
        const [x2, y2] = coordinates[i];

        // Calcula la distancia euclidiana entre dos puntos
        const distanciaEntrePuntos = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        // Suma la distancia al total
        distanciaTotal += distanciaEntrePuntos;
    }

    return distanciaTotal;
};


const queryDatabase = require('../../database/database');
const socketHandler = require('../../services/registerDataSensorsServices/socketHandler');


module.exports = {
    startTravel,
    endTravel,
    updateTravel,
};
