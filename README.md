FarcekDB
====================
Database orm

supported databases

- MySql
- PosterSql
- MSSQL

Index

- [Model define](#model-define)
- [Model define](#model-define1)
- [Model define](#model-define)
- [Model define](#model-define)
- [Model define](#model-define)

fields

- [boolean](#field-boolean)
- [date](#field-date)
- [datetime](#field-datetime)
- [enum](#field-enum)
- [float](#field-float)
- [integer](#field-integer)
- [json](#field-json)
- [string](#field-string)
- [text](#field-text)

validations

- [alpha](#validation-alpha)
- [date](#validation-date)
- [email](#validation-email)
- [min](#validation-min)
- [max](#validation-max)
- [range](#validation-range)
- [length](#validation-length)
- [unique](#validation-unique)

    {
        type: Number,
        validation:['min:15','max:50']
    },
    {
        type: Number,
        validation:['min:15','max:50']
    }


### <a name="model-define"><a> Define Module

    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: {
            type: String, dbName: 'un1', notNull: 1
        },
        age: {
            type: 'integer', default: 21
        },
        active: {
            type: Boolean, dbName: 'is_active'
        },
        isAdmin: {
            type: Boolean
        },
        note: {
            type: 'text', lazy: 1, dbName: 'note_note'
        }

    }, {
        dbName: 'user_'
    })

    User.static({
        getAdminUsers : function(){
          return this.where({isAdmin:true}).result()
        }
    })


### <a name="model-define1"><a> Define Module

    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: {
            type: String, dbName: 'un1', notNull: 1
        },
        age: {
            type: 'integer', default: 21
        },
        active: {
            type: Boolean, dbName: 'is_active'
        },
        active1: {
            type: Boolean
        },
        note: {
            type: 'text', lazy: 1, dbName: 'note_note'
        }

    }, {
        dbName: 'user_'
    })


Fields
======

### <a name="field-boolean"><a> Field boolean

- define : `Boolean` | 'boolean'
- options : `none`

### <a name="field-date"><a> Field Date

- define : 'date'
- options : `none`

### <a name="field-datetime"><a> Field Datetime

- define : `Date` | 'datetime'
- options : `none`

### <a name="field-enum"><a> Field Enum

- define : 'enum'
- options : `value`
    1. Object
    2. []

sample :

    {
        type : 'enum',
        value : ['Mr','Mss']
    }

or

    {
        type : 'enum',
        value : {
            mr: 'Men'
            mss: 'Women'
        }
    }

### <a name="field-float"><a> Field Float

- define : `Number`|'float'
- options : `none`


### <a name="field-integer"><a> Field Integer

- define : 'integer'
- options : `none`

### <a name="field-json"><a> Field Json

- define : `Object` | 'json'
- options : `none`

### <a name="field-string"><a> Field String

- define : `String` | 'string'
- options : `len` - varchar length

### <a name="field-text"><a> Field Text

- define : 'text'
- options : `textType` available values `mediumtext`,`longtext`