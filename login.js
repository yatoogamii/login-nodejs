// const mysql = require('mysql');
const pg = require('pg');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

// connection psql
//
const client = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'nodelogin',
  password: '',
});

client.connect(function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('Connected!');
  }
})


// setup express and session
const app = express();


app.use(session({
  secret: 'test',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// setup html
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname + '/login.html'));
});

// command for login
app.post('/auth', function(request, response) {

  let username = request.body.username;
  let password = request.body.password;

  if (username && password) {
    client.query(`SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}' `, (err, res) => {
      if (err) {
        console.log(err.stack);
      } 
      else if (res.rows[0]){
        console.log(res.rows[0]);
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/home');
      } 
      else {
        response.send('Incorrect Username and/or Password!');
      }
      require
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();

  }

});


// command for sign in
app.post('/signin', function(request, response) {

  let username = request.body.username;
  let password = request.body.password;
  let email = request.body.email;

  if (username && password) {
    client.query(`SELECT * FROM accounts WHERE username = '${username}'`, (err, res) => {
      if (err) {
        console.log(err.stack);
      } else if (res.rows[0]) {
        response.redirect('/');
        // response.send('You are already sign');
      } else {
        client.query(`INSERT INTO accounts (username, password, email) VALUES ('${username}', '${password}', '${email}')`, (err, res) => {
          if (err) {
            console.log(err.stack);
          } else {
            console.log(res.rows[0]);
            response.send('Congrate, now you can login');
          }
        });
      } 
    })
  }
});

// route home
app.get('/home', function(request, response) {
  if (request.session.loggedin) {
    response.send('Welcome back, ' + request.session.username + '!');

  } else {
    response.send('Please login to view this page!');

  }
  response.end();

});

app.listen(3000);

