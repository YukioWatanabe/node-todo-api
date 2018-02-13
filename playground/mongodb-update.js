const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    db.collection('Todos').findOneAndUpdate(
        { 
            _id : new ObjectID('5a83326946666b0ea118d3ce') 
        },
        {
            $set : 
            {
                completed : true
            }
        },
        {
            returnOriginal: false
        })
        .then(console.log)
        .catch(console.log);
    
    db.collection('Users').findOneAndUpdate(
        { 
            _id : new ObjectID('5a83163e99fb8b7a6c8af6d5') 
        },
        {
            $inc : 
            {
                age : 1
            }
        },
        {
            returnOriginal: false
        })
        .then(console.log)
        .catch(console.log);

    // db.close();
});