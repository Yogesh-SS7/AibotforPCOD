const fs = require('fs');
const path = require('path');

const YOGA_FILE = path.join(__dirname, '../data/yoga.json');

exports.getYogaPoses = (req, res) => {
    try {
        if (fs.existsSync(YOGA_FILE)) {
            const data = fs.readFileSync(YOGA_FILE, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error("Error reading yoga data:", error);
        res.status(500).json({ error: "Failed to load yoga poses" });
    }
};
