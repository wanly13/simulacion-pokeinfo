const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const axios = require("axios");
const log = require("node-file-logger");

const SERVICE_NAME = "SearchService";

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

app.post("/search", async (req, res) => {
    const { pokemon_name } = req.body;
    const startTime = Date.now();
    const API_NAME = "/search";
    const FUNC_NAME = "mainHandler";

    try {
        logStandard("Info", API_NAME, FUNC_NAME, "Inicio de búsqueda para: " + pokemon_name);

        const t1 = Date.now();
        const response_data = await axios.post("http://localhost:5000/pokemon", { pokemon_name });
        logStandard("Info", API_NAME, FUNC_NAME, `Servicio data respondió en ${Date.now() - t1}ms`);

        const t2 = Date.now();
        const response_stats = await axios.post("http://localhost:8000/pokemon", { pokemon_name });
        logStandard("Info", API_NAME, FUNC_NAME, `Servicio stats respondió en ${Date.now() - t2}ms`);

        const t3 = Date.now();
        const response_image = await axios.post("http://localhost:8080/pokemon", { pokemon_name });
        logStandard("Info", API_NAME, FUNC_NAME, `Servicio image respondió en ${Date.now() - t3}ms`);

        logStandard("Info", API_NAME, FUNC_NAME, `Búsqueda completada en ${Date.now() - startTime}ms`);
        res.status(200).json({
            name: response_data.data.data,
            stats: response_stats.data.data,
            image: response_image.data.data,
            error: null
        });
    } catch (error) {
        logStandard("Error", API_NAME, FUNC_NAME, "Error al buscar: " + error.message);
        res.status(500).json({ error: error.message, data: {} });
    }
});

app.listen(port, () => {
    console.log("Corriendo servidor puerto", port);
}).on("error", (err) => {
    console.error("Error al iniciar el servidor:", err);
});