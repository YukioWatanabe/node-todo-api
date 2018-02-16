const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

// var id = '5a86d3ca33f8ba3313aee823';
var id = '5a833f2bf30feba22d1fa5b5';

// if( !ObjectID.isValid(id) ){
//     console.log('ID not valid');
// }

// Todo.find({
//     _id: id
// }).then(todos => console.log('Todos',todos));

// Todo.findOne({
//     _id: id
// }).then(todo => console.log('Todo',todo));

// Todo.findById(id).then(todo => { 
//     if (!todo) {
//         return console.log('Id not found');
//     }

//     console.log('Todo by Id',todo)
// }).catch(console.log);

User.findById(id).then(user => {
    if (!user) {
        return console.log('User not found');
    }

    console.log('User by Id:', user);
});