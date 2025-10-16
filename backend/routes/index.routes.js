const express = require('express');
const router = express.Router();
const genericRoutes = require('./generic.routes');

router.use('/generic', genericRoutes)

module.exports = router;