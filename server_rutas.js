// Arranque: prepara la base de datos, inicia el servidor y delega cada solicitud al enrutador.

const http = require('node:http');
const { manejarSolicitud } = require('./routes');
const { obtenerConexion, cerrarConexion, RUTA_DB } = require('./repositories/db');

const PUERTO = Number(process.env.PORT) || 3000;

obtenerConexion(); // crea tablas y productos iniciales si hace falta

const servidor = http.createServer(manejarSolicitud);

servidor.listen(PUERTO, () => {
  console.log(`Papelería La Libreta en http://localhost:${PUERTO}`);
  console.log(`Base de datos: ${RUTA_DB}`);
});

function detener() {
  servidor.close(() => {
    cerrarConexion();
    process.exit(0);
  });
}
process.on('SIGINT', detener);
process.on('SIGTERM', detener);
