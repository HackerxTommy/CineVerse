const express = require('express');
const router = express.Router();
const { getShowDetails } = require('../controllers/movieController');

router.get('/:id', getShowDetails);

module.exports = router;
