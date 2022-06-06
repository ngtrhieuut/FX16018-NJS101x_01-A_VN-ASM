module.exports = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    req.session.returnTo = req.originalUrl; 
    res.redirect('/login');
}