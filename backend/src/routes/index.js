const { Router } = require('express');
const sample = require('./sample');
const heartbeat = require('./heartbeat');

const router = Router();

router.use('/sample', sample);
router.use('/heartbeat', heartbeat);

module.exports = router;
