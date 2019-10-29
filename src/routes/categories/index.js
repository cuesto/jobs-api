const express=require('express');
const router=express.Router();
const ValidateField=require('../../utils/ValidateField');
const bcrypt=require('bcrypt');
const Category=require('../../database/models/Category');
const verifyToken=require('../../middlewares/verifyToken');

router.get('/categories/:id',(req,res)=>{
    Category.findById(req.params.id)
        .then(result=>{
            if(result)res.json(result);
            else res.status(404).end();
        })
        .catch(err=>{
            res.status(500).json({
                message:err.message
            })
        })
});

module.exports=router;