var db=require('../../database/dbPool');

function connectionPool(req,res,next)
{
    // Verifico que la conexion sea exitosa para pasar el middleware
    db.getConnection((err,con)=>{
        if(err)console.log(err.message);
        else if(con){
            con.release();
            req.pool=db;
            next();
        }
    });
}

module.exports= connectionPool;