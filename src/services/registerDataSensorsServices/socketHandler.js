const socketIo = require('socket.io');
let io;

function initSocket(server) {
    io = new socketIo.Server(server, {
        cors: {
            origin: '198.162.11.73',
        },
        transports: ['websocket'], 
        connectionStateRecovery: {}
    });
    console.log("websokcet iniciado en: ")

    io.on('connection', (socket) => {
        console.log('Cliente conectado');

        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });

        // Enviado desde la rasp para actualizar los datos del travel despues de finzalizar viaje
        socket.on('dataTravelEnded:rasp', (data) => { // la data deberia ser la id del travel y todio lo obtenido de la rasp
            console.log('Evento de fin de datos del viaje recibido desde la rasp');
            // travelController.updateTravel()
        });

        // Enviado desde la rasp para guardar datos sensados durante el viaje
        socket.on('dataTransfer:rasp', (data) => { 
            console.log('Evento de trasmision de sensor_data recibido desde la rasp', data);
            // Seria un objeto con dos objetos dentro -> const data = {travel{}, sensor_data{}} deberia ir la travelId
            sensorController.saveSensorData(data.sensor_data, sendSensorData)
        });

    });
}

function sendTravelStarted(data) {
    if (io) {
        io.emit('travelStarted:api', data);
        console.log('Evento inicio enviado a la raspberry', data);
    } else {
        console.log('Websocket not initialized');
    }
}
// la data del evento deberia ser la travelID del reponse del POST a boton iniciar viaje
// que se mandara con el POST para endedTravel
function sendTravelEnded(data) {
    if (io) {
        io.emit('travelEnded:api', data);
        console.log('Evento travelEnded enviado a la raspberry', data);
    } else {
        console.log('Websocket not initialized');
    }
}

// ESTE ES PAL FRONT
function sendSensorData(data) {
    if (io) {
        io.emit('sensorData:api', data);
        console.log('Data de sensores enviada al front');
    } else {
        console.log('Websocket not initialized');
    }
}

const travelController = require('../../controllers/travel/travelController');
const sensorController = require('../../controllers/sensors/sensorController');

module.exports = {
    initSocket,
    sendTravelStarted,
    sendTravelEnded,
};
