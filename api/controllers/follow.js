"use strict";

var mongoosePaginate = require('mongoose-pagination');
//var fs = require('fs'); //Librería file sistem de node js
//var path = require('path');
var User = require("../models/user");
var Follow = require('../models/follow');

//Método para seguir un usuario / guardar follow
function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if(err) return res.status(500).send({message: "Error al guardar el seguimiento"});
        if(!followStored) return res.status(400).send({message: "El seguimiento no se ha guardado"});
        return res.status(200).send({follow: followStored});
    });
    
}

//Método para dejar de seguir un usuario / eliminar follow
function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({'user': userId, 'followed': followId}).remove(err => {
        if(err) return res.status(500).send({message: "Error al dejar de seguir"});
        return res.status(200).send({message:'El follow se ha eliminado!!'});
    });   
}

//Método para traer todos los usuarios que sigue un usuario
function getFollowingUsers(req, res) {
    var userId = req.user.sub;
    
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }
    var itemsPerPage = 4;

    Follow.find({'user': userId}).populate({path:'followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
        if(err) return res.status(500).send({message: "Error en el servidor"});
        if(!follows) return res.status(400).send({message: "No está siguiendo a ningún usuario"});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });   
}

//Método para listar los usuarios que nos siguen paginados
function getFollowedUsers(req, res) {
    var userId = req.user.sub;
    
    if(req.params.id && req.params.page){
        userId = req.user.id;
    }
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }
    var itemsPerPage = 4;

    Follow.find({'followed': userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if(err) return res.status(500).send({message: "Error en el servidor"});
        if(!follows) return res.status(400).send({message: "No te sigue ningún usuario"});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        });
    });   
}

//Método para listar los usuarios que estoy siguiendo o los que me siguen sin paginar 
function getMyFollows (req, res) {
    var userId = req.user.sub;
    var find = Follow.find({'user': userId}); // Trae usuarios que yo sigo

    if(req.params.followed){
        find = Follow.find({'followed': userId}); // Trae usuarios que me siguen
    }
    
    find.populate('user followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: "Error en el servidor"});
        if(!follows) return res.status(400).send({message: "No te sigue ningún usuario"});
        return res.status(200).send({
            follows
        });
    });   
}

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
};