const User = require('../models/user');
const checkOut = require('../models/checkOut');
const checkIn = require('../models/checkIn');
const AnnualLeave = require('../models/annualLeave');
const Temperature = require('../models/temperature');

const { ObjectId } = require('mongodb');

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
    User.find()
      .then(user => {
        res.render('user/index', {
          props: user[0],
          pageTitle: 'User Controll Center',
          path: '/',
          timerIn: undefined,
          workPlace: undefined,
          requiredIn: undefined,
          timerOut: undefined,
          requiredOut: undefined,
          checkInCard: undefined,
          checkOutCard: undefined,
          aLeaveCard: undefined,
          checkinList: undefined,
          checkoutList: undefined
        });
      })
      .catch(err => {
        console.log(err);
      });
};

//render staff info page
exports.getStaffInfo = (req, res, next) => {
    User.find()
    .then(user => {
      const date = require('s-date');
      const myBirthday = new Date(user[0].doB);
      const startDate = new Date(user[0].startDate);
      res.render('user/user-info', {
        props: user[0],
        birth: date('{mm}/{dd}/{yyyy}', myBirthday),//use s-date to format time for render view
        startD: date('{mm}/{dd}/{yyyy}', startDate),
        pageTitle: 'User Infomation',
        path: '/staff-info'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

//render home page with check in card
exports.getCheckIn = (req, res, next) => {
    User.find()
    .then(user => {
      res.render('user/index', {
        props: user[0],
        pageTitle: 'Staff - Check In',
        path: '/',
        timerIn: undefined,
        workPlace: undefined,
        requiredIn: undefined,
        timerOut: undefined,
        requiredOut: undefined,
        checkInCard: true,
        checkOutCard: undefined,
        aLeaveCard: undefined,
        checkinList: undefined,
        checkoutList: undefined
      });
    })
    .catch(err => {
      console.log(err);
    });
};

//render home page with check out card
exports.getCheckOut = (req, res, next) => {
    User.find()
    .then(user => {
      res.render('user/index', {
        props: user[0],
        pageTitle: 'Staff - Check Out',
        path: '/',
        timerIn: undefined,
        workPlace: undefined,
        requiredIn: undefined,
        timerOut: undefined,
        requiredOut: undefined,
        checkInCard: undefined,
        checkOutCard: true,
        aLeaveCard: undefined,
        checkinList: undefined,
        checkoutList: undefined
      });
    })
    .catch(err => {
      console.log(err);
    });
};

//render home page with annual leave card
exports.getAnnualLeave = (req, res, next) => {
    User.find()
    .then(user => {
      res.render('user/index', {
        props: user[0],
        pageTitle: 'Staff - Annual Leave',
        path: '/',
        timerIn: undefined,
        workPlace: undefined,
        requiredIn: undefined,
        timerOut: undefined,
        requiredOut: undefined,
        checkInCard: undefined,
        checkOutCard: undefined,
        aLeaveCard: true,
        checkinList: undefined,
        checkoutList: undefined
      });
    })
    .catch(err => {
      console.log(err);
    });
};

//render home page after post form request
exports.postCheckIn = (req, res, next) => {
    const workPlace = req.body.workPlace;
    const userId = req.body.userId;
    const date = require('s-date');
    const timeCheckin = new Date();

    //checking the first value when there is no check in check out operation
    //Only allowed to continue check-in when the previous check-in has been checked out
    const checkRequest = (req.user.status[req.user.status.length - 1] === undefined) 
        ? false :req.user.status[req.user.status.length - 1].status
    if (!checkRequest) {
        const CheckIn = new checkIn({
            userId: userId,
            time: timeCheckin,
            workLocation: workPlace
        });
        CheckIn.save(); //save to database
    
        User.findById(userId)
        .then(user => {
            user.status = [...user.status, {status: true}]
            return user.save()
        })
        .then(result => {
            console.log('Check in thanh cong');
            res.render('user/index', {
                props: result,
                pageTitle: 'Staff - Check In',
                path: '/',
                timerIn: date('{h}:{Minutes}{ampm} ngày {dd}/{mm}/{yyyy}', timeCheckin),
                workPlace: workPlace,
                requiredIn: undefined,
                timerOut: undefined,
                requiredOut: undefined,
                checkInCard: true,
                checkOutCard: undefined,
                aLeaveCard: undefined,
                checkinList: undefined,
                checkoutList: undefined
              });
        })
        .catch(err => console.log(err))
    } else {
        User.findById(userId)
        .then(result => {
            console.log('Check in that bai');
            res.render('user/index', {
                props: result,
                pageTitle: 'Staff - Check In',
                path: '/',
                timerIn: undefined,
                workPlace: workPlace,
                requiredIn: true,
                timerOut: undefined,
                requiredOut: undefined,
                checkInCard: true,
                checkOutCard: undefined,
                aLeaveCard: undefined,
                checkinList: undefined,
                checkoutList: undefined
              });
        })
        .catch(err => console.log(err))
    }

};

//render home page after post check out form
exports.postCheckOut = (req, res, next) => {
    const userId = req.user._id;
    console.log(userId);
    const date = require('s-date');
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
            checkIn.find()
            .then(inArr => {
                checkOut.find()
                .then(outArr => {
                    res.render('user/index', {
                        props: result,
                        pageTitle: 'Staff - Check Out',
                        path: '/',
                        timerIn: undefined,
                        workPlace: inArr.length,
                        requiredIn: undefined,
                        timerOut: date('{h}:{Minutes}{ampm} ngày {dd}/{mm}/{yyyy}', timeCheckOut),
                        requiredOut: undefined,
                        checkInCard: undefined,
                        checkOutCard: true,
                        aLeaveCard: undefined,
                        checkinList: inArr,
                        checkoutList: outArr
                      });
                })
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    } else {
        //unexecute check-out
        User.findById(userId)
        .then(result => {
            console.log('Check out that bai');
            res.render('user/index', {
                props: result,
                pageTitle: 'Staff - Check Out',
                path: '/',
                timerIn: undefined,
                workPlace: undefined,
                requiredIn: undefined,
                timerOut: undefined,
                requiredOut: true,
                checkInCard: undefined,
                checkOutCard: true,
                aLeaveCard: undefined,
                checkinList: undefined,
                checkoutList: undefined
              });
        })
        .catch(err => console.log(err))
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
        User.findById(userId)
                .then(result => {
                    console.log('that bai 1', leaveHours(startHours) ,leaveHours(endHours));
                    res.render('user/index', {
                        props: result,
                        pageTitle: 'Staff - Annual Leave',
                        path: '/',
                        timerIn: undefined,
                        workPlace: undefined,
                        requiredIn: undefined,
                        timerOut: undefined,
                        requiredOut: true,
                        checkInCard: undefined,
                        checkOutCard: undefined,
                        aLeaveCard: true,
                        checkinList: undefined,
                        checkoutList: undefined
                    });
                })
                .catch(err => console.log(err))
    } else // check registration conditions by date
    if (endDate.getDate() == startDate.getDate() // case 1: end date request = start date request
    && endDate.getMonth() == startDate.getMonth() 
    && endDate.getFullYear() == startDate.getFullYear()) {
        if (leaveHours(startHours) >= leaveHours(endHours) // continue check registration conditions by hours request
        || leaveHours(startShift) > leaveHours(startHours) // failed if post wrong logic, start hours < end hours
        || leaveHours(endShift) < leaveHours(endHours)
        || timeRemaining(aLremaining, timeUsed(startHours, endHours), 0, 0) < 0){
            User.findById(userId)
                .then(result => {
                    console.log('that bai 1', leaveHours(startHours) ,leaveHours(endHours));
                    res.render('user/index', {
                        props: result,
                        pageTitle: 'Staff - Annual Leave',
                        path: '/',
                        timerIn: undefined,
                        workPlace: undefined,
                        requiredIn: undefined,
                        timerOut: undefined,
                        requiredOut: true,
                        checkInCard: undefined,
                        checkOutCard: undefined,
                        aLeaveCard: true,
                        checkinList: undefined,
                        checkoutList: undefined
                    });
                })
                .catch(err => console.log(err))
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
                    timerIn: undefined,
                    workPlace: undefined,
                    requiredIn: undefined,
                    timerOut: true,
                    requiredOut: undefined,
                    checkInCard: undefined,
                    checkOutCard: undefined,
                    aLeaveCard: true,
                    checkinList: undefined,
                    checkoutList: undefined
                });
            })
            .catch(err => console.log(err))
        }
    } else if (endDate > startDate) { //check with case end date post > start date post
        if (timeRemaining(aLremaining, timeUsed(startHours, endShift), timeUsed(startShift, endHours), ((endDate - startDate)/86400000 - 1)) < 0) {
            User.findById(userId) //post failed because total annual remaining < post request
            .then(result => {
                res.render('user/index', {
                    props: result,
                    pageTitle: 'Staff - Annual Leave',
                    path: '/',
                    timerIn: undefined,
                    workPlace: undefined,
                    requiredIn: undefined,
                    timerOut: undefined,
                    requiredOut: true,
                    checkInCard: undefined,
                    checkOutCard: undefined,
                    aLeaveCard: true,
                    checkinList: undefined,
                    checkoutList: undefined
                  });
            })
            .catch(err => console.log(err))
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
                res.render('user/index', {
                    props: result,
                    pageTitle: 'Staff - Annual Leave',
                    path: '/',
                    timerIn: undefined,
                    workPlace: undefined,
                    requiredIn: undefined,
                    timerOut: true,
                    requiredOut: undefined,
                    checkInCard: undefined,
                    checkOutCard: undefined,
                    aLeaveCard: true,
                    checkinList: undefined,
                    checkoutList: undefined
                });
            })
            .catch(err => console.log(err))
        }
    } else { //post failed with other case
        User.findById(userId)
        .then(result => {
            res.render('user/index', {
                props: result,
                pageTitle: 'Staff - Annual Leave',
                path: '/',
                timerIn: undefined,
                workPlace: undefined,
                requiredIn: undefined,
                timerOut: undefined,
                requiredOut: true,
                checkInCard: undefined,
                checkOutCard: undefined,
                aLeaveCard: true,
                checkinList: undefined,
                checkoutList: undefined
              });
        })
        .catch(err => console.log(err))
    }

    
};

//re-render Staff infomation page after change image url
exports.postChangeImageUrl = (req, res, next) => {
    const userId = req.user._id;
    const newUrl = req.body.newUrl;

    User.findById(userId)
    .then(user => {
        user.image = newUrl
        return user.save() //save to database
    })
    .then(result => {
        res.redirect('/staff-info')
    })
    .catch(err => console.log(err))
};

//render time checking page, because it is a summary page, so need to import a lot of data from models folder
exports.getTimeChecking = (req, res, next) => {
    const userId =req.user._id;
    const status = req.user.status[req.user.status.length - 1].status;
    User.findById(userId)
    .then(user => {
        checkIn.find()
        .then(checkIns => {
            checkOut.find()
            .then(checkOuts => {
                AnnualLeave.find()
                .then(aLeave => {
                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts;
                
                    res.render('user/searchInfo', {
                        props: user,
                        pageTitle: 'Time Checking',
                        path: '/time-checking',
                        length: checkIns.length,
                        checkinList: checkIns,
                        checkoutList: checkOuts,
                        annualLeave: aLeave,
                        salary: undefined,
                        month: undefined
                    });
                })
                .catch(err => console.log(err));
                
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

//render time checking page affer choose month 
exports.postTimeChecking = (req, res, next) => {
    const userId =req.user._id;
    const status = req.user.status[req.user.status.length - 1].status;
    const salaryScale = req.user.salaryScale;
    const time = req.body.time;

    User.findById(userId)
    .then(user => {
        checkIn.find()
        .then(checkIns => {
            checkOut.find()
            .then(checkOuts => {
                AnnualLeave.find()
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
                
                    res.render('user/searchInfo', {
                        props: user,
                        pageTitle: 'Time Checking',
                        path: '/time-checking',
                        length: checkIns.length,
                        checkinList: checkIns,
                        checkoutList: checkOuts,
                        annualLeave: aLeave,
                        salary: numberFormat.format(totalSalary),
                        month: getNewMonth(time) + 1
                    });
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

//render covid check page
exports.getCovidCheck = (req, res, next) => {
    const userId = req.user._id;

    User.findById(userId)
    .then(user => {
        res.render('user/covidCheck', {
            props: user,
            pageTitle: 'Staff - Covid Check',
            path: '/covid-check',
            temper: undefined,
            vaccine: undefined, 
            sick: undefined,
        })
    })
    .catch(err => console.log(err))
};

// render covid check page after post temperature
exports.postTemperature = (req, res, next) => {
    const userId = req.user._id;
    const temper = req.body.temperature;
    const timeSubmit = new Date();

    User.findById(userId)
    .then(user => {
        const temperature = new Temperature({
            userId: ObjectId(userId),
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
        });
    })
    .catch(err => console.log(err))
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
        });
    })
    .catch(err => console.log(err))
};

// render covid check page after post sick checked
exports.postSickChecked = (req, res, next) => {
    const userId = req.user._id;
    const sick = req.body.sicked;

    User.findById(userId)
    .then(user => {
        user.covidCheck = sick;
        console.log(user)
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
        });
    })
    .catch(err => console.log(err))
};