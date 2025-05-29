const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const axios = require("axios");
const log = require("node-file-logger");

const SERVICE_NAME = "DataService";
const API_NAME = "/pokemon";

const options = {
    timeZone: "America/Los_Angeles",
    folderPath: "./logs/",
    dateBasedFileNaming: true,
    fileName: "All_Logs",
    fileNamePrefix: "Logs_",
    fileNameSuffix: "",
    fileNameExtension: ".log",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:mm:ss.SSS",
    logLevel: "debug",
    onlyFileLogging: true
};

log.SetUserOptions(options);

function logStandard(level, api, func, message) {
    const now = new Date().toISOString();
    const fullMessage = `{${now}}{${SERVICE_NAME}}{${api}}{${func}} ${message}`;
    log[level](fullMessage);
}

app.use(express.json());
app.use(cors());

app.post("/pokemon", async (req, res) => {
    const FUNC_NAME = "handlePokemonData";
    const startTime = Date.now();
    const { pokemon_name } = req.body;

    logStandard("Info", API_NAME, FUNC_NAME, `Nombre o ID de Pokémon recibido: ${pokemon_name}`);

    try {
        logStandard("Info", API_NAME, FUNC_NAME, "Consultando API externa PokeAPI");

        const response = await axios.get("https://pokeapi.co/api/v2/pokemon/" + pokemon_name);

        logStandard("Info", API_NAME, FUNC_NAME, "Datos encontrados exitosamente");
        const latency = Date.now() - startTime;
        logStandard("Info", API_NAME, FUNC_NAME, `Solicitud completada en ${latency}ms`);

        res.status(200).json({ error: null, data: response.data.forms[0].name });
    } catch (error) {
        logStandard("Error", API_NAME, FUNC_NAME, "Error al consultar PokeAPI: " + error.message);
        res.status(404).json({ error: error.message, data: {} });
    }
});

app.listen(port, () => {
    console.log("Corriendo servidor puerto", port);
});
