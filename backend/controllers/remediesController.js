const remedies = require('../data/remedies.json');

exports.getRemedies = (req, res) => {
    res.json(remedies);
};
