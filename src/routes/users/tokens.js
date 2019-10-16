const express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken=require('../../middlewares/verifyToken');
var router = express.Router();
var User=require('../../database/models/User');
var ValidateField=require('../../utils/ValidateField');
const bcrypt=require('bcrypt');

function incorrectUserPass(res){
    res.status(401).json({
        message:'Verifique los datos ingresados e inténtelo de nuevo.'
    });
}

router.post('/',
    (req,res,next)=>{
        ValidateField.validateJson({
                user_email:new ValidateField(req.body.user_email).required().empty(),
                password:new ValidateField(req.body.password).required().empty()
            })
            .then(()=>next())
            .catch(err=>{
                res.status(400).json(err);
            });
    }
,(req,res)=>{
    const {user_email,password}=req.body;

    User.findByFields({user_name:user_email,email:user_email},'OR')
        .then(async(user)=>{
            if(user===undefined)incorrectUserPass(res);
            else if( await bcrypt.compare(password, user.password)){
                jwt.sign(
                    {
                        id:user.id,
                        user_name:user.user_name,
                        email:user.email,
                        name:user.name
                    }, process.env.TOKEN_SEED,{ expiresIn: process.env.TOKEN_EXPIRATION }, 
                    (err, token) => {
                        
                        if (err) res.status(500).json(err);
                        else res.json({token});
                    }
                ); 
            }
            else incorrectUserPass(res);
        })
        .catch(err=>{
            res.status(500).json({
                internal_message:err.message
            });
        });
});



router.get('/verify',[verifyToken],(req,res)=>{
    res.status(200).end();
});


module.exports = router;