const express = require('express');
let router = express.Router();

router.get('/',(req,res)=>{
    res.status(200).json({
        mensaje:'Hola mundo'
    });
});

router.use(require('./users/index'));
router.use(require('./jobs/index'));
router.use(require('./categories'));

module.exports=router;