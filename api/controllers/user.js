'use strict'
var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user');

function home(req, res){
    res.status(200).send({
        message: 'Hola mundo'
    });
};

function pruebas (req, res){
    console.log(req.body);
    res.status(200).send({
        message: 'pruebas servidor'
    });
};

//Método para crear un nuevo usuario
function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.nick &&
        params.email && params.password){

            user.name = params.name;
            user.surname = params.surname;
            user.nick = params.nick;
            user.email = params.email;
            bcrypt.hash(params.password, null, null, (err, hash) => {
                user.password = hash; //Encriptar la contraseña

                user.save((err, userStored) => {
                    if(err) return res.status(500).send({message: 'Error a guardar el usuario'})

                    if(userStored){
                        res.status(200).send({user: userStored});
                    }else{
                        res.status(404).send({message: 'No se ha registrado el usuario'});
                    }
                });
            });

    }else{
        res.status(200).send({
            message: 'Campos obligatorios sin llenar'
        });
    }
}

module.exports = {
    home,
    pruebas
}