module.exports= (req,res,next)=>{
    const {fields,page,limit,sort,group_by}=req.query;
    
    let options={fields:[],count:[],sum:[],equals:{},sort:[],groupBy:[]};
    // fields
    if(fields){
        let fieldList=fields.split(',');
        for (const item of fieldList) {
            let fieldsSplit=item.split(':');
            if(fieldsSplit.length===1)options.fields.push(item);
            if(fieldsSplit.length===2){
                switch(fieldsSplit[1]){
                    case 'sum':options.sum.push(fieldsSplit[0]);break;
                    case 'count':options.count.push(fieldsSplit[0]);break;
                }
                //options.sort.push(`${sortField[0]}${sortChar}`);
            }
        }

        //options.fields=fields.split(',');
    }

    // Pagination
    if(limit)options.limit=limit;
    if(!page || page===-1) options.offset=0;
    else options.offset=(page-1)*limit;

    console.log(options);

    // Sort
    if(sort){
        let sortList= sort.split(',');
        for (const item of sortList) {
            let sortField=item.split(':');
            if(sortField.length===1)options.sort.push(sortField[0]);
            if(sortField.length===2){
                let sortChar='';
                switch(sortField[1]){
                    case 'asc':sortChar='+';break;
                    case 'desc':sortChar='-';break;
                }
                options.sort.push(`${sortField[0]}${sortChar}`);
            }
        }
    }

    // Group by
    if(group_by){
        options.groupBy=group_by.split(',');
    }

    req.queryOptions=options;

    next();

};