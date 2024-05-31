// Create web server
// npm install express
// npm install body-parser
// npm install mysql
// npm install express-session
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var dbconfig = require('./config/database.js');
var conn = mysql.createConnection(dbconfig);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore(dbconfig)
}));

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index', {
    user: req.session.user
  });
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  var id = req.body.id;
  var password = req.body.password;
  var sql = 'SELECT * FROM user WHERE id=? AND password=?';
  conn.query(sql, [id, password], function(err, result) {
    if (result.length === 0) {
      res.send('<script>alert("Login failed");\
        location.href="/login";</script>');
    } else {
      req.session.user = {
        id: result[0].id,
        name: result[0].name
      };
      res.redirect('/');
    }
  });
});

app.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
  var id = req.body.id;
  var name = req.body.name;
  var password = req.body.password;
  var sql = 'INSERT INTO user (id, name, password) VALUES(?, ?, ?)';
  conn.query(sql, [id, name, password], function(err, result) {
    res.redirect('/');
  });
});

app.listen(3000, function() {
  console.log('Server is running on port 3000!');
});