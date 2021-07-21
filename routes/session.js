const express = require('express'),
    router = express.Router(),
    {verifyToken, getToken} = require('../helpers/main'),
    db = require('../helpers/db'),
    jwt = require('jsonwebtoken'),
    jwtDecode = require('jwt-decode');

router.get('/list', verifyToken, async (req, res) => {
    const {user_id, keyword, duration} = req.body;
    try {
        const query = `SELECT 
                       s.name, 
                       s.description,
                       s.start, 
                       s.duration,
                       s.created as created_session, 
                       u.ID,
                       u.name,
                       u.email

                       FROM session s 
                       INNER JOIN user u ON u.ID = s.userID 
                       WHERE s.userID = ? ORDER BY s.created DESC`
        const getList = await db.query(query, [user_id], async (err, resp) => {
            if (err) {
                console.error(`Error is ${err}`)
                return res.status(500).json({'status': false, 'messege': 'internal server error'})
            }
            if (resp.length > 0) {
                res.status(200).json({'status': true, 'messege': 'Success', data: resp})
            }else{
                res.status(404).json({'status': false, 'messege': 'Not found'})
            }
        })
    } catch (err) {
        console.error(`Error catch is ${err}`)
    }
})

router.get('/detail/:session_id', verifyToken, async (req, res) => {
    const session_id = req.params.session_id;
    if (!session_id) {
        return res.status(400).json({'error': 'bad parameter'})
    }
    try {
        const getDetail = await db.query("SELECT * FROM session WHERE ID = ?", session_id, (err, resp) => {
            if (err) {
                console.error(`Error is ${err}`)
                return res.status(500).json({'status': false, 'messege': 'internal server error'})
            }
            if (resp.length > 0) {
                res.status(200).json({'status': true, 'messege': 'Successfully get detail session', 'data': resp})
            }else{
                res.status(404).json({'status': false, 'messege': 'Session not found'})
            }
        });
    } catch (err) {
        console.error(`Error catch is ${err}`)
    }
})

router.post('/create', verifyToken, async (req, res) => {
    const {name, description, start, duration} = req.body;
    const token = req.header('token'), userID = jwtDecode(token).ID;
        if (!userID) {
            return res.status(400).json({'status': false, 'messege': 'failed get ID from token'}) 
        }
        try {
           const data = {
               userID: userID,
               name: name,
               description: description,
               start: start,
               duration: duration,
               created: new Date().toISOString() 
           }
           const CreatedSession = await db.query("INSERT INTO session SET ?", data, (err, resp) => {
               if (err) {
                   console.error(`Error is ${err}`)
                   return res.status(500).json({'status': false, 'messege': 'internal server error'})
               }
               if (resp) {
                   res.status(201).json({'status': true, 'messege': 'Successfully save session', 'data': resp.insertId});
               }
           })
        } catch (err) {
            console.error(`Error catch is ${err}`)
        }
})

router.put('/update/:session_id', verifyToken, async (req, res) => {
    const {session_id, name, description, start, duration} = req.body;
    const token = req.header('token'), userID = jwtDecode(token).ID;
        if (!userID) {
            return res.status(400).json({'status': false, 'messege': 'failed get ID from token'}) 
        }
        try {
           const data = {
               userID: userID,
               name: name,
               description: description,
               start: start,
               duration: duration,
               updated: new Date().toISOString()
           }
           const CreatedSession = await db.query("UPDATE session SET ? WHERE ID = ? AND userID = ?", [data, session_id, userID], (err, resp) => {
               if (err) {
                   console.error(`Error is ${err}`)
                   return res.status(500).json({'status': false, 'messege': 'internal server error'})
               }
               if (resp) {
                   res.status(201).json({'status': true, 'messege': 'Successfully update session'});
               }
           })
        } catch (err) {
            console.error(`Error catch is ${err}`)
        }
})

router.delete('/delete/:session_id', verifyToken, async (req, res) => {
    const {session_id, name, description, start, duration} = req.body;
    const token = req.header('token'), userID = jwtDecode(token).ID;
        if (!userID) {
            return res.status(400).json({'status': false, 'messege': 'failed get ID from token'}) 
        }
        try {
           const CreatedSession = await db.query("DELETE FROM session WHERE ID = ? AND userID = ?", [session_id, userID], (err, resp) => {
               if (err) {
                   console.error(`Error is ${err}`)
                   return res.status(500).json({'status': false, 'messege': 'internal server error'})
               }
               if (resp) {
                   res.status(201).json({'status': true, 'messege': 'Successfully delete session'});
               }
           })
        } catch (err) {
            console.error(`Error catch is ${err}`)
        }
})

module.exports = router;