const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const checkUser = users.find(user => user.username == username);
  if (!checkUser) {
    return response.status(404).json({error: "Mensagem de erro"});
  }
  request.user = checkUser;
  return next();
}

function checkExistsTodo(request, response, next) {
  const {id} = request.params;
  const {user} = request;

  const checkTodo = user.todos.find(todo => todo.id == id);

  if (!checkTodo) {
    return response.status(404).json({error: "Mensagem de erro"});
  }

  request.todo = checkTodo;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const checkUser = users.find(user => user.username == username);

  if (!!checkUser) {
    return response.status(400).json({error: 'Mensgem de erro'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);
  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  // const {id} = request.params;
  const {todo} = request;
  const {title, deadline} = request.body;
  // const {user} = request;

  // const todo = user.todos.find(item => item.id == id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  // const {id} = request.params;
  // const {user} = request;
  const {todo} = request;

  // const todo = user.todos.find(item => item.id == id);

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  // const {id} = request.params;
  const {user} = request;
  const {todo} = request;

  // const todo = user.todos.find(item => item.id == id);
  user.todos.splice(todo, 1);

  return response.status(204).json(todo);
});

module.exports = app;