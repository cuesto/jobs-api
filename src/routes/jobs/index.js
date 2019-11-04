const express = require('express');
const router = express.Router();
const User = require('../../database/models/User');
const Category = require('../../database/models/Category');
const AcademycLevel = require('../../database/models/AcademycLevel');
const WorkingDay = require('../../database/models/WorkingDay');
const ValidateField = require('../../utils/ValidateField');
const verifyToken = require('../../middlewares/verifyToken');
const Job = require('../../database/models/Job');

router.post('/jobs',
    [
        verifyToken,
        (req, res, next) => {
            const { id_user, id_category, id_working_day, id_academyc_level, title, description, salary, job_detail } = req.body;
            ValidateField.validateJson({
                id_user: new ValidateField(id_user).required().number({ maxDecimal: 0 }, 'id invalido').custom(async () => {
                    let user = await User.findById(id_user)
                        .catch(err => Promise.reject(err.message));
                    if (user === undefined) return Promise.reject('Usuario no existe');
                    else return Promise.resolve();
                }),
                id_category: new ValidateField(id_category).required().number({ maxDecimal: 0 }, 'id invalido').custom(async () => {
                    let category = await Category.findById(id_category)
                        .catch(err => Promise.reject(err.message));
                    if (category === undefined) return Promise.reject('Esta categoria no existe');
                    else return Promise.resolve();
                }),
                id_working_day: new ValidateField(id_working_day).required().number({ maxDecimal: 0 }, 'id invalido').custom(async () => {
                    let workingDay = await WorkingDay.findById(id_working_day)
                        .catch(err => Promise.reject(err.message));
                    if (workingDay === undefined) return Promise.reject('Jornada invalida');
                    else return Promise.resolve();
                }),
                id_academyc_level: new ValidateField(id_academyc_level).required().number({ maxDecimal: 0 }, 'id invalido').custom(async () => {
                    let academycLevel = await AcademycLevel.findById(id_academyc_level)
                        .catch(err => Promise.reject(err.message));
                    if (academycLevel === undefined) return Promise.reject('Nivel academico invalido');
                    else return Promise.resolve();
                }),
                title: new ValidateField(title).required().empty().string().maxLenght(40),
                description: new ValidateField(description).required().empty().string().maxLenght(1000),
                salary: new ValidateField(salary).number()
                    .number({ maxDecimal: 2, level: 2 }, "El valor no puede tener mas de 2 numeros decimales")
                    .number({ minValue: 0, level: 2 }, 'El valor no puede ser negativo'),
                job_detail: new ValidateField(job_detail).custom(async () => {
                    let reject = 'Valor invalido';
                    if (!Array.isArray(job_detail)) return Promise.reject(reject);
                    for (const item of job_detail) {
                        if (typeof item !== 'object') return Promise.reject(reject);
                        if (!item.title || !item.description) return Promise.reject(reject);
                        if (await new ValidateField(item.title).required().string().empty().maxLenght(25)
                            .validate().catch(err => false) === false) return Promise.reject(reject);
                        if (await new ValidateField(item.description).required().string().empty().maxLenght(255)
                            .validate().catch(err => false) === false) return Promise.reject(reject);
                    }
                    return Promise.resolve();
                }, 1)
            })
                .then(() => {
                    let job = new Job();
                    Object.assign(job, { id_user, id_category, id_working_day, id_academyc_level, title, description, salary, job_detail });
                    req.job = job;
                    next();
                })
                .catch(err => {
                    res.status(400).json(err)
                });
        }
    ],
    (req, res) => {
        const job = req.job;
        Job.create(job)
            .then(() => res.status(201).end())
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    message: 'error tratando de crear el empleo',
                    internal_message: err.message
                });
            })
    });

router.get('/jobs/:id', (req, res) => {
    const {id}=req.params;
    Job.findById(id)
        .then(data=>{
            if(data){
                if(data.id_user)data.user='/users/'+data.id_user;
                if(data.id_category)data.category='/categories/'+data.id_category;
                res.json(data);
            }
            else res.status(404).end();
        })
        .catch(err=>res.status(500).json({message:err.message}));
});

router.get('/jobs', [
    (req, res, next) => {
        const { text_search, offset = 0, limit = 30, status = 'S' } = req.query;
        ValidateField.validateJson({
            text_search: new ValidateField(text_search, false).string().maxLenght(30),
            offset: new ValidateField(offset, false).number({ maxDecimal: 0 }, 'Debe ser un numero entero')
                .number({ minValue: 0 }, 'Debe ser mayor que 0'),
            limit: new ValidateField(limit, false).number({ maxDecimal: 0 }, 'Debe ser un numero entero').number({ minValue: 1 }, 'Debe ser mayor que 0'),
            status: new ValidateField(status).string().empty().maxLenght(1).accept(['S', 'P'])
        })
            .then(() => next())
            .catch(err => res.status(400).json(err));
    }
], (req, res) => {
    const { text_search, offset, limit } = req.query;

    Job.search({
        textSearch: text_search,
        offset,
        limit
    })
        .then(({ data, pagination }) => {
            if (data.length > 0) {
                // Url inner
                for (const item of data) {
                    if(item.id_user)item.user='/users/'+item.id_user;
                    if(item.id_category)item.category='/categories/'+item.id_category;
                }
                res.json({
                    data,
                    items: pagination.items,
                    pages: pagination.pages,
                    total_items: pagination.totalItems
                });
            }
            else res.status(404).end();
        })
        .catch(err => {
            //console.log(err);
            res.status(500).json({ internal_message: err.message });
        });
});

module.exports = router;