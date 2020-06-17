const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const client = redis.createClient();
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const crypto = require('crypto');

client.on("error", (error) => {
  console.log(error, "redis error");
});

const app = express();

const dbString = 'mongodb://localhost/session_db';
const connection = mongoose.createConnection(dbString);
const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: 'sessions_sso'
});

app.set('view engine', ejs);
app.set('views', './server/views');

const options = {
  credentials: true
}
app.use(cors(options));
app.use(express.urlencoded({ extended: false }))
app.use(session({
  name: 'sso_authServer',
  resave: false,
  saveUninitialized: false,
  secret: '12345',
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

const login = async (req, res, next) => {
  const { serviceURL } = req.query;
  app.locals.ssoTokenKey = `ssoToken${Math.random()}`;
  let ssoToken;
  if (!req.session.user && !serviceURL) {
    res.redirect('/')
  }
  if (req.session.user && serviceURL) {
    let ssoToken = crypto.randomBytes(25).toString('hex');
    client.set(app.locals.ssoTokenKey, ssoToken);
    return res.redirect(`${serviceURL}/ssoRedirect?ssoToken=${ssoToken}`);    
  }
  app.locals.serviceURL = serviceURL;
  next();
}

const verifySSOToken = (req, res, next) => {
  const { ssoToken } = req.query;
  client.get(app.locals.ssoTokenKey, (err, ssoKey) => {
    if (err) {
      console.log(err, "error while getting key from redis");
    }
    if (!ssoToken || ssoToken !== ssoKey || !ssoKey) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    const userClaim = req.session.user;
    const token = jwt.sign(userClaim, 'abcde@12345', { expiresIn: '1d' });
    client.del(app.locals.ssoTokenKey, (err, data) => {
      if (err) {
        console.log(err, 'error while deleting key from redis');
      }
      console.log('key deleted', data);
      res.status(200).send({ token });
    });
  });
}

app.use('/verifySSO', verifySSOToken);

app.get('/simplesso/login', login, (req, res) => {
  res.render('login.ejs')
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === 'sourabh' && password === '12345') {
    req.session.user = { username };
    let ssoToken = crypto.randomBytes(25).toString('hex');
    client.set(app.locals.ssoTokenKey, ssoToken);
    return res.redirect(`${app.locals.serviceURL}/ssoRedirect?ssoToken=${ssoToken}`);          
  } else {
    return res.status(404).send({ message: 'Invalid username or password' });
  }
});

app.listen(4000, () => console.log('server listening on port 4000'));
module.exports = app;
