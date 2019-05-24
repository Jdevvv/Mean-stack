const crypto = require('crypto').randomBytes(256).toString('hex');


module.exports = {
    uri: 'mongodb://localhost:O27017/medium',
    secret: crypto,
    db: 'medium'
}