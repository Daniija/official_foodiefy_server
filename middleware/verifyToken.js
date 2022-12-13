const jwt = require('jsonwebtoken');
exports.verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send("unauthorized request")
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token == 'null') {
        return res.status(401).send("there has been an unauthorized request")
    }
    let payload = jwt.verify(token, process.env.SECRETKEY)
    if (!payload) {
        return res.status(401).send("there has been an unauthorized request")
    }
    req.userId = payload.subject;
    req.email = payload.email;
    next()
}
