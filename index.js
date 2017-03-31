require('dotenv').config()

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const express = require('express')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const twilio = require('twilio')
const jwt = require('jsonwebtoken')

const User = require('./models/player')
const helpers = require('./helpers')
const required = helpers.required

const app = express()

const jwtOpts = {
  secretOrKey: process.env.JWT_SECRET || 'Secret',
  issuer: 'feudal',
  audience: 'mobile',
  jwtFromRequest: ExtractJwt.fromAuthHeader()
}

const twilioClient = new twilio.RestClient(process.env.TWILIO_SID, process.env.TWILIO_AUTHTOKEN)

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(session({secret: process.env.SESSIONS_SECRET || 'keyboards', resave: true, saveUninitialized: false}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new JwtStrategy(jwtOpts, (payload, done) => {
  User.findOrCreate({
    where: {
      id: payload.sub
    }
  }).then((user) => {
    done(null, user)
  }).catch((err) => {
    done(err, false)
  })
}))

app.get('/api/', (req, res) => {
  res.json({
    version: '1.0.0',
    status: 'OK'
  })
})

app.post('/api/create_account', required('phone_number', 'name'), (req, res) => {
  let token = Math.floor(Math.random() * 100000)
  User.create({
    name: req.body.name,
    token: token
  }).then((user) => {
    return new Promise((resolve, reject) => {
      twilioClient.messages.create({
        to: req.body.phone_number,
        from: '+19255267120',
        body: 'Your Feudal token is ' + token
      }, (err, response) => {
        if (err) {
          return reject(err)
        }
        resolve(user)
      })
    })
  })
  .then((user) => {
    user.token = undefined
    return user
  })
  .then(helpers.respondWithResult(res))
  .catch(helpers.respondWithError(res, 'error'))
})

app.post('/api/verify', required('uuid', 'token'), (req, res) => {
  User.findOne({
    where: {
      id: req.body.uuid
    }
  }).then((user) => {
    if (user.token === req.body.token) {
      user.verified = true
      user.save()
      return jwt.sign({sub: user.id}, process.env.JWT_SECRET, {}, (err, token) => {
        if (err) return res.send(500, err)
        return res.send(200, token)
      })
    } else {
      return res.send(500, 'incorrect token')
    }
  })
})

app.listen(3000 || process.env.PORT)
