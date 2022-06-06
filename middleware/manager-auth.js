exports.isManager = (req, res, next) => {
    if (!req.user.isManager) {
        return res.redirect('/');
    }
    next();
};

exports.isStaff = (req, res, next) => {
    if (req.user.isManager) {
        return res.redirect('/work-confirmation');
    }
    next();
};