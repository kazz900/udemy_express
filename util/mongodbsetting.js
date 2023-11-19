const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://root:root@cluster0.19xed2k.mongodb.net/?retryWrites=true&w=majority')
    .then(client => {
        callback(client);
    })
    .catch(err => console.log(err));
};

module.exports = mongoConnect;