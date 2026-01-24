const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const prakritiController = require('../controllers/prakritiController');
const diagnosticController = require('../controllers/diagnosticController');
const remediesController = require('../controllers/remediesController');

// Chat
router.post('/chat', chatController.chat);

// Prakriti
router.get('/prakriti/questions', prakritiController.getQuestions);
router.post('/prakriti/submit', prakritiController.calculatePrakriti);

// Diagnostic - Joint Pain
router.get('/diagnostic/joint-pain/questions', diagnosticController.getJointPainQuestions);
router.post('/diagnostic/joint-pain/submit', diagnosticController.analyzeJointPain);

const pcodController = require('../controllers/pcodController');

// PCOD
router.get('/pcod/questions', pcodController.getQuestions);
router.post('/pcod/submit', pcodController.submitAssessment);
router.post('/pcod/explain', pcodController.explainResult);

// Remedies
router.get('/remedies', remediesController.getRemedies);

module.exports = router;
