'use strict' //Para usar nuevas características de javascript

var mongoose = require('mongoose'); //Librería de mongo
var app = require('./app');
var port = 3800;
//Conexión Database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/curso_mean_social', { useMongoClient: true })
    .then(() => {
        console.log("Conexión realizada exitosamente");

        //Crear servidor
        app.listen(port, () => {
            console.log("servidor corriendo en http://localhost:3800")
        });
    })
    .catch(err => console.log(err));