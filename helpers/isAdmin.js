module.exports = {
    isAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.isAdmin == 1) {
            return next();
        }
        req.flash("error_msg", "Para acede a esta área, precisa ser um administrador!");
        res.redirect("/home");
    }
};