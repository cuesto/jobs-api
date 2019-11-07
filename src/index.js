require('dotenv').config()
const express=require('express');
const expressApp=express();
const cors = require('cors');

// Enviroment
// require('./config/env.js');

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
    host:process.env.APP_HOST,
    port:process.env.APP_PORT
},(req,res)=>{
    console.log(`Servidor corriendo en http://${process.env.APP_HOST}:${process.env.APP_PORT}`);
});