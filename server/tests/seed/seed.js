const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const todosMock = [
    { 
        _id : new ObjectID(), 
        text: "Do the dishes" 
    },
    { 
        _id : new ObjectID(), 
        text: "Wash clothes", 
        completed : true, 
        completedAt : 333 
    }
];

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const usersMock = [
    {
        _id: userOneId,
        email: 'yukio@example.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'yukiko@example.com',
        password: 'userTwoPass'
    }
];

const populateTodos = (done) => {
    Todo.remove({}).then( () => { 
        return Todo.insertMany(todosMock);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(usersMock[0]).save();
        var userTwo = new User(usersMock[1]).save();

        return Promise.all([userOne,userTwo]);
    }).then(() => done());
};

module.exports = { todosMock, populateTodos, usersMock, populateUsers };