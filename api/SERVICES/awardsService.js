const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/awards.json');

function getAwards() {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

function saveAward(award) {
    const awards = getAwards();
    awards.push(award);

    fs.writeFileSync(filePath, JSON.stringify(awards, null, 2));
}

module.exports = {
    getAwards,
    saveAward
};