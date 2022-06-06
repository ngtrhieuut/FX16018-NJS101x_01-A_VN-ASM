const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const authManager = require('../middleware/manager-auth');

const router = express.Router();

router.get('/', isAuth, authManager.isStaff, userController.getIndex);

router.get('/staff-info', isAuth, authManager.isStaff, userController.getStaffInfo);

router.get('/check-in', isAuth,authManager.isStaff, userController.getCheckIn);

router.post('/check-in', isAuth,authManager.isStaff, userController.postCheckIn);

router.get('/check-out', isAuth,authManager.isStaff, userController.getCheckOut);

router.post('/check-out', isAuth,authManager.isStaff, userController.postCheckOut);

router.get('/annual-leave', isAuth,authManager.isStaff, userController.getAnnualLeave);

router.post('/annual-leave', isAuth,authManager.isStaff, userController.postAnnualLeave);

router.post('/staff-info/change-image-url', isAuth,authManager.isStaff, userController.postChangeImageUrl);

router.get('/time-checking', isAuth,authManager.isStaff, userController.getTimeChecking);

router.post('/time-checking', isAuth,authManager.isStaff, userController.postTimeChecking);

router.post('/time-checking/numberofLine', isAuth, authManager.isStaff, userController.postNumberofLine);

router.get('/covid-check', isAuth,authManager.isStaff, userController.getCovidCheck);

router.post('/covid-check/temperature', isAuth, authManager.isStaff ,userController.postTemperature);

router.post('/covid-check/vaccinated', isAuth, authManager.isStaff, userController.postvaccinated);

router.post('/covid-check/sick-checked', isAuth, authManager.isStaff, userController.postSickChecked);

router.get('/covid-check-manager', isAuth, authManager.isManager, userController.getCovitCheckManager);

router.get('/work-confirmation', isAuth, authManager.isManager, userController.getWorkConfirmation);

router.get('/export-covid-file', isAuth, authManager.isManager, userController.getExportFile);

router.get('/work-confirmation/:staffId', isAuth, authManager.isManager, userController.getStaffInfomation);

router.post('/work-confirmation/:staffId/delete', isAuth, authManager.isManager, userController.postDeleteTime);

router.post('/work-confirmation/:staffId/selectMonth', isAuth, authManager.isManager, userController.posMonthTime);

module.exports = router;
