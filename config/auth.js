const localstrategy = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('../models/usuario')
const usuarios = mongoose.model('usuarios')

module.exports = function (passport) {
  passport.use(
    new localstrategy(
      {
        usernameField: 'email',
        passwordField: 'senha',
      },
      (email, senha, done) => {
        usuarios.findOne({ email: email }).then((usuario) => {
          if (!usuario) {
            return done(null, false, { message: 'Esta conta não existe' })
          }

          bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if (batem) {
              return done(null, usuario)
            } else {
              return done(null, false, { message: 'Senha incorreta' })
            }
          })
        })
      }
    )
  )

  passport.serializeUser((usuario, done) => {
    done(null, usuario.id)
  })

  //   passport.deserializeUser((id, done) => {
  //     usuarios.findById(id, (erro, usuario) => {
  //       done(erro, usuario)
  //     })
  //   })

  passport.deserializeUser((id, done) => {
    usuarios
      .findById(id)
      .then((user) => {
        done(null, user)
      })
      .catch((err) => done(err))
  })
}
