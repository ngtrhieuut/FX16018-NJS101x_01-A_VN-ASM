const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    return res.render('authentication/login', {
        csrfToken: req.csrfToken(),
        errorMessage: req.flash('error')
    })
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login')
    })
};

exports.postLogin = (req, res, next) => {
    const staffId = req.body.username;
    const pass = req.body.pass;

    User.findOne({idStaff: staffId})
    .then(user => {
        if (user &&  pass.toString() === user.password.toString()) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save(err => {
                console.log(err);
                return res.redirect(req.session.returnTo || '/');
            })
        } else {
            req.flash('error', 'Tên đăng nhập hoặc mật khẩu không đúng');
            return res.redirect('/login');
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};