const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').deleteMany({text : "Eat lunch"})
    //     .then(console.log)
    //     .catch(console.log);

    // db.collection('Todos').deleteMany()
    //     .then(console.log)
    //     .catch(console.log);

    // db.collection('Todos').deleteOne({text : "Eat lunch"})
    //     .then(console.log)
    //     .catch(console.log);

    // db.collection('Todos').findOneAndDelete({completed : false})
    //     .then(console.log)
    //     .catch(console.log);

    // db.close();
});