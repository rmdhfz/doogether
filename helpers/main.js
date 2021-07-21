const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const token = req.header('token');
    if (!token) {
        return res.status(401).send('Access Denied');
    }
    try {
        const verified = jwt.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
}

const getToken = (req, res, next) => {
    const token = req.header('token');
    if (!token) {
        return res.status(401).send('Access Denied');
    }
    const tk = token.split(' ');
    return jwt.verify(token[1], process.env.SECRET);
}


module.exports = {verifyToken, getToken}