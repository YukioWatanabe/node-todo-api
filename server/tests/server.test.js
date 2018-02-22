const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todosMock, populateTodos, usersMock, populateUsers } = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

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

describe('DELETE /todos/:id', () => {
    it('should delete todo from id', (done) => {
        var id = todosMock[0]._id.toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id);
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch(done);
            });
    });

    it('should return 404 when todo not found', (done) => {
        var id = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 when ObjectID is invalid', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = todosMock[0]._id;
        var body = { "text" : "Some todo", "completed" : true };

        request(app)
            .patch(`/todos/${id}`)
            .send( body )
            .expect(200)
            .expect((res) => {
                var resTodo = res.body.todo;

                expect(resTodo.text).toBe(body.text);
                expect(resTodo.completed).toBe(body.completed);
                expect(resTodo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var id = todosMock[1]._id.toHexString();
        var body = { "completed" : false };

        request(app)
            .patch(`/todos/${id}`)
            .send(body)
            .expect(200)
            .expect(res => {
                var resTodo = res.body.todo;

                expect(resTodo.completed).toBe(body.completed);
                expect(resTodo.completedAt).toBe(null);
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(usersMock[0]._id.toHexString());
                expect(res.body.email).toBe(usersMock[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({ email, password})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end( err => {
                if (err) {
                    return done(err);
                }

                User.findOne({ email }).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch(done);
            });
    });

    it('should return validation errors if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'and',
                password: '123'
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: usersMock[0].email,
                passoword: 'Password123!'
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        var validUser = usersMock[1];

        request(app)
            .post('/users/login')
            .send(validUser)
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err,res) => {
                if (err) {
                    return done(err);
                }

                User.findById(validUser._id).then(user => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });

                    done();
                }).catch(done);
            });
    });

    it('should reject invalid login', (done) => {
        var notAuthenticatedUser = usersMock[1];

        request(app)
            .post('/users/login')
            .send({ email: notAuthenticatedUser.email, passoword: "invalidPassword" })
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err,res) => {
                if (err) {
                    return done(err);
                }

                User.findById(notAuthenticatedUser._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(done);
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        var authenticatedUser = usersMock[0];
        request(app)
            .delete('/users/me/token')
            .set('x-auth', authenticatedUser.tokens[0].token)
            .expect(200)
            .end((err,res) => {
                if (err) {
                    return done(err);
                }
                
                User.findById(authenticatedUser._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(done);
            });
    });
});