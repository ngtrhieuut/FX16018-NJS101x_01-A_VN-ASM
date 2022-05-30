const User = require('../models/user');
const checkOut = require('../models/checkOut');
const checkIn = require('../models/checkIn');
const AnnualLeave = require('../models/annualLeave');
const Temperature = require('../models/temperature');

const { ObjectId } = require('mongodb');

const leaveHours = (a) => {
    const hours = a.split(':');
    const seconds =  hours[0]*3600 + hours[1]*60;
    return seconds
}

const timeUsed = (startTime, endTime) => {
    const difference = (leaveHours(endTime) - leaveHours(startTime))/28800
    return difference
}

const timeRemaining = (annualLeave, timeUsed1, timeUsed2, dayUsed) => {
    const remaining = (annualLeave - timeUsed1 - timeUsed2 - dayUsed).toFixed(2);
    return remaining
}

const getMaxDay = (year, month) => {
    return new Date(year, month, 0).getDate();
};

const numberFormat = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
});

const getNewMonth = (month) => {
    return new Date(month).getMonth()
};

const getNewYear = (year) => {
    return new Date(year).getFullYear()
};

const getNewDate = (date) => {
    return new Date(date)
};

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

exports.getStaffInfo = (req, res, next) => {
    User.find()
    .then(user => {
      const date = require('s-date');
      const myBirthday = new Date(user[0].doB);
      const startDate = new Date(user[0].startDate);
      res.render('user/user-info', {
        props: user[0],
        birth: date('{mm}/{dd}/{yyyy}', myBirthday),
        startD: date('{mm}/{dd}/{yyyy}', startDate),
        pageTitle: 'User Infomation',
        path: '/staff-info'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

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

exports.postCheckIn = (req, res, next) => {
    const workPlace = req.body.workPlace;
    const userId = req.body.userId;
    const date = require('s-date');
    const timeCheckin = new Date();
    const checkRequest = (req.user.status[req.user.status.length - 1] === undefined) 
        ? false :req.user.status[req.user.status.length - 1].status
    if (!checkRequest) {
        const CheckIn = new checkIn({
            userId: userId,
            time: timeCheckin,
            workLocation: workPlace
        });
        CheckIn.save();
    
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

exports.postCheckOut = (req, res, next) => {
    const userId = req.user._id;
    console.log(userId);
    const date = require('s-date');
    const timeCheckOut = new Date();
    const checkRequest = (req.user.status[req.user.status.length - 1] === undefined) 
        ? false : req.user.status[req.user.status.length - 1].status
    if (checkRequest) {
        // thực thi check out
        const CheckOut = new checkOut({
            userId: userId,
            time: timeCheckOut
        });
        CheckOut.save();
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

    if (aLremaining == 0) {
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
    } else if (endDate.getDate() == startDate.getDate() && endDate.getMonth() == startDate.getMonth() && endDate.getFullYear() == startDate.getFullYear()) {
        if (leaveHours(startHours) >= leaveHours(endHours) 
        || leaveHours(startShift) > leaveHours(startHours) 
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
        } else {
            const annualLeave = new AnnualLeave({
                userId: userId,
                startDate: startDate,
                startHours: startHours,
                endDate: endDate,
                endHours: endHours,
                offComment: offComment
            });
        
            annualLeave.save();

            User.findById(userId)
            .then(user => {
                console.log('thanh cong 1');
                user.annualLeave = timeRemaining(user.annualLeave, timeUsed(startHours, endHours), 0, 0);
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
    } else if (endDate > startDate) {
        if (timeRemaining(aLremaining, timeUsed(startHours, endShift), timeUsed(startShift, endHours), ((endDate - startDate)/86400000 - 1)) < 0) {
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
        } else {
            const annualLeave = new AnnualLeave({
                userId: userId,
                startDate: startDate,
                startHours: startHours,
                endDate: endDate,
                endHours: endHours,
                offComment: offComment
            });
        
            annualLeave.save();
    
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
    } else {
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

exports.postChangeImageUrl = (req, res, next) => {
    const userId = req.user._id;
    const newUrl = req.body.newUrl;

    User.findById(userId)
    .then(user => {
        user.image = newUrl
        return user.save()
        console.log(newUrl);
    })
    .then(result => {
        res.redirect('/staff-info')
    })
    .catch(err => console.log(err))
};

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

                    const checkOutlist = (status) ? checkOuts.push({time: 'Đang làm việc'}) : checkOuts;
                    
                    const totalSalary = (salaryScale*3000000 + (totalLostTime + totalTimeLeave/8)*200000).toFixed(2);
                
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

        temperature.save();

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

exports.postvaccinated = (req, res, next) => {
    const userId = req.user._id;
    const count = req.body.vaccinated;
    const vaccineName = req.body.vaccineName;
    const date =  req.body.vaccineDate;

    User.findById(userId)
    .then(user => {
        user.vaccinated = [...user.vaccinated, {count: count, vaccinateName: vaccineName, time: date}];
        return user.save()
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

exports.postSickChecked = (req, res, next) => {
    const userId = req.user._id;
    const sick = req.body.sicked;

    User.findById(userId)
    .then(user => {
        user.covidCheck = sick;
        console.log(user)
        return user.save()
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