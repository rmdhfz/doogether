const express = require('express'),
    router = express.Router(),
    bcrypt = require('bcryptjs'),
    verifyToken = require('../helpers/main'),
    db = require('../helpers/db'),
    jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const {name, email, password, confirm} = req.body;
    if (password !== confirm) {
        return res.status(400).json({'status': false, 'messege': 'Password is not match'});
    }
    let isUse = false;
    const EmailCheck = await db.query("SELECT ID FROM user WHERE email = ?", email, async (err, resp) => {
        if (err) {
            return res.status(500).json({'status': false, 'messege': 'internal server error'})
            console.error(`Error is ${err}`)
        }
        if (resp.length > 0) {
            isUse = true;
        }
        if (isUse) {
            res.status(400).json({error: 'Email already taken'})
        }else{
            const salt = await bcrypt.genSalt(10), hashPassword = await bcrypt.hash(password, salt);
            try {
                const data = {
                    name: name,
                    email: email,
                    password: hashPassword,
                    created: new Date().toISOString()
                }
                const registeredUser = await db.query('INSERT INTO user SET ?', data, (err, resp) => {
                    if (err) {
                        console.error(`Error is ${err}`)
                        return res.status(500).json({'status': false, 'messege': 'internal server error'})
                    }
                    res.status(201).json({'status': true, 'messege': 'Successfully save user', 'data': resp.insertId});
                });
            } catch (err) {
                res.status(400).json(err);
            }
        }
    })
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    if (!email) {
        res.status(400).json({'status': false, 'messege': 'Email address is empty'});
    }
    const checkEmail = await db.query("SELECT ID, password FROM user WHERE email = ?", email, async (err, resp) => {
        if (err) {
            res.status(500).json({'status': false, 'messege': 'internal server error'})
        }
        if (resp.length > 0) {
            try {
                const data = resp[0];
                const validatePassword = await bcrypt.compare(password, data.password);
                if (!validatePassword){
                    return res.status(400).send('Email or password wrong');
                }else {
                    const token = jwt.sign({ID: data.ID}, process.env.SECRET);
                    if (token) {
                        res.header('token', token).status(200).json({'status': true, 'messege': 'Successfully login', 'data': token});
                    }else {
                        console.error(`failed generate token`)
                    }   
                }
            } catch (err) {
                res.json(err);
            }
        }else{
            res.status(404).json({'status': false, 'messege': 'user not found'})
        }
    })
})

module.exports = router;