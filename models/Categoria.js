const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorias = new Schema({
  nome: {
    type: String,
    require: true,
  },
  slug: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
})

mongoose.model('categorias', categorias)
