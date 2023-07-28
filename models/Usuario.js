const mongoose = require('mongoose')
const Schema = mongoose.Schema

const usuario = new Schema({
  nome: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  senha: {
    type: String,
    require: true,
  },
  eAdmin: {
    type: Number,
    default: 0,
  },
})

mongoose.model('usuarios', usuario)