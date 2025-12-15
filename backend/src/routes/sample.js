const { Router } = require('express');
const { sampleHandler } = require('../controllers');

const router = Router();

router.get('/', sampleHandler);

module.exports = router;
