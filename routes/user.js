const path = require('path');

const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.get('/', userController.getIndex);

router.get('/staff-info', userController.getStaffInfo);

router.get('/check-in', userController.getCheckIn);

router.post('/check-in', userController.postCheckIn);

router.get('/check-out', userController.getCheckOut);

router.post('/check-out', userController.postCheckOut);

router.get('/annual-leave', userController.getAnnualLeave);

router.post('/annual-leave', userController.postAnnualLeave);

router.post('/staff-info/change-image-url', userController.postChangeImageUrl);

router.get('/time-checking', userController.getTimeChecking);

router.post('/time-checking', userController.postTimeChecking);

router.get('/covid-check', userController.getCovidCheck);

router.post('/covid-check/temperature', userController.postTemperature);

router.post('/covid-check/vaccinated', userController.postvaccinated);

router.post('/covid-check/sick-checked', userController.postSickChecked);

module.exports = router;
