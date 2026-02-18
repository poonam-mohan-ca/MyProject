if (process.env.DATABASE_URL) module.exports = require('./postgres');
else if (process.env.MYSQL_HOST) module.exports = require('./mysql');
else module.exports = require('./sqlite');
