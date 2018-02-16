const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todosMock = [
    { text: "Do the dishes" },
    { text: "Wash clothes" }
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