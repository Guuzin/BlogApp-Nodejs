const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/categoria')
const categorias = mongoose.model('categorias')
require('../models/postagem')
const postagens = mongoose.model('postagens')
const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
  res.render('admin/index.handlebars')
})

router.get('/categorias', eAdmin, (req, res) => {
  categorias
    .find()
    .sort({ date: 'desc' })
    .then((categorias) => {
      res.render('admin/categorias.handlebars', { categorias: categorias })
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao listar as categorias')
      res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
  res.render('admin/addcategorias.handlebars')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
  let erros = []

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: 'Nome inválido!' })
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: 'Slug inválido!' })
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: 'Nome muito pequeno' })
  }
  //   if (req.body.slug.trim) {
  //     erros.push({ texto: 'Slug não pode conter espaços!' })
  //   }
  //   if (req.body.slug.toUpperCase) {
  //     erros.push({ texto: 'Slug não pode conter letras maiusculas!' })
  //   }
  if (erros.length > 0) {
    res.render('admin/addcategorias.handlebars', { erros: erros })
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    }

    new categorias(novaCategoria)
      .save()
      .then(() => {
        req.flash('success_msg', 'Categoria criada com sucesso!')
        res.redirect('/admin/categorias')
      })
      .catch((erro) => {
        req.flash(
          'error_msg',
          'Houve um erro ao salvar a categoria, tente novamente!'
        )
        res.redirect('/admin/categorias')
      })
  }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
  categorias
    .findOne({ _id: req.params.id })
    .then((categorias) => {
      res.render('admin/editcategorias.handlebars', { categorias: categorias })
    })
    .catch((erro) => {
      req.flash('error_msg', 'Essa categoria não exite')
      res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
  let erros = []

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: 'Nome inválido!' })
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: 'Slug inválido!' })
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: 'Nome muito pequeno' })
  }
  if (erros.length > 0) {
    res.render('admin/editcategorias.handlebars', { erros: erros })
  } else {
    categorias
      .findOne({ _id: req.body.id })
      .then((categorias) => {
        categorias.nome = req.body.nome
        categorias.slug = req.body.slug

        categorias
          .save()
          .then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!')
            res.redirect('/admin/categorias')
          })
          .catch((erro) => {
            req.flash(
              'error_msg',
              'Houve um erro interno ao salvar a edição da categoria'
            )
            res.redirect('/admin/categorias')
          })
      })
      .catch((erro) => {
        req.flash(
          'error_msg',
          'Houve um erro ao editar a categoria, tente novamente!'
        )
        res.redirect('/admin/categorias')
      })
  }
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
  categorias
    .deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash('success_msg', 'Categoria deletada com sucesso!')
      res.redirect('/admin/categorias')
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao deletara a categoria')
      res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req, res) => {
  postagens
    .find()
    .populate('categoria')
    .sort({ date: 'desc' })
    .then((postagens) => {
      res.render('admin/postagens.handlebars', { postagens: postagens })
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao listar as postagens')
      res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, (req, res) => {
  categorias
    .find()
    .then((categorias) => {
      res.render('admin/addpostagens.handlebars', { categorias: categorias })
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao carregar o formulario')
      res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
  let erros = []

  if (
    !req.body.titulo ||
    typeof req.body.titulo == undefined ||
    req.body.titulo == null
  ) {
    erros.push({ texto: 'Titulo inválido!' })
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: 'Slug inválido!' })
  }
  if (
    !req.body.descricao ||
    typeof req.body.descricao == undefined ||
    req.body.descricao == null
  ) {
    erros.push({ texto: 'Descrição inválido!' })
  }
  if (
    !req.body.conteudo ||
    typeof req.body.conteudo == undefined ||
    req.body.conteudo == null
  ) {
    erros.push({ texto: 'Conteudo inválido!' })
  }
  if (req.body.categoria == '0') {
    erros.push({ texto: 'Categoria inválida, resgitre uma categoria!' })
  }
  if (erros.length > 0) {
    res.render('admin/addpostagens.handlebars', { erros: erros })
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
    }
    new postagens(novaPostagem)
      .save()
      .then(() => {
        req.flash('success_msg', 'Postagem criada com sucesso!')
        res.redirect('/admin/postagens')
      })
      .catch((erro) => {
        req.flash(
          'error_msg',
          'Houve um erro ao salvar a postagem, tente novamente!'
        )
        res.redirect('/admin/postagens')
      })
  }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
  postagens
    .findOne({ _id: req.params.id })
    .then((postagens) => {
      categorias
        .find()
        .then((categorias) => {
          res.render('admin/editpostagens.handlebars', {
            postagens: postagens,
            categorias: categorias,
          })
        })
        .catch((erro) => {
          req.flash('error_msg', 'Houve um erro ao listar as categorias!')
          res.redirect('/admin/postagens')
        })
    })
    .catch((erro) => {
      req.flash(
        'error_msg',
        'Houve um erro ao carregar o formulário de edição!'
      )
      res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', eAdmin, (req, res) => {
  let erros = []

  if (
    !req.body.titulo ||
    typeof req.body.titulo == undefined ||
    req.body.titulo == null
  ) {
    erros.push({ texto: 'Titulo inválido!' })
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: 'Slug inválido!' })
  }
  if (
    !req.body.descricao ||
    typeof req.body.descricao == undefined ||
    req.body.descricao == null
  ) {
    erros.push({ texto: 'Descrição inválido!' })
  }
  if (
    !req.body.conteudo ||
    typeof req.body.conteudo == undefined ||
    req.body.conteudo == null
  ) {
    erros.push({ texto: 'Conteudo inválido!' })
  }
  if (req.body.categoria == '0') {
    erros.push({ texto: 'Categoria inválida, resgitre uma categoria!' })
  }
  if (erros.length > 0) {
    res.render('admin/editpostagens.handlebars', { erros: erros })
  } else {
    postagens
      .findOne({ _id: req.body.id })
      .then((postagens) => {
        postagens.titulo = req.body.titulo
        postagens.slug = req.body.slug
        postagens.conteudo = req.body.conteudo
        postagens.descricao = req.body.descricao
        postagens.categoria = req.body.categoria

        postagens
          .save()
          .then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
          })
          .catch((erro) => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/postagens')
          })
      })
      .catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao salvar a edição!')
        res.redirect('/admin/postagens')
      })
  }
})

router.post('/postagens/deletar', eAdmin, (req, res) => {
  postagens
    .deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash('success_msg', 'Postagem deletada com sucesso!')
      res.redirect('/admin/postagens')
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao deletara a postagem')
      res.redirect('/admin/postagens')
    })
})

module.exports = router
