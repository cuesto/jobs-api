const config =require('./env.json');
const path=require('path');

const environment = process.env.NODE_ENV || 'development';
const envConfig = config[environment];

process.env.PORT=process.env.PORT || envConfig.port;
process.env.DB_HOST=envConfig.db_host;
process.env.DB_PORT=envConfig.db_port;
process.env.DB_NAME=envConfig.db_name;
process.env.DB_USER=envConfig.db_user;
process.env.DB_PASSWORD=envConfig.db_password;
process.env.TOKEN_SEED=envConfig.TOKEN_SEED;
process.env.TOKEN_EXPIRATION=(60*1000)*60// Minutos
process.env.ENCRYPT_KEY='jkbgfhudfkjghdfukjgtertrdf89yh64g85486486577y486fg5dfuhlksdf';
//process.env.PATH_UPLOADS=path.resolve(__dirname,'../../uploads');
process.env.WEB_URL=envConfig.web_url;