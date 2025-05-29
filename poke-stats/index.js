const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const log = require("node-file-logger");

const SERVICE_NAME = "StatsService";
const API_NAME = "/pokemon";

const results = [];

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

fs.createReadStream("db.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
        logStandard("Info", "init", "loadCSV", `Archivo CSV cargado con ${results.length} registros`);
    });

app.post("/pokemon", async (req, res) => {
    const FUNC_NAME = "handlePokemonStats";
    const startTime = Date.now();
    const { pokemon_name } = req.body;

    logStandard("Info", API_NAME, FUNC_NAME, `Solicitud recibida con nombre: ${pokemon_name}`);

    try {
        logStandard("Info", API_NAME, FUNC_NAME, "Buscando coincidencias en CSV");

        const stats = results.find(item => item.Name.toLowerCase() === pokemon_name.toLowerCase());

        if (stats) {
            logStandard("Info", API_NAME, FUNC_NAME, "Coincidencia encontrada");
            const { Name, ...rest } = stats;
            const latency = Date.now() - startTime;
            logStandard("Info", API_NAME, FUNC_NAME, `Solicitud procesada en ${latency}ms`);
            res.status(200).json({ error: null, data: rest });
        } else {
            logStandard("Error", API_NAME, FUNC_NAME, "No se encontró el Pokémon en la base de datos");
            res.status(404).json({ error: "Error al buscar el pokemon", data: {} });
        }
    } catch (error) {
        logStandard("Error", API_NAME, FUNC_NAME, "Error interno del servidor: " + error.message);
        res.status(500).json({ error: error.message, data: {} });
    }
});

app.listen(port, () => {
    console.log("Corriendo servidor puerto", port);
});
