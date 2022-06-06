const fs = require('fs');
const path = require('path');
const date = require('s-date');
const PDFDocument = require('pdfkit-table');
const mongoose = require('mongoose');

const User = require('../models/user');
const checkOut = require('../models/checkOut');
const checkIn = require('../models/checkIn');
const AnnualLeave = require('../models/annualLeave');
const Temperature = require('../models/temperature');


//create functions to simplify processing
//leaveHours function convert string to seconds
const leaveHours = (a) => {
    const hours = a.split(':');
    const seconds =  hours[0]*3600 + hours[1]*60;
    return seconds
}

//timeUsed function find the difference from 2 time 
const timeUsed = (startTime, endTime) => {
    const difference = (leaveHours(endTime) - leaveHours(startTime))/28800
    return difference
}

//timeRemaining function return annual leave remaining
const timeRemaining = (annualLeave, timeUsed1, timeUsed2, dayUsed) => {
    const remaining = (annualLeave - timeUsed1 - timeUsed2 - dayUsed).toFixed(2);
    return remaining
}

//getMaxday function return number days of month
const getMaxDay = (year, month) => {
    return new Date(year, month, 0).getDate();
};

const numberFormat = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
});

//some function return date, month, year value
const getNewMonth = (month) => {
    return new Date(month).getMonth()
};

const getNewYear = (year) => {
    return new Date(year).getFullYear()
};

const getNewDate = (date) => {
    return new Date(date)
};

//render home page
exports.getIndex = (req, res, next) => {
    res.render('user/index', {
        props: req.user,
        pageTitle: 'User Controll Center',
        path: '/',
        success: undefined,
        error: undefined,
        length: undefined,
        checkInCard: undefined,
        checkOutCard: undefined,
        aLeaveCard: undefined,
        checkinList: undefined,
        checkoutList: undefined
    });
};

//render staff info page
exports.getStaffInfo = (req, res, next) => {
    const date = require('s-date');
    const myBirthday = new Date(req.user.doB);
    const startDate = new Date(req.user.startDate);
    res.render('user/user-info', {
        props: req.user,
        birth: date('{mm}/{dd}/{yyyy}', myBirthday),//use s-date to format time for render view
        startD: date('{mm}/{dd}/{yyyy}', startDate),
        pageTitle: 'User Infomation',
        path: '/staff-info',
        errorMessage: undefined
    });
};

//render home page with check in card
exports.getCheckIn = (req, res, next) => {
    res.render('user/index', {
        props: req.user,
        pageTitle: 'Staff - Check In',
        path: '/',
        success: undefined,
        error: undefined,
        length: undefined,
        checkInCard: true,
        checkOutCard: undefined,
        aLeaveCard: undefined,
        checkinList: undefined,
        checkoutList: undefined
    });
};

//render home page with check out card
exports.getCheckOut = (req, res, next) => {
    res.render('user/index', {
        props: req.user,
        pageTitle: 'Staff - Check Out',
        path: '/',
        success: undefined,
        error: undefined,
        length: undefined,
        checkInCard: undefined,
        checkOutCard: true,
        aLeaveCard: undefined,
        checkinList: undefined,
        checkoutList: undefined
    });

};

//render home page with annual leave card
exports.getAnnualLeave = (req, res, next) => {
    res.render('user/index', {
        props: req.user,
        pageTitle: 'Staff - Annual Leave',
        path: '/',
        success: undefined,
        error: undefined,
        length: undefined,
        checkInCard: undefined,
        checkOutCard: undefined,
        aLeaveCard: true,
        checkinList: undefined,
        checkoutList: undefined
    });
};

//render home page after post form request
exports.postCheckIn = (req, res, next) => {
    const workPlace = req.body.workPlace;
    const timeCheckin = new Date();

    //checking the first value when there is no check in check out operation
    //Only allowed to continue check-in when the previous check-in has been checked out
    const checkRequest = (req.user.status[req.user.status.length - 1] === undefined) 
        ? false :req.user.status[req.user.status.length - 1].status
    if (!checkRequest) {
        const CheckIn = new checkIn({
            userId: req.user._id,
            time: timeCheckin,
            workLocation: workPlace
        });
        CheckIn.save(); //save to database
       
        User.findById(req.user._id)
        .then(user => {
            user.status = [...user.status, {status: true}]
            return user.save()
        })
        .then(result => {
            req.flash('success', 'Bạn đã check in thành công lúc '+ date('{h}:{Minutes}{ampm} ngày {dd}/{mm}/{yyyy}', timeCheckin) + '. Nơi làm việc: ' + workPlace.toUpperCase())
            console.log('Check in thanh cong');
            res.render('user/index', {
                props: result,
                pageTitle: 'Staff - Check In',
                path: '/',
                success: req.flash('success'),
                error: undefined,
                length: undefined,
                checkInCard: true,
                checkOutCard: undefined,
                aLeaveCard: undefined,
                checkinList: undefined,
                checkoutList: undefined
              });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    } else {
        req.flash('error', 'Check in không thành công. Vui lòng check out trước khi check in')
        console.log('Check in that bai');
        res.render('user/index', {
            props: req.user,
            pageTitle: 'Staff - Check In',
            path: '/',
            success: undefined,
            error: req.flash('error'),
            length: undefined,
            checkInCard: true,
            checkOutCard: undefined,
            aLeaveCard: undefined,
            checkinList: undefined,
            checkoutList: undefined
        });
    }

};

//render home page after post check out form
exports.postCheckOut = (req, res, next) => {
    const userId = req.user._id;
    const timeCheckOut = new Date();
    //same logic check in post
    const checkRequest = (req.user.status[req.user.status.length - 1] === undefined) 
        ? false : req.user.status[req.user.status.length - 1].status
    if (checkRequest) {
        // execute check-out
        const CheckOut = new checkOut({
            userId: userId,
            time: timeCheckOut
        });
        CheckOut.save(); //save to database
        User.findById(userId)
        .then(user => {
            user.status = [...user.status, {status: false}]
            return user.save()
        })
        .then(result => {
            console.log('Check out thanh cong');
            checkIn.find({userId: userId})
            .then(inArr => {
                checkOut.find({userId: userId})
                .then(outArr => {
                    req.flash('success', 'Bạn đã check out thành công lúc ' + date('{h}:{Minutes}{ampm} ngày {dd}/{mm}/{yyyy}', timeCheckOut));
                    res.render('user/index', {
                        props: result,
                        pageTitle: 'Staff - Check Out',
                        path: '/',
                        success: req.flash('success'),
                        error: undefined,
                        length: inArr.length,
                        checkInCard: undefined,
                        checkOutCard: true,
                        aLeaveCard: undefined,
                        checkinList: inArr,
                        checkoutList: outArr
                      });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    } else {
        //unexecute check-out
        req.flash('error', 'Check out thất bại, vui lòng check in trước khi check out')
        console.log('Check out that bai');
        res.render('user/index', {
            props: req.user,
            pageTitle: 'Staff - Check Out',
            path: '/',
            success: undefined,
            error: req.flash('error'),
            length: undefined,
            checkInCard: undefined,
            checkOutCard: true,
            aLeaveCard: undefined,
            checkinList: undefined,
            checkoutList: undefined
            });
    }
};

//render home page after post annual leave form
exports.postAnnualLeave = (req, res, next) => {
    const startDate = new Date(req.body.startDate);
    const startHours = req.body.startHours;
    const endDate = new Date(req.body.endDate);
    const endHours = req.body.endHours;
    const offComment = req.body.offComment;
    const userId = req.user._id;
    const startShift = req.user.startShift;
    const endShift = req.user.endShift;
    const aLremaining = req.user.annualLeave;

    //registration is only allowed when the annual leave remaining > 0
    if (aLremaining == 0) {
        //post failed
        req.flash('error', 'Số ngày phép còn lại không đủ. Vui lòng liên hệ quản lý');
        console.log('that bai', leaveHours(startHours) ,leaveHours(endHours));
        res.render('user/index', {
            props: req.user,
            pageTitle: 'Staff - Annual Leave',
            path: '/',
            success: undefined,
            error: req.flash('error'),
            length: undefined,
            checkInCard: undefined,
            checkOutCard: undefined,
            aLeaveCard: true,
            checkinList: undefined,
            checkoutList: undefined
        })
    } else if (startHours == ''|| endDate == '') {
        req.flash('error', 'Đăng ký thất bại, vui lòng nhập giờ bắt đầu và giờ kết thúc');
        res.render('user/index', {
            props: req.user,
            pageTitle: 'Staff - Annual Leave',
            path: '/',
            success: undefined,
            error: req.flash('error'),
            length: undefined,
            checkInCard: undefined,
            checkOutCard: undefined,
            aLeaveCard: true,
            checkinList: undefined,
            checkoutList: undefined
          });
    } else // check registration conditions by date
    if (endDate.getDate() == startDate.getDate() // case 1: end date request = start date request
    && endDate.getMonth() == startDate.getMonth() 
    && endDate.getFullYear() == startDate.getFullYear()) {
        if (leaveHours(startHours) >= leaveHours(endHours) // continue check registration conditions by hours request
        || leaveHours(startShift) > leaveHours(startHours) // failed if post wrong logic, start hours < end hours
        || leaveHours(endShift) < leaveHours(endHours)
        || timeRemaining(aLremaining, timeUsed(startHours, endHours), 0, 0) < 0){
            req.flash('error', 'Thời gian đăng ký không đúng, vui lòng kiểm tra lại');
            res.render('user/index', {
                props: req.user,
                pageTitle: 'Staff - Annual Leave',
                path: '/',
                success: undefined,
                error: req.flash('error'),
                length: undefined,
                checkInCard: undefined,
                checkOutCard: undefined,
                aLeaveCard: true,
                checkinList: undefined,
                checkoutList: undefined
            });
        } else { // post success 
            const annualLeave = new AnnualLeave({
                userId: userId,
                startDate: startDate,
                startHours: startHours,
                endDate: endDate,
                endHours: endHours,
                offComment: offComment
            });
        
            annualLeave.save(); //save to database
            req.flash('success', 'Đăng ký thành công');

            User.findById(userId)
            .then(user => {
                console.log('thanh cong 1');
                user.annualLeave = timeRemaining(user.annualLeave, timeUsed(startHours, endHours), 0, 0); //calculated annual leave remaining
                return user.save()
            })
            .then(result => {
                res.render('user/index', {
                    props: result,
                    pageTitle: 'Staff - Annual Leave',
                    path: '/',
                    success: req.flash('success'),
                    error: undefined,
                    length: undefined,
                    checkInCard: undefined,
                    checkOutCard: undefined,
                    aLeaveCard: true,
                    checkinList: undefined,
                    checkoutList: undefined
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        }
    } else if (endDate > startDate) { //check with case end date post > start date post
        if (timeRemaining(aLremaining, timeUsed(startHours, endShift), timeUsed(startShift, endHours), ((endDate - startDate)/86400000 - 1)) < 0) {
            req.flash('error', 'Số ngày phép còn lại không đủ. Vui lòng liên hệ quản lý');
            res.render('user/index', {//post failed because total annual remaining < post request
                props: req.user,
                pageTitle: 'Staff - Annual Leave',
                path: '/',
                success: undefined,
                error: req.flash('error'),
                length: undefined,
                checkInCard: undefined,
                checkOutCard: undefined,
                aLeaveCard: true,
                checkinList: undefined,
                checkoutList: undefined
              });
        } else { //post success
            const annualLeave = new AnnualLeave({
                userId: userId,
                startDate: startDate,
                startHours: startHours,
                endDate: endDate,
                endHours: endHours,
                offComment: offComment
            });
        
            annualLeave.save(); //save to database
    
            User.findById(userId)
            .then(user => {
                console.log('thanh cong 1', timeUsed(startHours, endShift), timeUsed(startShift, endHours), (endDate.getDate() - startDate.getDate() - 1));
                user.annualLeave = timeRemaining(user.annualLeave, timeUsed(startHours, endShift), timeUsed(startShift, endHours), ((endDate - startDate)/86400000 - 1));
                return user.save()
            })
            .then(result => {
                req.flash('success', 'Đăng ký thành công');
                res.render('user/index', {
                    props: result,
                    pageTitle: 'Staff - Annual Leave',
                    path: '/',
                    success: req.flash('success'),
                    error: undefined,
                    length: undefined,
                    checkInCard: undefined,
                    checkOutCard: undefined,
                    aLeaveCard: true,
                    checkinList: undefined,
                    checkoutList: undefined
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        }
    } else { //post failed with other case
        req.flash('error', 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin');
        res.render('user/index', {
            props: req.user,
            pageTitle: 'Staff - Annual Leave',
            path: '/',
            success: undefined,
            error: req.flash('error'),
            length: undefined,
            checkInCard: undefined,
            checkOutCard: undefined,
            aLeaveCard: true,
            checkinList: undefined,
            checkoutList: undefined
          });
    };
};

//re-render Staff infomation page after change image url
exports.postChangeImageUrl = (req, res, next) => {
    const userId = req.user._id;
    const newImage = req.file;
    const imageUrl = 'images/' + newImage.filename; //link to folder and sane file before render new image

    if (!newImage) {
        res.status(422).render('user/user-info', {
            props: req.user,
            birth: date('{mm}/{dd}/{yyyy}', new Date(req.user.doB)),//use s-date to format time for render view
            startD: date('{mm}/{dd}/{yyyy}', new Date(req.user.startDate)),
            pageTitle: 'User Infomation',
            path: '/staff-info',
            errorMessage: 'Attach file is not an image!'
        });
    } else {
        User.findById(userId)
        .then(user => {
            user.image = imageUrl;
            return user.save() //save to database
        })
        .then(result => {
            res.redirect('/staff-info')
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });    
    }
};

//render time checking page, because it is a summary page, so need to import a lot of data from models folder
exports.getTimeChecking = (req, res, next) => {
    const page = +req.query.page || 1; //variable to set pagination
    const item_per_page = 10; //default 10 line in the view
    let totalItemCheckin;

    const userId =req.user._id;
    const status = req.user.status[req.user.status.length - 1].status;
    User.findById(userId)
    .then(user => {
        checkIn.find({userId: userId})
        .countDocuments()
        .then(numCheckIns => {
            totalItemCheckin = numCheckIns;
            return checkIn.find({userId: userId})
            .skip((page - 1)*item_per_page)
            .limit(item_per_page)
        })
        .then(checkIns => {
            checkOut.find({userId: userId})
            .then(checkOuts => {
                AnnualLeave.find({userId: userId})
                .then(aLeave => {
                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts;
                    User.find({department: req.user.department, isManager: true})
                    .then(manager => {
                        res.render('user/searchInfo', {
                            props: user,
                            pageTitle: 'Time Checking',
                            path: '/time-checking',
                            length: checkIns.length,
                            checkinList: checkIns,
                            checkoutList: checkOuts,
                            annualLeave: aLeave,
                            salary: undefined,
                            month: undefined,
                            manager: manager[0].name,
                            currentPage: page,
                            hasNextPage: item_per_page * page < totalItemCheckin,
                            hasPreviousPage: page > 1,
                            nextPage: page + 1,
                            previousPage: page -1,
                            lastPage: Math.ceil(totalItemCheckin / item_per_page)
                        });
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//render time checking page affer choose month 
exports.postTimeChecking = (req, res, next) => {
    const userId = req.user._id;
    const status = req.user.status[req.user.status.length - 1].status;
    const salaryScale = req.user.salaryScale;
    const time = req.body.time;

    const page = +req.query.page || 1;
    const item_per_page = 10;
    let totalItemCheckin;

    User.findById(userId)
    .then(user => {
        checkIn.find({userId: userId})
        .countDocuments()
        .then(numCheckIns => {
            totalItemCheckin = numCheckIns;
            return checkIn.find({userId: userId})
            .skip((page - 1)*item_per_page)
            .limit(item_per_page)
        })
        .then(checkIns => {
            checkOut.find({userId: userId})
            .then(checkOuts => {
                AnnualLeave.find({userId: userId})
                .then(aLeave => {
                    let totalLostTime = 0;
                    let totalTime = 0;
                    let timeLeave = 0;
                    let totalTimeLeave = 0

                    // for loop to calculate different time per month
                    for (let j = 0; j < checkOuts.length; j++) {
                        for (let i = 0; i < getMaxDay(getNewYear(time), getNewMonth(time)); i++) {
                            if (getNewDate(checkOuts[j].time).getDate() == i && getNewMonth(checkOuts[j].time) == getNewMonth(time) && getNewYear(checkOuts[j].time) == getNewYear(time)) {
                                totalTime = (getNewDate(checkOuts[j].time) - getNewDate(checkIns[j].time) - 28800000)/28800000
                            } else {
                                totalTime = 0
                            }

                            totalLostTime += totalTime
                        }
                    }

                    //for loop to calculat total annual leave request per month
                    for (let j = 0; j < aLeave.length; j++) {
                        if (getNewMonth(aLeave[j].endDate) == getNewMonth(time) 
                        && getNewMonth(aLeave[j].startDate) == getNewMonth(time)
                        && getNewYear(aLeave[j].endDate == getNewYear(time))) {
                            if (getNewDate(aLeave[j].endDate) > getNewDate(aLeave[j].startDate)) {
                                timeLeave = timeUsed(aLeave[j].startHours, req.user.endShift) 
                                    + timeUsed(req.user.startShift , aLeave[j].endHours) 
                                    + (getNewDate(aLeave[j].endDate) - getNewDate(aLeave[j].startDate))/86400000 - 1
                            } else {
                                timeLeave = timeUsed(aLeave[j].startHours, aLeave[j].endHours)
                            }
                        } else if (getNewMonth(aLeave[j].endDate) > getNewMonth(time) 
                        && getNewMonth(aLeave[j].startDate) == getNewMonth(time)
                        && getNewYear(aLeave[j].endDate == getNewYear(time))) {
                            timeLeave = timeUsed(aLeave[j].startHours, req.user.endShift)
                                    + (new Date(getNewYear(time), getNewMonth(time), getMaxDay(getNewYear(time), getNewMonth(time))) - getNewDate(aLeave[j].startDate))/86400000 - 1
                        } else if (getNewMonth(aLeave[j].endDate) == getNewMonth(time) 
                        && getNewMonth(aLeave[j].startDate) < getNewMonth(time)
                        && getNewYear(aLeave[j].endDate == getNewYear(time))) {
                            timeLeave = timeUsed(req.user.startShift , aLeave[j].endHours) 
                            + (getNewDate(aLeave[j].endDate) - new Date(getNewYear(time), getNewMonth(time), 1))/86400000 - 1
                        } else {
                            timeLeave = 0
                        }
                        totalTimeLeave += timeLeave;                
                    }

                    //if on working, add some object to make length of check out object = check in object
                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts; 
                    
                    const totalSalary = (salaryScale*3000000 + (totalLostTime + totalTimeLeave/8)*200000).toFixed(2); //calculate total salary of month
                    
                    User.find({department: req.user.department, isManager: true})
                    .then(manager => {
                        res.render('user/searchInfo', {
                            props: user,
                            pageTitle: 'Time Checking',
                            path: '/time-checking',
                            length: checkIns.length,
                            checkinList: checkIns,
                            checkoutList: checkOuts,
                            annualLeave: aLeave,
                            salary: numberFormat.format(totalSalary),
                            month: getNewMonth(time) + 1,
                            manager: manager[0].name,
                            currentPage: page,
                            hasNextPage: item_per_page * page < totalItemCheckin,
                            hasPreviousPage: page > 1,
                            nextPage: page + 1,
                            previousPage: page -1,
                            lastPage: Math.ceil(totalItemCheckin / item_per_page)
                        });
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//re-render when change number of line
exports.postNumberofLine = (req, res, next) => {
    const page = +req.query.page || 1;
    const item_per_page = req.body.numberofLine;
    let totalItemCheckin;

    console.log(page)

    const userId =req.user._id;
    const status = req.user.status[req.user.status.length - 1].status;
    User.findById(userId)
    .then(user => {
        checkIn.find({userId: userId})
        .countDocuments()
        .then(numCheckIns => {
            totalItemCheckin = numCheckIns;
            return checkIn.find({userId: userId})
            .skip((page - 1)*item_per_page)
            .limit(item_per_page)
        })
        .then(checkIns => {
            checkOut.find({userId: userId})
            .then(checkOuts => {
                AnnualLeave.find({userId: userId})
                .then(aLeave => {
                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts;
                    User.find({department: req.user.department, isManager: true})
                    .then(manager => {
                        res.render('user/searchInfo', {
                            props: user,
                            pageTitle: 'Time Checking',
                            path: '/time-checking',
                            length: checkIns.length,
                            checkinList: checkIns,
                            checkoutList: checkOuts,
                            annualLeave: aLeave,
                            salary: undefined,
                            month: undefined,
                            manager: manager[0].name,
                            currentPage: page,
                            hasNextPage: item_per_page * page < totalItemCheckin,
                            hasPreviousPage: page > 1,
                            nextPage: page + 1,
                            previousPage: page -1,
                            lastPage: Math.ceil(totalItemCheckin / item_per_page)
                        });
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

//render covid check page
exports.getCovidCheck = (req, res, next) => {
    res.render('user/covidCheck', {
        props: req.user,
        pageTitle: 'Staff - Covid Check',
        path: '/covid-check',
        temper: undefined,
        vaccine: undefined, 
        sick: undefined,
        propsLength: undefined
    })
};

// render covid check page after post temperature
exports.postTemperature = (req, res, next) => {
    const userId = req.user._id;
    const temper = req.body.temperature;
    const timeSubmit = new Date();

    User.findById(userId)
    .then(user => {
        const temperature = new Temperature({
            userId: userId,
            time: timeSubmit,
            temperature: temper
        });

        temperature.save(); //save to database

        res.render('user/covidCheck', {
            props: user,
            pageTitle: 'Staff - Covid Check',
            path: '/covid-check',
            temper: temper,
            vaccine: true,
            sick: undefined,
            propsLength: undefined
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

// render covid check page after post vaccinated
exports.postvaccinated = (req, res, next) => {
    const userId = req.user._id;
    const count = req.body.vaccinated;
    const vaccineName = req.body.vaccineName;
    const date =  req.body.vaccineDate;

    User.findById(userId)
    .then(user => {
        user.vaccinated = [...user.vaccinated, {count: count, vaccinateName: vaccineName, time: date}];
        return user.save() //save to database
    })
    .then(result => {
        res.render('user/covidCheck', {
            props: result,
            pageTitle: 'Staff - Covid Check',
            path: '/covid-check',
            temper: undefined,
            vaccine: true,
            sick: undefined,
            propsLength: undefined
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

// render covid check page after post sick checked
exports.postSickChecked = (req, res, next) => {
    const userId = req.user._id;
    const sick = req.body.sicked;

    User.findById(userId)
    .then(user => {
        user.covidCheck = sick;
        return user.save() //save to database
    })
    .then(result => {
        res.render('user/covidCheck', {
            props: result,
            pageTitle: 'Staff - Covid Check',
            path: '/covid-check',
            temper: undefined,
            vaccine: true,
            sick: true,
            propsLength: undefined
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//render covid check for manager
exports.getCovitCheckManager = (req, res, next) => {
    User.find({department: req.user.department, isManager: false})
    .then(users => {
        res.render('user/covidCheck', {
            props: users,
            pageTitle: 'Manager - Covid Check',
            path: '/covid-check',
            temper: undefined,
            vaccine: undefined, 
            sick: undefined,
            propsLength: users.length
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//download file when manager request
exports.getExportFile = (req, res, next) => {
    const fileName = 'covid-staff-infomation.pdf';
    const covidFilePath = path.join('data', 'covidFile', fileName);
    const pdfDoc = new PDFDocument({ margin: 30, size: 'A4' }); //use pdfkit-table for creat file after download
    User.find({department: req.user.department, isManager: false})
    .then(users => {
        if (users.length == 0) {
            return next();
        } else {
            const table = {
                title: 'THONG TIN COVID CUA NHAN VIEN',
                headers: ['Name', 'Count', 'Vaccine Name', 'Vaccinated Date', 'Status'],
                rows: [],
            }
            for (let i = 0; i < users.length; i++) {
                for (let j = 0; j < users[i].vaccinated.length; j++) {
                    table.rows.push([
                        users[i].name, 
                        users[i].vaccinated[j].count, 
                        users[i].vaccinated[j].vaccinateName, 
                        getNewDate(users[i].vaccinated[j].time).getDate() + '-' + getNewMonth(users[i].vaccinated[j].time) + 1 + '-' + getNewYear(users[i].vaccinated[j].time),
                        (users[i].covidCheck ? 'infected with covid' : 'not infected with covid'),
                    ])
                }
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attach; filename="' + fileName + '"');
            pdfDoc.pipe(fs.createWriteStream(covidFilePath));
            pdfDoc.pipe(res);

            ;(async function() {
                table;
                await pdfDoc.table(table, {
                    prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(13),
                    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                        pdfDoc.font("Helvetica").fontSize(8);
                        indexColumn === 0 && pdfDoc.addBackground(rectRow, 'blue', 0.15)
                    }
                });
                pdfDoc.end();
            })();
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//render Work confirmation view for manager
exports.getWorkConfirmation = (req, res, next) => {
    User.find({department: req.user.department, isManager: false})
    .then(users => {
        res.render('user/workConfirmation', {
            props: users,
            pageTitle: 'Work Confirmation',
            path: '/work-confirmation',
            propsLength: users.length,
        })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//render Staff info for view for manager
exports.getStaffInfomation = (req, res, next) => {
    const userId = req.params.staffId;

    User.findById(userId)
    .then(user => {
        checkIn.find({userId : mongoose.Types.ObjectId(userId)})
        .then(checkIns => {
            checkOut.find({userId : mongoose.Types.ObjectId(userId)})
            .then(checkOuts => {
                console.log(checkOuts)
                AnnualLeave.find({userId : mongoose.Types.ObjectId(userId)})
                .then(aLeave => {
                    const status = user.status[user.status.length - 1].status;
                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts;
                        res.render('user/staff-infomaion', {
                            props: user,
                            pageTitle: user.name + ' Info',
                            path: '/time-checking',
                            length: checkIns.length,
                            checkinList: checkIns,
                            checkoutList: checkOuts,
                            annualLeave: aLeave,
                            salary: undefined,
                            month: undefined
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//delete request from manager and change status
exports.postDeleteTime = (req, res, next) => {
    const userId = req.body.staffId;
    const checkInId = req.body.checkIn;
    const checkOutId = req.body.checkOut;

    checkIn.findById(checkInId)
    .then(checkin => {
        console.log(checkin);
        return checkIn.deleteOne({_id: checkInId, userId: mongoose.Types.ObjectId(userId)});
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

    checkOut.findById(checkOutId)
    .then(checkout => {
        console.log(checkout);
        return checkOut.deleteOne({_id: checkOutId, userId: mongoose.Types.ObjectId(userId)});
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

    console.log(userId, checkInId, checkOutId);

    User.findById(userId)
    .then(user => {
        checkIn.find({userId : mongoose.Types.ObjectId(userId)})
        .then(checkIns => {
            checkOut.find({userId : mongoose.Types.ObjectId(userId)})
            .then(checkOuts => {
                AnnualLeave.find({userId : mongoose.Types.ObjectId(userId)})
                .then(aLeave => {
                    const status = user.status[user.status.length - 1].status;
                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts;
                        res.render('user/staff-infomaion', {
                            props: user,
                            pageTitle: user.name + ' Info',
                            path: '/time-checking',
                            length: checkIns.length,
                            checkinList: checkIns,
                            checkoutList: checkOuts,
                            annualLeave: aLeave,
                            salary: undefined,
                            month: undefined
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

//render with month condition
exports.postMonthTime = (req, res, next) => {
    const userId = req.body.staffId;
    const monthTime = getNewDate(req.body.time);

    User.findById(userId)
    .then(user => {
        checkIn.find({userId : mongoose.Types.ObjectId(userId)})
        .then(checkIns => {
            checkOut.find({userId : mongoose.Types.ObjectId(userId)})
            .then(checkOuts => {
                AnnualLeave.find({userId : mongoose.Types.ObjectId(userId)})
                .then(aLeave => {
                    const status = user.status[user.status.length - 1].status;
                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts;
                        res.render('user/staff-infomaion', {
                            props: user,
                            pageTitle: user.name + ' Info',
                            path: '/time-checking',
                            length: checkIns.length,
                            checkinList: checkIns,
                            checkoutList: checkOuts,
                            annualLeave: aLeave,
                            salary: getNewYear(monthTime),
                            month: getNewMonth(monthTime)
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}
