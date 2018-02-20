const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todosMock = [
    { _id : new ObjectID(), text: "Do the dishes" },
    { _id : new ObjectID(), text: "Wash clothes" }
];

beforeEach((done) => {
    Todo.remove({}).then( () => { 
        return Todo.insertMany(todosMock);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                })
                .then(done)
                .catch(done);
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                })
                .then(done)
                .catch(done);
            });
    });    
});

describe('GET /todos', () => {
    it('should return all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .end((err,res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(res.body.todos.length).toBe(todos.length);
                })
                .then(done)
                .catch(done);
            });
    });
});

describe('GET /todos/:id', () => {
    it('should return todo from id', (done) => {
        var { _id } = todosMock[0];
        request(app)
            .get(`/todos/${_id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todosMock[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if ObjectID is invalid', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});