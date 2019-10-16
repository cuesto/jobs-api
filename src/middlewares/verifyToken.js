const jwt=require('jsonwebtoken');

function verifyToken(req,res,next)
{
    const authorization=req.headers.authorization;
    if(!authorization)
    {
        return res.status(403).json({ 
            internal_message:'No credentials sent',
            message:'No autorizado'
        });
    }

    let token=authorization.split(" ")[1];
    
    jwt.verify(token,process.env.TOKEN_SEED,(err,decoded)=>{
        if(err)
        {
            res.status(401).json({
                internal_message:err.message
            });
        }
        else
        {
            req.user=decoded;
            next();
        }
    });
}

module.exports=verifyToken;