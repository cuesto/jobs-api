var pool=require('../dbPool.js');

class Model{
    constructor(){
        for (const key of this.columns)this.key;
    }

    static get tableName(){return '';}
    static get columns(){return [];}

    static async find(options={
        fields:[],
        count:[],
        sum:[],
        equals:{},
        groupBy:[],
        offset:0,
        limit:500,
        sort:[],
        querySearch:'',
        countPagination:false,
        resultModels:true
    }){
        let query='';
        // Fields
        let fieldSql='*';
        if((options.fields||[]).length>0){
            let fieldScape=[];
            for (const item of options.fields){
                if(this.columns.includes(item)){
                    fieldScape.push(pool.escapeId(item));
                    fieldSql=fieldScape.join(',');
                }
            }
        }
        // Count
        if((options.count||[]).length>0){
            let countScape=[];
            for (const item of options.count)countScape.push(`count(${pool.escapeId(item)}) as ${item}_count`);
            fieldSql+=','+countScape.join(',');
        }

        // Sum
        if((options.sum||[]).length>0){
            let sumScape=[];
            for (const item of options.sum){
                if(this.columns.includes(item)){
                    sumScape.push(`sum(${pool.escapeId(item)}) as ${item}_sum`);
                    fieldSql+=','+sumScape.join(',');
                }
            }
        }
        fieldSql=fieldSql==''?'*':fieldSql;
        if((options.countPagination===true))query=`SELECT ${fieldSql},COUNT(*) OVER() AS total_rows FROM ${this.tableName}`
        else query=`SELECT ${fieldSql} FROM ${this.tableName}`;

        // Equals
        if(Object.keys(options.equals||{}).length>0){
            let wheres=[];
            Object.entries(options.equals).forEach((item,index)=>{
                if(this.columns.includes(item[0]))wheres.push(item[0]+' = '+pool.escape(item[1]));
            });
            query+=' WHERE '+wheres.join(' AND ');
        }

        //Group By
        const groupBy=options.groupBy;
        if((groupBy||[]).length>0){
            let groups=[];
            for (const item of groupBy){
                if(this.columns.includes(item))groups.push(pool.escapeId(item));
            }
            if(groups.length>0)query+=' GROUP BY '+groups.join(',');
        }

        // Sort
        if((options.sort||[]).length>0){
            let sortQuerys=[];
            for (const item of options.sort) {
                if(options.fields.includes(item)){
                    switch(item.slice(-1)){
                        case '+':
                            sortQuerys.push(`${item.substring(0,item.length-1)} asc`);
                            break;
                        case '-':
                            sortQuerys.push(`${item.substring(0,item.length-1)} desc`);
                            break;
                        default:
                            sortQuerys.push(`${item} asc`);
                            break;
                    }
                    query+=' ORDER BY '+sortQuerys.join(',');
                }
            }
        }

        // Pagination
        if(options.offset>=0 && options.limit>0)query+=` LIMIT ${options.offset},${options.limit}`;
        else if(options.limit>0) query+=` LIMIT ${options.limit}`;  

        console.log(query);

        return await pool.query(query)
            .then((res)=>{
                let result={};

                if(options.resultModels===true){
                    let models=[];
                    for (const item of res) {
                        let model=new this;
                        Object.assign(model,item);
                        if(model.hasOwnProperty('total_rows'))delete model.total_rows;
                        models.push(model);
                    }
                    result.result=models;
                }
                else {
                    result.result=res;
                }

                let totalItemsLimit=res.length>0?res[0].total_rows:0;
                result.pagination={
                    items:res.length,
                    pages: Math.ceil(totalItemsLimit/res.length),
                    totalItems: totalItemsLimit
                }
                if(!result.pagination.pages)delete result.pagination.pages;
                return Promise.resolve(result);
            });
    }
}

module.exports=Model;