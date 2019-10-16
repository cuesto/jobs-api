var pool=require('../dbPool.js');

class Article{
    constructor(){
        this.id;
        this.id_custom;
        this.name;
        this.description;
        this.tax;
    }

    static fromJson(json){
        let article=new Article();
        Object.assign(article,json);
        return article;
    }

    static findByFields(fields,operator='AND'){
        let query=`SELECT * FROM ARTICLE WHERE `;
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
            textSearch,
            offset,
            limit,
            resultModels,
            countPagination,
        }){
        const {textSearch='',offset=0,limit=10,resultModels=true,countPagination=true} =options;

        let query='SELECT * FROM ARTICLE',queryWhere=[];
        if (countPagination) query = `SELECT *,COUNT(*) OVER() AS total_rows FROM ARTICLE`;
        else query = `SELECT * FROM ARTICLE`;

        // Text search
        if(textSearch.length>0){
            let textSearchSplit=textSearch.trim().replace(/\s\s+/g,' ').split(' ');

            queryWhere.push('MATCH(id_custom,name,description) '+
            `AGAINST('${textSearchSplit.map(v=>{
                return '+'+v+'*';
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

        // Where
        query+=queryWhere.length>0 ? ' WHERE '+queryWhere.join(' OR '):'';

        // Sort

        // Pagination
        if (offset >= 0 && limit > 0) query += ` LIMIT ${offset},${limit}`;
        else if (options.limit > 0) query += ` LIMIT ${limit}`;

        console.log(query);

        return pool.query(query)
            .then((res)=>{
                let result = {};

                if (resultModels === true) {
                    let models = [];
                    for (const item of res) {
                        let article = new Article();
                        article=Article.fromJson(item);
                        if (article.hasOwnProperty('total_rows')) delete article.total_rows;
                        models.push(article);
                    }
                    result.result = models;
                }
                else result.result = res;

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

    static create(article){
        return pool.query(`INSERT INTO ARTICLE SET ?`,article);
    }
}

module.exports=Article;