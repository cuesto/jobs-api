const express = require('express');
const router = express.Router();
const ValidateField = require('../../utils/ValidateField');
const verifyToken = require('../../middlewares/verifyToken');
const Article = require('../../database/models/Article');

// Get
router.get('/articles/:id',(req,res)=>{
    Article.findById(req.params.id)
        .then((result)=>{
            if(result) res.json(result);
            else res.status(404).end();
        })
        .catch(err=>{
            res.status(500).json({internal_message:err.message});
        });
});

router.get('/articles', [
    (req, res, next) => {
        const {text_search,page,limit}=req.query;
        ValidateField.validateJson({
            text_search:new ValidateField(text_search,false).string().empty().maxLenght(30),
            page:new ValidateField(page,false).number({maxDecimal:0},'Debe ser un numero entero')
                .number({minValue:1},'Debe ser mayor que 0'),
            limit:new ValidateField(limit,false).number({maxDecimal:0},'Debe ser un numero entero')
                .number({minValue:1},'Debe ser mayor que 0'),
        })
        .then(()=>{
            req.offset=(page-1)*limit;
            next();
        })
        .catch(err=>res.status(400).json(err));
    }
], (req, res) => {
    const {text_search,limit}=req.query;
    Article.search({textSearch:text_search,offset:req.offset,limit})
        .then(({result,pagination})=>{
            if(result.length>0){
                // Url inner
                // for (const item of result) {
                //     item.url={};
                //     if(item.id_seller)item.url.seller=`/sellers/${item.id_seller.toString().trim()}`;
                //     if(item.id_cash_registrer)item.url.cash_registrer=`/cash_registrers/${item.id_cash_registrer.toString().trim()}`;
                // }
                res.json({
                    result,
                    items:pagination.items,
                    pages:pagination.pages,
                    total_items:pagination.totalItems
                });
            }
            else res.status(404).end();
        })
        .catch(err=>{
            res.status(500).json({internal_message:err.message});
        });
});

// Post
router.post('/articles', [
    verifyToken,
    (req, res, next) => {
        const { id_customizable, name, description, tax } = req.body;

        ValidateField.validateJson({
            id_customizable: new ValidateField(id_customizable).minLength(2).maxLenght(15).custom(async () => {
                let article = await Article.findByFields({ id_customizable })
                    .then(res => Promise.resolve(res)).catch((err) => Promise.reject(undefined));
                if (article) return Promise.reject('Ya existe un artiuclo con este codigo');
                else return Promise.resolve();
            }),
            name: new ValidateField(name).string().maxLenght(31).required(),
            description: new ValidateField(description).string().maxLenght(50),
            tax: new ValidateField(tax).number(),
        })
            .then(() => {
                req.article = Article.fromJson({
                    id_customizable,
                    name,
                    description,
                    tax: tax || 0
                });
                next();
            })
            .catch(err => res.status(400).json(err));
    }
],
    (req, res) => {
        let article = req.article;

        Article.create(article)
            .then(() => res.status(201).end())
            .catch((err) => {
                res.status(500).json({
                    message: 'error tratando de crear el articulo',
                    internal_message: err.message
                });
            })
    });

// Put

module.exports = router;