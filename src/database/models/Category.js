var pool=require('../dbPool.js');

class Category{
    constructor(){
        this.id;
        this.code;
        this.name;
    }

    static fromObject(obj){
        let category=new Category();
        // user.id=obj.id;
        // user.user_name=obj.user_name;
        // user.email=obj.email;
        // user.password=obj.password;
        // user.name=obj.name;
        Object.assign(category,obj);
        return category;
    }

    static findByFields(fields,operator='AND'){
        let query=`SELECT * FROM CATEGORY WHERE `;
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
        return this.findByFields({id});
    }
}

module.exports=Category;