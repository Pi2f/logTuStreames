const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const config = require('./config.js');


mongoose.connect(config.urlDB,{
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
}, function(err) {
    if (err) { throw err; } else {
        console.log('Mongo: Database connected');
    }
});

const type = {
    SEARCH: 'Search',
    AUTH: 'Auth',
}

const logSchema = new mongoose.Schema({
    _logID: {
        type: String,
        required: true,
        unique: true
    },   
    date: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    api: {
        type: String,
        required: false,
    },
    userID: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true,
    }
});

logSchema.pre('remove', function () {
    var log = this;
    logModel.updateOne(log,
        {
            isActive: false 
        }, function(err){

        }
    );
});

logSchema.pre('find', function (next) {
    var query = this;
    query.where({isActive: true});
    next();
});


const logModel = mongoose.model('Logs', logSchema);

module.exports = {
    addSearchLog: function(data, cb){
        const logData = new logModel({
            _logID: uuidv4(),
            type: type.SEARCH,
            userID: data.user.id,
            message: data.keyword,
            date: Date.now(),
            api: data.api,
        });
        logData.save(function(err){
            if(err){
                cb(err)
            } else {
                cb();
            }
        });
    },

    addLoginLog: function(data, cb){
        const logData = new logModel({
            _logID: uuidv4(),
            type: type.AUTH,
            userID: data._userID,
            message: "LOGIN",
            date: Date.now(),
        });
        logData.save(function(err){
            if(err){
                cb(err)
            } else {
                cb();
            }
        });
    },

    addLogoutLog: function(data, cb){
        const logData = new logModel({
            _logID: uuidv4(),
            type: type.AUTH,
            userID: data,
            message: "LOGOUT",
            date: Date.now(),
        });
        logData.save(function(err){
            if(err){
                cb(err)
            } else {
                cb();
            }
        });
    },

    getSearchLogByUserId: function(id, cb){
        logModel.find({
            userID: id,
            type: type.SEARCH,
        }, function(err, logs) {
            if(err) cb(err);
            else cb(null, logs);
        }).limit(20);
    },

    getAllLogs: function(cb){
        logModel.find({
        }, function(err, logs) {
            if(err) cb(err);
            else cb(null, logs);
        }).limit(20);
    },

    deleteAllAuthLogs: function(cb){
        logModel.find({type: type.AUTH}, 
            function(err, logs){
                logs.forEach(function(log){
                    log.remove(function(err){
                        if(err){
                            cb(err);   
                        }
                    });
                })
                if(err) cb(err);
                else cb(null, logs);
            }
        );
    },

    deleteAllSearchLogs: function(id, cb){
        logModel.find(
            { 
                userID: id,
                type: type.SEARCH 
            }, 
            function(err, logs){
                logs.forEach(function(log){
                    log.remove(function(err){
                        if(err){
                            cb(err);   
                        }
                    });
                })
                if(err) cb(err);
                else cb(null, logs);
            }
        );
    }
}