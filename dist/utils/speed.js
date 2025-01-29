"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const ws_1 = __importDefault(require("ws"));
const perf_hooks_1 = require("perf_hooks");
const logger_1 = __importDefault(require("./logger"));
async function runSpeedTest() {
    try {
        logger_1.default.info("🚀 Starting speed test...");
        const serverUrls = await discoverServers();
        if (!serverUrls)
            throw new Error("Server discovery failed.");
        const { downloadSpeed, uploadSpeed } = await performTests(serverUrls);
        logger_1.default.info("=== ============================ ===");
        logger_1.default.info(`📥 Download Speed: ${downloadSpeed.toFixed(2)} Mbps`);
        logger_1.default.info(`📤 Upload Speed: ${uploadSpeed.toFixed(2)} Mbps`);
        logger_1.default.info("=== ============================ ===");
        return { downloadSpeed, uploadSpeed };
    }
    catch (error) {
        logger_1.default.error("❌ Speed test failed:", error.message);
        return { downloadSpeed: 0, uploadSpeed: 0 };
    }
}
async function discoverServers() {
    logger_1.default.info("🌐 Discovering servers...");
    const locateUrl = "https://locate.measurementlab.net/v2/nearest/ndt/ndt7";
    try {
        const response = await (0, node_fetch_1.default)(locateUrl);
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error("No servers found.");
        }
        const server = data.results[0];
        logger_1.default.info(`✅ Server chosen: ${server.machine}`);
        return {
            downloadUrl: server.urls["wss:///ndt/v7/download"],
            uploadUrl: server.urls["wss:///ndt/v7/upload"],
        };
    }
    catch (error) {
        logger_1.default.error("❌ Server discovery failed:", error.message);
        return null;
    }
}
async function performTests(serverUrls) {
    logger_1.default.info("📥 Starting download test...");
    const downloadSpeed = await runDownloadTest(serverUrls.downloadUrl);
    logger_1.default.info("📤 Starting upload test...");
    const uploadSpeed = await runUploadTest(serverUrls.uploadUrl);
    return { downloadSpeed, uploadSpeed };
}
function runDownloadTest(downloadUrl) {
    return new Promise((resolve, reject) => {
        const socket = new ws_1.default(downloadUrl, "net.measurementlab.ndt.v7");
        const startTime = perf_hooks_1.performance.now();
        let totalBytes = 0;
        socket.on("open", () => {
            logger_1.default.info("⚡ Download test started...");
        });
        socket.on("message", (data) => {
            if (typeof data !== "string") {
                totalBytes += Buffer.byteLength(Buffer.from(data));
                const elapsedTime = (perf_hooks_1.performance.now() - startTime) / 1000;
                const speedMbps = (totalBytes * 8) / elapsedTime / 1e6;
                logger_1.default.info(`📊 Current download speed: ${speedMbps.toFixed(2)} Mbps`);
            }
        });
        socket.on("close", () => {
            const elapsedTime = (perf_hooks_1.performance.now() - startTime) / 1000;
            const finalSpeedMbps = (totalBytes * 8) / elapsedTime / 1e6;
            logger_1.default.info("✅ Download test completed.");
            resolve(finalSpeedMbps);
        });
        socket.on("error", (err) => {
            logger_1.default.error("❌ Download test error:", err.message);
            reject(err);
        });
    });
}
function runUploadTest(uploadUrl) {
    return new Promise((resolve, reject) => {
        const socket = new ws_1.default(uploadUrl, "net.measurementlab.ndt.v7");
        const startTime = perf_hooks_1.performance.now();
        const buffer = new Uint8Array(8192); // 8 KB buffer
        let totalBytesSent = 0;
        function sendData() {
            if (socket.readyState === ws_1.default.OPEN) {
                socket.send(buffer);
                totalBytesSent += buffer.length;
                setTimeout(sendData, 0); // Continue sending data
            }
        }
        socket.on("open", () => {
            logger_1.default.info("⚡ Upload test started...");
            sendData();
        });
        socket.on("close", () => {
            const elapsedTime = (perf_hooks_1.performance.now() - startTime) / 1000;
            const finalSpeedMbps = (totalBytesSent * 8) / elapsedTime / 1e6;
            logger_1.default.info("✅ Upload test completed...");
            resolve(finalSpeedMbps);
        });
        socket.on("error", (err) => {
            logger_1.default.error("❌ Upload test error:", err.message);
            reject(err);
        });
    });
}
exports.default = runSpeedTest;
//# sourceMappingURL=speed.js.map