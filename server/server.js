const express = require('express');
const session = require('express-session');
const redis = require('redis');
const client = redis.createClient();
const redisStore = require('connect-redis')(session);
const path = require('path');

const app = express();
app.use(session({
  secret: 'ssshhhhh',
  // create new redis store.
  store: new redisStore({ host: 'localhost', port: 6379, client: client}),
  saveUninitialized: false,
  resave: false
}));

app.use(express.json());

app.post('/', (req, res) => {
  console.log(req.body);
  req.session.userName = req.body.userName;
  console.log(req.session);
  res.status(200).send('Hello');
})

app.get('/logout', (req, res)=>{
  console.log(req.session);
  req.session.destroy((err)=>{
    if(err) {
      return console.log(err);
  }
  res.status(200).send('done');
  })
});

app.get('/reload', (req, res)=>{
  req.session.reload((err)=>{
    if(err) {
      return console.log(err);
  }
  console.log(req.session)
  res.status(200).send('done');
  })
});
app.listen(3000, ()=> console.log('server listening on port 3000'));
