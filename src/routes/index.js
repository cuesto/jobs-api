const express = require('express');
let router = express.Router();

router.get('/',(req,res)=>{
    res.status(200).json({
        mensaje:'Hola mundo'
    });
});

router.use(require('./users/index'));
router.use(require('./articles/index'));
//router.use(require('./sellers/index'));

module.exports=router;