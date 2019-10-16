const express=require('express');
const router=express.Router();
const ValidateField=require('../../utils/ValidateField');
const bcrypt=require('bcrypt');
const User=require('../../database/models/User');

router.post('/users',
    [
        (req,res,next)=>{
            ValidateField.validateJson({
                user_name: new ValidateField(req.body.user_name).minLength(2).maxLenght(15).required().custom(async()=>{
                    let user=await User.findByFields({user_name:req.body.user_name})
                        .then(res=>Promise.resolve(res)).catch((err)=>Promise.reject(undefined));
                    if(user)return Promise.reject('Este nombre de usuario ya existe');
                    else return Promise.resolve();
                }),
                email:new ValidateField(req.body.email,'email').string().email().maxLenght(31).required().custom(async()=>{
                    let user=await User.findByFields({email:req.body.email})
                        .then(res=>Promise.resolve(res)).catch((err)=>Promise.reject(undefined));
                    if(user)return Promise.reject('Este correo ya existe');
                    else return Promise.resolve();
                }),
                password:new ValidateField(req.body.password).string().minLength(6).maxLenght(31).required(),
                name:new ValidateField(req.body.name).string().minLength(2).maxLenght(31).required(),
            })
                .then(()=>{
                    let user=new User();
                    user.user_name=req.body.user_name;
                    user.email=req.body.email;
                    user.password=req.body.password;
                    user.name=req.body.name;
                    req.user=user;
                    next();
                })
                .catch(err=>res.status(400).json(err));
        }
    ],
    (req,res)=>{

        let user=req.user;

        bcrypt.hash(user.password, 10)
            .then(hash =>{
                user.password=hash;
                return User.create(user);
            })
            .then(()=>res.status(201).end())
            .catch(err=>{
                res.status(500).json({
                    message:'error tratando de crear el usuario',
                    internal_message:err.message
                });
            });
    }
);

router.use('/users/tokens',require('./tokens'));
module.exports=router;