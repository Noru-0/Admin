function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // Create an error object to pass to the view
        const error = {
            status: 401,
            message: 'Unauthorized access. Please log in to continue.',
            stack: (new Error()).stack // Optional: include stack trace if needed
        };

        // Render the error page and pass the error object
        res.status(401).render('error', { error, layout: 'main' });
    }
}

const ensureAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    if (req.user.role !== 'Admin') {
        const error = {
            status: 403,
            message: 'Access denied. Admins only.',
            stack: (new Error()).stack // Optional: include stack trace if needed
        };

        return res.status(403).render('error', { error, layout: 'main' });
    }

    next();
};

module.exports = { ensureAuthenticated, ensureAdmin };
