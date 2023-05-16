const express = require('express');
const router = new express.Router();
const jwt = require("jsonwebtoken");
const conn = require('../database');

router.post('/login',(req, res) => {

  const { username, password } = req.body;
  if (!(username && password)) {
    res.status(400).send("All input is required");
  }  

  conn.query(
    "select username,merchantId,id,(select EntityId from retailerid where retailerid=merchantId) as fiid from users where username=? and password=? ",
    [req.body.username, req.body.password],
    function (err, data, fields) {
      if (err) return next(new AppError(err, 500));
      let token = null;
      if(data.length>0){
        token = jwt.sign(
          { username: req.body.username, merchantId: data[0].merchantId, id: data[0].id, fiid: data[0].fiid },
          'e9f82da1a',
          { expiresIn: "12h", }
        );
      }      
      res.status(200).json({
        length: data?.length,
        data: true,
        token: token,
      }); 
    }
  );

  
});

router.post('/signup',(req, res) => {
    const values = [req.body.firstName, req.body.lastName, req.body.merchantId, req.body.emailAddress, req.body.username,
                    req.body.password, req.body.role, new Date(), new Date(), req.body.scale];
    conn.query(
      "insert into users (firstName, lastName, merchantId, emailAddress, username, password, role, createdAt, updatedAt, scale) VALUES(?)",
      [values],
      function (err, data, fields) {
        if (err){ console.log('err',err); return next(new AppError(err, 500)) };
        res.status(201).json({
          status: true
        });
      }
    );
});

router.post('/signup_merch_check',(req, res) => {
    conn.query(
      "select count(*) as total from retailerid where RetailerId=?",
      [req.body.merchantId],
      function (err, data, fields) {
        if (err) return next(new AppError(err, 500));
        res.status(200).json({
          length: data?.length,
          data: data,
        }); 
      }
    );
});

module.exports = router;
  

