const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const { response } = require('express');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'prabhsingh',
      password : '',
      database : 'face-detector'
    }
});

db.select('*').from('users').then(data => {
    console.log(data);
});

const app = express();
app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
    res.send(database.user)
})

app.post('/signin', (req,res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if(isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => {
                        res.status(400).json('Unable to get User')
                    })
            } else {
                res.status(400).json('Inavild Password/Username! Please try again with correct credentials')
            }
        })
        .catch(err => {
            res.status(400).json('Wrong Credentials')
        })
   
})

app.post('/register', (req,res) => {
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('Invaild Format');
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .then(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('Unable to Register')
    })
})

app.get('/profile/:id', (req,res) => {
        db.select('*').from('users').where({
            id: id
        })
        .then(user => {
            if(user.length) {
            res.json(user[0])
        } else {
            res.status(404).json('not found')
        }
        })
    })

app.put('/image', (req,res) => {
    db('users').where('id', '=', req.body.id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json("Unable to get entries"))
})

app.listen(3000, () => {
    console.log('app is running on port 3000')
});





