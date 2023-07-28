//carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParcer = require('body-parser')
const app = express()
const path = require('path')
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/postagem')
const postagens = mongoose.model('postagens')
require('./models/categoria')
const categorias = mongoose.model('categorias')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')
require('dotenv').config()

//configuraçoes
//sessão
app.use(
  session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//middlewaew
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})
//body-parcer
app.use(bodyParcer.urlencoded({ extended: false }))
app.use(bodyParcer.json())

//handlebars
app.engine(
  'handlebars',
  handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,

      allowProtoMethodsByDefault: true,
    },
  })
)

//mongoose
mongoose.Promise = global.Promise
mongoose
  .connect(db.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('mongoDB Conectado...')
  })
  .catch((erro) => {
    console.log('Houve um erro ao se conectar ao mongoDB: ' + erro)
  })
//em breve

//public
app.use(express.static(path.join(__dirname, 'public')))

//rotas
app.get('/', (req, res) => {
  postagens
    .find()
    .populate('categoria')
    .sort({ date: 'desc' })
    .then((postagens) => {
      res.render('index.handlebars', { postagens: postagens })
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req, res) => {
  postagens
    .findOne({ slug: req.params.slug })
    .then((postagens) => {
      if (postagens) {
        res.render('postagem/index.handlebars', { postagens: postagens })
      } else {
        req.flash('error_msg', 'Essa postagem não exite')
        res.redirect('/')
      }
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/')
    })
})

app.get('/categorias', (req, res) => {
  categorias
    .find()
    .then((categorias) => {
      res.render('categorias/index.handlebars', { categorias: categorias })
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
      res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
  categorias
    .findOne({ slug: req.params.slug })
    .then((categorias) => {
      if (categorias) {
        postagens
          .find({ categoria: categorias._id })
          .then((postagens) => {
            res.render('categorias/postagens.handlebars', {
              postagens: postagens,
              categorias: categorias,
            })
          })
          .catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao listar os posts')
            res.redirect('/')
          })
      } else {
        req.flash('error_msg', 'essa categoria não existe')
        res.redirect('/')
      }
    })
    .catch((erro) => {
      req.flash(
        'error_msg',
        'Houve um erro interno ao carregar a página dessa categoria'
      )
      res.redirect('/')
    })
})

app.get('/404', (req, res) => {
  res.send('Erro 404!')
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)

//outros
const port = process.env.PORT || 8081
app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})
