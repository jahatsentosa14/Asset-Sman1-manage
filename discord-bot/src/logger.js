// Logger sederhana dengan timestamp ISO — memudahkan membaca log di
// panel Pterodactyl/Wispbyte saat troubleshooting, tanpa perlu library
// logging tambahan (over-engineering untuk kebutuhan bot sekecil ini).
function timestamp() {
  return new Date().toISOString();
}

function info(message, ...args) {
  console.log(`[${timestamp()}] [INFO] ${message}`, ...args);
}

function warn(message, ...args) {
  console.warn(`[${timestamp()}] [WARN] ${message}`, ...args);
}

function error(message, ...args) {
  console.error(`[${timestamp()}] [ERROR] ${message}`, ...args);
}

module.exports = { info, warn, error };
