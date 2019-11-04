var pool=require('../dbPool.js');

class Job{
    constructor(){
        this.id;
        this.id_user;
        this.id_category;
        this.id_working_day;
        this.id_academyc_level;
        this.title;
        this.description;
        this.salary;
        this.views;
        this.published;
        this.status;
        //this.job_detail=[];
    }

    static create(job){
        const {job_detail:jobDetail=[], ...rest}=job;


        let query='INSERT INTO JOB SET ?';
        return pool.query(query,[rest])
            .then(result=>{
                if(jobDetail.length===0)return Promise.resolve(result);
                query='INSERT INTO JOB_DETAIL (id_job,title,description) values ?';
                return pool.query(query,[jobDetail.map((v)=>[result.insertId,v.title,v.description])]);
            });
    }

    static fromJson(obj){
        let job=new Job();
        Object.assign(job,obj);
        return job;
    }

    static findByFields(fields,operator='AND'){
        let query=`SELECT * FROM JOB WHERE `;
        let wheres=[];
        let entries= Object.entries(fields);
        for (const item of entries) {
            wheres.push(item[0] + ' = ' + pool.escape(item[1]));
        }
        query +=wheres.join(` ${operator} `);

        return pool.query(query)
            .then((result)=>{
                if(result.length===0)Promise.resolve(undefined);
                else return Promise.resolve(this.fromJson(result[0]));
            });
    }

    static findById(id){
        return this.findByFields({id});
    }

    static search(options={
            textSearch:'',
            equalsAnd:[{}],
            offset:0,
            limit:30,
            resultModels:true,
            countPagination:true,   
        }){
        const {textSearch='',offset=0,limit=10,resultModels=true,countPagination=true,equalsAnd={}} =options;

        let query='SELECT JOB.* FROM JOB',whereOr=[],whereAnd=[];
        if (countPagination) query = 'SELECT JOB.*,COUNT(JOB.id) OVER() AS total_rows FROM JOB '+
            'INNER JOIN USER ON USER.id=JOB.id_user';
        else query = 'SELECT * FROM JOB';

        // Where
        if(textSearch.length>0){
            let textSearchSplit=textSearch.trim().replace(/\s\s+/g,' ').split(' ');

            whereOr.push('MATCH(JOB.title) '+
            `AGAINST('${textSearchSplit.map(v=>{
                return '+'+v+'*';
            }).join(' ')}' IN BOOLEAN MODE)`);
            whereOr.push('MATCH(USER.name) '+
            `AGAINST('${textSearchSplit.map(v=>{
                return '' +v+ '';
            }).join(' ')}' IN BOOLEAN MODE)`);
            // queryWhere.push(`id_custom LIKE '%${textSearch}%'`);
            // queryWhere.push(`name LIKE '%${textSearch}%'`);
            // queryWhere.push(`description LIKE '%${textSearch}%'`);
            // queryWhere.push(textSearchSplit.map(v=>{
            //     return(
            //         `id_custom LIKE '%${v}%' OR `+
            //         `name LIKE '%${v}%' OR `+
            //         `description LIKE '%${v}%'`);

            // }).join(' AND '));
        }

        if(Object.keys(equalsAnd).length>0){
            for (const key in equalsAnd)whereAnd.push(`${key}=${pool.escape(equalsAnd[key])}`);
        }
        let where=[];
        if(whereAnd.length>0)where.push(whereAnd.join(' AND '));
        if(whereOr.length>0)where.push(whereOr.join(' OR '));
        if(where.length>0)query+=' WHERE '+where.join(' AND ');
        // if(whereAnd.length>0||whereOr.length>0)query+=' WHERE ';
        // query+=whereOr.length>0 ?whereOr.join(' OR '):'';
        // query+=whereAnd.length>0 ?whereAnd.join(' AND '):'';


        // Sort

        // Pagination
        if (offset >= 0 && limit > 0) query += ` LIMIT ${offset},${limit}`;
        else if (options.limit > 0) query += ` LIMIT ${limit}`;

        //console.log(query);

        return pool.query(query)
            .then((res)=>{
                let result = {};

                if (resultModels === true) {
                    let models = [];
                    for (const item of res) {
                        let job = new Job();
                        job=Job.fromJson(item);
                        if (job.hasOwnProperty('total_rows')) delete job.total_rows;
                        models.push(job);
                    }
                    result.data = models;
                }
                else result.data = res;

                let totalItemsLimit = res.length > 0 ? res[0].total_rows : 0;
                result.pagination = {
                    items: res.length,
                    pages: res.length>0?Math.ceil(totalItemsLimit / res.length):0,
                    totalItems: totalItemsLimit
                }
                if (result.pagination.pages===NaN) delete res.pagination.pages;
                return Promise.resolve(result);
            });
    }
}

module.exports=Job;