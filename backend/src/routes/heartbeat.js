const { Router } = require('express');
const { heartbeatHandler } = require('../controllers');

const router = Router();

router.get('/', heartbeatHandler);

module.exports = router;
