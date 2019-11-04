const express=require('express');
const expressApp=express();
const cors = require('cors');

// Envarioment
require('./config/env.js');

// Middlewares
expressApp.use(express.json());
expressApp.use(express.urlencoded({extended:false}));
expressApp.use((error, req, res, next) =>{
    if (error instanceof SyntaxError)res.status(400).json({message:'Error'});
    else next();
});
expressApp.use(cors({
    origin:[process.env.CLIENT_URL,'http://localhost:3000']
}));
// Routes
expressApp.use(require('./routes/index'));

// Start server
var server  = require('http').createServer(expressApp);
server.listen({
    port:process.env.PORT,
    host:process.env.HOST
},(req,res)=>{
    console.log(`Servidor corriendo en http://${process.env.HOST}:${process.env.PORT}`);
});