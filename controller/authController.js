let User = require('../models/user');
let Otp = require('../models/otp');
const jwt = require('jsonwebtoken');
let sendMail = require('../mail/mail');
let bcrypt = require('bcrypt');
require('dotenv').config();

exports.getCheck = (req, res, next) => {
    res.json({ msg: "All ok" })
}


exports.register = async (req, res) => {
    var user = new User({
        contact: req.body.phone,
        email: req.body.email,
        name: req.body.name,
        role: "user",
        password: User.hash(req.body.p1),
    });
    User.find({ email: req.body.email }, (err, users) => {

        if (err) {
            console.log("There was an error in finding the email.");
            res.json({ msg: "some error!" });
        }
        if (users.length != 0) {
            console.log("User email has already been registered");
            res.json({ msg: "User email has already been registered" });
        }
        else {
            user.save((error, registeredUser) => {
                if (error) {
                    console.log("Error");
                    res.json({ msg: "Error" });
                }
                else {
                    console.log("A User has been registered!");
                    res.status(200).json({ message: "A User has been registered!" })
                }
            })
        }
    });
};


exports.logIn = (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            console.log(err)
            res.json({ msg: "Somthing went wrong" });
        }
        else {
            if (!user) {
                res.json({ msg: 'Your email is Invalid' })
            }
            else {
                bcrypt.compare(req.body.p, user.password).then(match => {
                    if (match) {
                        console.log("You have been logged in successfully");
                        let payload = { subject: user._id, email: user.email }
                        let token = jwt.sign(payload, process.env.SECRETKEY, {
                            expiresIn: "1h"
                        })
                        res.status(200).json({ token: token, role: user.role, blocked: user.blocked })
                    }
                    else {
                        console.log("Your password is incorrect");
                        res.json({ msg: 'Your password is incorrect' })
                    }
                }).catch(err => {
                    console.log(err);
                    res.json({ msg: 'Somthing went wrong', err })
                })
            }
        }
    });
};

function getEmail(email) {
    Otp.find({ email: email }, (err, otps) => {

        if (err) {
            console.log("Your Email cannot be found");
        }
        if (otps.length != 0) {
            console.log("Deleted");
            Otp.deleteOne({ email: email }, (err) => {
                if (err)
                    console.log("Error");
            }
            )
        }
    });
}

exports.Reset = (req, res) => {
    User.find({ email: req.body.email }, async (err, users) => {

        if (err) {
            console.log("Your email cannot be found");
            res.json({ msg: "Error" });
        }
        if (users.length == 0) {
            console.log("This email doesnt exist");
            res.json({ msg: "This email doesnt exist" });
        }
        else {
            Otp.findOne({ email: req.body.email }, async (err, otp) => {
                if (err) {
                    console.log("This email doesnt exist");
                    res.json({ msg: "Error" });
                }
                if (otp) {
                    console.log(otp.otp);
                    sendMail(req.body.email, otp.otp);
                    setTimeout(async function () {
                        console.log("timeout (2min)");
                        var y = await getEmail(req.body.email)
                    }, 2 * 60000);
                    res.status(201).json({ message: "One Time Password has been sent" });
                }
                else {
                    var email = req.body.email
                    var x = await getEmail(req.body.email)
                    setTimeout(async function () {
                        console.log("timeout (2min)");
                        var y = await getEmail(email)
                    }, 2 * 60000);
                    var a = Math.floor(1000 + Math.random() * 9000);
                    var otp = new Otp({
                        otp: a,
                        email: req.body.email
                    });
                    // console.log("otp =", otp);
                    try {
                        doc = otp.save();
                        sendMail(otp.email, otp.otp);
                        res.status(201).json({ message: "One Time Password has been sent" });
                    }
                    catch (err) {
                        res.json({ msg: "some error!" });
                    }
                }
            });
        };
    });
}


exports.resestPasswordDone = (req, res) => {
    User.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            console.log(err)
            res.json({ msg: "Somthing went wrong" });
        }
        else {
            if (!user) {
                res.json({ msg: 'User does not exist with this email!!' })
            }
            else {
                Otp.findOne({ email: req.body.email }, async (err, otps) => {
                    if (err) {
                        res.json({ msg: "Somthing went wrong" });
                    }
                    if (!otps) {
                        res.json({ msg: "One Time Password has expired" });
                    }
                    else {
                        var otp = otps.otp;
                        if (otp != req.body.otp) {
                            res.json({ msg: "One Time Password is Invalid." });
                        }
                        else {
                            var p = User.hashPassword(req.body.p1)
                            var x = await getEmail(req.body.email)
                            User.updateOne({ email: req.body.email },
                                { password: p }, function (err, user) {
                                    console.log(1);
                                    if (err) {
                                        console.log(err)
                                        res.json({ msg: "Somthing went wrong" });
                                    }
                                    else {
                                        res.json({ message: "Password has been updated successfully" });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}


exports.changePassword = (req, res) => {
    User.findOne({ email: req.email }, (err, user) => {
        if (err) {
            res.json({ msg: "Somthing went wrong" });
        }
        else {
            if (!user) {
                res.json({ msg: "Somthing went wrong" });
            }
            else {
                bcrypt.compare(req.body.op, user.password).then(match => {
                    if (match) {
                        console.log("Your old password is correct");
                        console.log(req.body.p1);
                        var p = User.hashPassword(req.body.p1)
                        User.updateOne({ email: req.email },
                            { password: p }, function (err, user) {
                                if (err) {
                                    console.log(err);
                                    res.json({ msg: "Somthing went wrong" });
                                }
                                else {
                                    console.log("Your Password has been changed successfully");
                                    res.status(200).json({ msg: "Your Password has been changed" });
                                }
                            })
                    }
                    else {
                        console.log("Your password is incorrect!");
                        res.json({ msg: 'Your old password is incorrect!' });
                    }
                }).catch(err => {
                    res.json({ msg: 'Somthing went wrong' });
                })
            }
        }
    });
}
