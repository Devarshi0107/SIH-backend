// middlewares/isAdmin.js




// old Version
module.exports = (req, res, next) => {
    // Assuming req.user is set after authentication
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  };
  