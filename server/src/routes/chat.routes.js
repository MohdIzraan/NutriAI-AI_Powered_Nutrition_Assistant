const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getChat, deleteChat } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.get('/:id', protect, getChat);
router.delete('/:id', protect, deleteChat);

module.exports = router;
