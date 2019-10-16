class ValidateField{
    constructor(value=null,multipleError=true){
        this.value=value;
        this._validateList=[];
        this.multipleError=multipleError;
    }

    // espacial
    custom(promise,level=2){
        this._validateList.push({promise,level});
        return this;
    }

    required(reject='Este campo es requerido'){
        return this.custom(async()=>{
            if(this.value ===null || this.value===undefined)return Promise.reject(reject);
            else return Promise.resolve();
        },0);
    }

    // String
    string(reject='Debe ser una cadena de texto'){
        return this.custom(async()=>{
            if(typeof(this.value)==='string')return Promise.resolve();
            else Promise.reject(reject);
        },1);
    }

    regEx(regEx,reject='Valor invalido'){
        return this.custom(async()=>{
            if(!regEx.test(this.value))return Promise.reject(reject);
            else return Promise.resolve();
        },1);
    }

    email(reject='email invalido'){
        return this.regEx(/^[A-Za-z]+[A-Za-z0-9_]+@+[A-Za-z]+\.+[A-Za-z]/,reject);
    }

    alphanum(reject='Debe ser un valor alfa numerico'){
        return this.regEx(/^[a-zA-Z]+[0-9]*$/,reject);
    }

    maxLenght(max,reject=`No puede tener mas de ${max} caracteres`){
        return this.custom(async()=>{
            if(this.value.length>max)return Promise.reject(reject);
            else return Promise.resolve();
        },1); 
    }

    minLength(min,reject=`El valor debe tener minimo ${min} caracteres`){
        return this.custom(async()=>{
            if(this.value.length<min)return Promise.reject(reject);
            else return Promise.resolve();
        },1); 
    }

    empty(reject='El valor no puede estar vacio'){
        return this.custom(async()=>{
            if(this.value===''||this.value.match(/^ *$/)!==null)return Promise.reject(reject);
            else return Promise.resolve();
        },1); 
    }

    // Number
    number(options={minDecimal:0,maxDecimal:0,minValue:null,maxValue:null},reject='Debe ser un valor numerico'){
        const {minDecimal=0,maxDecimal=0,minValue=null,maxValue=null}=options;
        return this.custom(()=>{
            if(this.value.length===0)return Promise.reject(reject);
            if(/^-?\d*\.?\d*$/.test(this.value)){
                const valueSplit=this.value.split('.');
                let decimalCount=valueSplit.length>1?valueSplit[1].length:0;
                if(decimalCount<minDecimal || decimalCount>maxDecimal)return Promise.reject(reject);

                if(minValue!==null){
                    if(this.value<minValue)return Promise.reject(reject);
                }
                if(maxValue!==null){
                    if(this.value>maxValue)return Promise.reject(reject);
                }
                
                return Promise.resolve();
            }
            else return Promise.reject(reject);
        },1);
    }

    async validate(){
        let validateSort=this._validateList.sort((a,b)=>a.level-b.level);

        // level 0
        let errors=[];
        for (let i = 0; i < 3; i++) {
            if(errors.length>0)break;
            let validsLevel=this._validateList.filter((o)=>o.level===i);
            for (const item of validsLevel) {
                if((this.value===undefined || this.value===null) && i>0)break;
                let err=await item.promise().catch((err)=>err);
                if(err!==undefined){
                    errors.push(err);
                    if(!this.multipleError)break;
                }
            }
            if(errors.length>0)break;
        }

        if(this.multipleError){
            if(errors.length>0) return await Promise.reject(errors);
            else return await Promise.resolve();
        }
        else{
            if(errors.length>0) return await Promise.reject(errors[0]);
            else return await Promise.resolve();
        }
    }

    static async validateArray(validArray){
        let errors=[];
        for (const item of validArray) {
            let err=await item.validate().catch((err)=>err);
            if((err||[]).length>0)errors.push(...err);
        }

        if(errors.length>0)return Promise.reject(errors);
        else return Promise.resolve();
    }

    static async validateJson(json){
        let errors={};
        for (const key in json) {
            let err=await json[key].validate().catch((err)=>err);
            if((err||[]).length>0)errors[key]=err;
        }

        if(Object.keys(errors).length>0)return Promise.reject(errors);
        else return Promise.resolve();
    }
}

module.exports=ValidateField;