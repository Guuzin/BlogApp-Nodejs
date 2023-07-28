const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/usuario')
const usuarios = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
  res.render('usuarios/registro.handlebars')
})

router.post('/registro', (req, res) => {
  let erros = []
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: 'Nome inválido!' })
  }
  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    erros.push({ texto: 'Email inválido!' })
  }
  if (
    !req.body.senha ||
    typeof req.body.senha == undefined ||
    req.body.senha == null
  ) {
    erros.push({ texto: 'Senha inválida!' })
  }
  if (
    !req.body.senha2 ||
    typeof req.body.senha2 == undefined ||
    req.body.senha2 == null
  ) {
    erros.push({ texto: 'Confirme sua senha!' })
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: 'Nome muito pequeno' })
  }
  if (req.body.senha.length < 4) {
    erros.push({ texto: 'Senha muito pequena' })
  }
  if (req.body.senha != req.body.senha2) {
    erros.push({ texto: 'As senha não são iguais, tente novamente!' })
  }
  if (erros.length > 0) {
    res.render('usuarios/registro.handlebars', { erros: erros })
  } else {
    usuarios
      .findOne({ email: req.body.email })
      .then((usuario) => {
        if (usuario) {
          req.flash('error_msg', 'Ja exite uma conta nesse e-mail')
          res.redirect('/usuarios/registro')
        } else {
          const novoUsuario = new usuarios({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
          })
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash(
                  'error_msg',
                  'Houve um erro durante o salvamento do usuário'
                )
                res.redirect('/')
              }
              novoUsuario.senha = hash

              novoUsuario
                .save()
                .then(() => {
                  req.flash('success_msg', 'Usuário criado com sucesso!')
                  res.redirect('/')
                })
                .catch((erro) => {
                  req.flash(
                    'error_msg',
                    'Houve um erro ao criar o usuário, tente novamente!'
                  )
                  res.redirect('/usuarios/registro')
                })
            })
          })
          // let salt = bcrypt.genSaltSync(10)
          // let hash = bcrypt.hashSync(req.body.senha, salt)

          // const novoUsuario = {
          //   nome: req.body.nome,
          //   email: req.body.email,
          //   senha: hash,
          // }

          // new usuarios(novoUsuario)
          //   .save()
          //   .then(() => {
          //     req.flash('success_msg', 'Usuario cadastrado com sucesso!')
          //     res.redirect('/')
          //   })
          //   .catch((err) => {
          //     req.flash('error_msg', 'Erro ao cadastrar o usuario')
          //     res.redirect('/usuarios/registro')
          //   })
        }
      })
      .catch((erro) => {
        console.log(erro)
        req.flash('error_msg', 'Erro interno')
        res.redirect('/')
      })
  }
})

router.get('/login', (req, res) => {
  res.render('usuarios/login.handlebars')
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/usuarios/login/success',
    failureRedirect: '/usuarios/login/error',
    failureFlash: true,
  })(req, res, next)
})

router.get('/login/success', (req, res) => {
  req.flash('success_msg', 'Login efetuado com sucesso!')
  res.redirect('/')
})

router.get('/login/error', (req, res) => {
  req.flash('error_msg', 'Erro ao logar na conta!')
  res.redirect('/usuarios/login')
})

router.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err)
    }
    req.flash('success_msg', 'Deslogado com sucesso!')
    res.redirect('/')
  })
})

module.exports = router
