const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

const upload = multer({ dest: 'uploads/' });

router.post('/analyze', protect, aiController.analyzeReport);
router.post('/generate-mission', protect, aiController.generateMission);
router.post('/parse-document', protect, upload.single('document'), aiController.parseDocument);
router.get('/get-intelligence/:taskId', protect, aiController.getTaskIntelligence);
router.get('/dashboard-intelligence', protect, aiController.getDashboardIntelligence);
router.post('/summarize', protect, aiController.getSummary);
router.post('/copilot', protect, aiController.getCopilotAssistance);
router.post('/chat', protect, aiController.chat);

module.exports = router;
