"use strict";

var mongoosePaginate = require('mongoose-pagination');
//var fs = require('fs'); //Librería file sistem de node js
//var path = require('path');
var User = require("../models/user");
var Follow = require('../models/follow');

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

module.exports = {
    saveFollow
};