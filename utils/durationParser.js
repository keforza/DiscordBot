// utils/durationParser.js

/**
 * Parsa una stringa di durata (es. "10m", "1h", "1d") in millisecondi.
 * @param {string} durationStr - La stringa di durata.
 * @returns {number|null} La durata in millisecondi, o null se il formato non è valido.
 */
function parseDuration(durationStr) {
    const match = durationStr.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return null;
    const num = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return num * 1000;
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        case 'd': return num * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    parseDuration
};