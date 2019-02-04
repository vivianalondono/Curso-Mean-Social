'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar rutas
var user_routes = require('./routes/user');

//Middlewares - (métodos que se ejecutan antes de llegar al controlador)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//cors

//rutas
app.use('/api', user_routes);

//exportar
module.exports = app;