const express=require('express');
const router=express.Router();
const ValidateField=require('../../utils/ValidateField');
const bcrypt=require('bcrypt');
const User=require('../../database/models/User');
const verifyToken=require('../../middlewares/verifyToken');

router.post('/users',
    [
        (req,res,next)=>{
            ValidateField.validateJson({
                email:new ValidateField(req.body.email,false).string().email().maxLenght(31).required().custom(async()=>{
                    let user=await User.findByFields({email:req.body.email})
                        .then(res=>Promise.resolve(res)).catch((err)=>Promise.reject(undefined));
                    if(user)return Promise.reject('Este correo esta en uso');
                    else return Promise.resolve();
                }),
                password:new ValidateField(req.body.password).string().minLength(6).maxLenght(32).required(),
                name:new ValidateField(req.body.name).string().minLength(2).maxLenght(15).required(),
                sur_name:new ValidateField(req.body.sur_name).string().minLength(2).maxLenght(15).required(),
                gender:new ValidateField(req.body.gender).string().accept(['M','F']).required(),
                birth_date:new ValidateField(req.body.birth_date).string().date().required(),
                role:new ValidateField(req.body.role).string().accept(['C','E']).required()
            })
                .then(()=>{
                    let user=new User();
                    user.email=req.body.email;
                    user.password=req.body.password;
                    user.name=req.body.name;
                    user.sur_name=req.body.sur_name;
                    user.gender=req.body.gender;    
                    user.birth_date=req.body.birth_date;
                    user.role=req.body.role;
                    req.user=user;
                    next();
                })
                .catch(err=>{
                    res.status(400).json(err);
                });
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
                console.log(err);
                res.status(500).json({
                    message:'error tratando de crear el usuario',
                    internal_message:err.message
                });
            });
    }
);

router.get('/users/:id',(req,res)=>{
    User.findById(req.params.id)
        .then(user=>{
            if(user){
                delete user.password;
                res.json(user); 
            }
            else res.status(404).end();
        })
        .catch(err=>{
            res.status(500).json({
                message:err.message
            })
        })
});

router.use('/users/tokens',require('./tokens'));
module.exports=router;