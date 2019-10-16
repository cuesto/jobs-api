var pool=require('../dbPool.js');
const {find: findModel}=require('../../utils/SqlBuilder');

class User{
    constructor(){
        this.id;
        this.user_name;
        this.email;
        this.password;
        this.name;
    }

    static fromObject(obj){
        let user=new User();
        // user.id=obj.id;
        // user.user_name=obj.user_name;
        // user.email=obj.email;
        // user.password=obj.password;
        // user.name=obj.name;
        Object.assign(user,obj);
        return user;
    }

    static findByFields(fields,operator='AND'){
        let query=`SELECT * FROM USER WHERE `;
        let wheres=[];
        let entries= Object.entries(fields);
        for (const item of entries) {
            wheres.push(item[0] + ' = ' + pool.escape(item[1]));
        }
        query +=wheres.join(` ${operator} `);
        
        return pool.query(query)
            .then((result)=>{
                if(result.length===0)Promise.resolve(undefined);
                else return Promise.resolve(this.fromObject(result[0]));
            });
    }

    static findById(id){
        return this.findByField({id});
    }

    static create(user){
        return pool.query(`INSERT INTO USER SET ?`,user);
    }
}

module.exports=User;