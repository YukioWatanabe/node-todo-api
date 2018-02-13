const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').find({ _id : new ObjectID('5a831514defc53797a00b9e9') }).toArray()
    //     .then( console.log )
    //     .catch( console.log );

    db.collection('Todos').find().count()
        .then( console.log )
        .catch( console.log );

    db.close();
});