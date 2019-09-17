const fs = require('fs');

function LoadSettings() {
    return JSON.parse(fs.readFileSync('./settings.json'));
}

module.exports = LoadSettings;