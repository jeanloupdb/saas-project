const express = require('express');
const router = express.Router();
const { createAction, verifyAction } = require('../controllers/actionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createAction);
router.post('/verify', authMiddleware, verifyAction);

module.exports = router;
