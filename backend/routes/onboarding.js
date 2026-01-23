const express = require('express');
const router = express.Router();
const controller = require('../controllers/onboardingController');

router.post('/initiate', controller.initiateOnboarding);
router.post('/verify-otp', controller.verifyOtp);

module.exports = router;
