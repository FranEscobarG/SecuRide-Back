const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: '*',
}));
    // credentials: true
app.options('*', cors());

//ORIGIN DEBE CAMBIAR

const registerUserController = require('./src/controllers/users/registerUserController');
const loginUserController = require('./src/controllers/users/loginUserController');
const travelController = require('./src/controllers/travel/travelController');
const getAllTravelDataController = require('./src/controllers/travel/getAllTravelController');
const getAllSensorDataController = require('./src/controllers/sensors/getAllSensorDataController');

const middleWare = require('./src/auth/middleware/middleWare');

// RUTAS PARA GESTION DE USUARIOS
app.post('/create', registerUserController.createUserController);
app.post('/login', loginUserController.loginUserController);
app.post('/logout', loginUserController.logOutUserController);
// RUTAS PARA VIAJES - podrian llevar middleWare
app.post('/start-travel', middleWare.verifyToken, travelController.startTravel);
app.post('/end-travel', middleWare.verifyToken, travelController.endTravel);
app.get('/travel', middleWare.verifyToken , getAllTravelDataController.getAllTravelData);
// RUTAS PARA SENSORES
app.get('/sensores', middleWare.verifyToken ,getAllSensorDataController.getAllSensorData);
app.get('/sensor_data/:userId', getAllSensorDataController.getUserTravelData);



server.listen(5000, () => {
    console.log('Server listening on port 5000');
});

const socketHandler = require('./src/services/registerDataSensorsServices/socketHandler');
socketHandler.initSocket(server);