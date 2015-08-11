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

Now is the time for all good men to come to
the aid of their country. This is just a
regular paragraph.

The quick brown fox jumped over the lazy
dog's back.

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
        active1: {
            type: Boolean
        },
        note: {
            type: 'text', lazy: 1, dbName: 'note_note'
        }

    }, {
        dbName: 'user_'
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