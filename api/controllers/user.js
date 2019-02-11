"use strict";
var bcrypt = require("bcrypt-nodejs");
var mongoosePaginate = require('mongoose-pagination');
var User = require("../models/user");
var jwt = require('../services/jwt');
var fs = require('fs'); //Librería file sistem de node js
var path = require('path');

function home(req, res) {
  res.status(200).send({
    message: "Hola mundo"
  });
}

function pruebas(req, res) {
  console.log(req.body);
  res.status(200).send({
    message: "pruebas servidor"
  });
}

//Método para crear un nuevo usuario
function saveUser(req, res) {
  var params = req.body;
  var user = new User();

  if (
    params.name &&
    params.surname &&
    params.nick &&
    params.email &&
    params.password
  ) {
    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    user.role = "ROLE_USER";
    user.image = null;

    //Control de usuarios duplicados
    User.find({
      $or: [
        { email: user.email.toLowerCase() },
        { nick: user.nick.toLowerCase() }
      ]
    }).exec((err, users) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Error en la petición de usuario" });
      if (users && users.length >= 1) {
        return res
          .status(200)
          .send({ message: "El usuario que intenta registrar ya existe!!" });
      } else {
        //Cifra la password y guarda los datos
        bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash; //Encriptar la contraseña

          user.save((err, userStored) => {
            if (err)
              return res
                .status(500)
                .send({ message: "Error a guardar el usuario" });

            if (userStored) {
              res.status(200).send({ user: userStored });
            } else {
              res
                .status(404)
                .send({ message: "No se ha registrado el usuario" });
            }
          });
        });
      }
    });
  } else {
    res.status(200).send({
      message: "Campos obligatorios sin llenar"
    });
  }
}

//Método para hacer login en la base de datos
function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email:email}, (err, user) => {
        if(err) return res.status(500).send({message:'Error en la petición'});
        if(user){
            bcrypt.compare(password, user.password, (err, check) => {
                if(check){

                    if(params.gettoken){
                        //Generar y devolver el token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        //Devolver datos de usuario
                        user.password = undefined; //Para no retornar la password
                        return res.status(200).send({user});
                    }
                    
                }else{
                    return res.status(404).send({message:'El usuario no se ha podido identificar'});
                }
            })
        }else{
            return res.status(404).send({message:'El usuario no se ha podido identificar!!'});
        }
    })

}

//Método para obtener un usuario
function getUser(req,res){
  var userId = req.params.id;

  User.findById(userId, (err, user) => {
    if(err) return res.status(500).send({message:'Error en la petición'});
    if(!user) return res.status(404).send({message:'El usuario no existe'});
    return res.status(200).send({user});
  })
  
}

//Método para obtener todos los usuarios
function getUsers(req,res){
  var identity_user_id = req.user.sub;
  var page = 1;

  if(req.params.page){
    page = req.params.page;
  }

  var itemsPerPage = 5;

  User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
    if(err) return res.status(500).send({message:'Error en la petición'});
    if(!users) return res.status(404).send({message:'No hay usuarios disponibles'});
    return res.status(200).send({
      users,
      total,
      pages: Math.ceil(total/itemsPerPage)
    });
  });  
}

//Método para editar datos de usuario
function updateUser(req,res){
  var userId = req.params.id;
  var update = req.body;

  //Borrar propiedad de password
  delete update.password;

  if(userId != req.user.sub){
    return res.status(500).send({message:'No tiene permisos para actualizar los datos de ete usuario'});
  }

  User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdate) => {
    if(err) return res.status(500).send({message:'Error en la petición'});

    if(!userUpdate) return res.status(404).send({message:'No se ha podido actualizar el usuario'});

    return res.status(200).send({user: userUpdate});
  });  
}

//Método para subir archivos de imagen/avatar de usuario
function uploadImage(req,res){
  var userId = req.params.id;

  if(req.files){
    var file_path = req.files.image.path;
    var file_split = file_path.split('\/');
    var file_name = file_split[2];
    var ext_split = file_name.split('\.');
    var file_ext = ext_split[1];

    if(userId != req.user.sub){
      return removeFilesOfUploads(res, file_path, 'No tiene permisos para actualizar los datos de ete usuario');
    }

    if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ){
      //Actualizar documento de usuario logueado
      User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdate) => {
        if(err) return res.status(500).send({message:'Error en la petición'});
    
        if(!userUpdate) return res.status(404).send({message:'No se ha podido actualizar el usuario'});
    
        return res.status(200).send({user: userUpdate});
      }); 
    }else{
      return removeFilesOfUploads(res, file_path, 'Extensión no válida');
    }
  }else{
    return res.status(200).send({message: 'No se han subido imágenes'});
  }

  
}

//Método que elimita archivo de imagen cargada
function removeFilesOfUploads(res, file_path, message){
  fs.unlink(file_path, (err) => {
    return res.status(200).send({message: message});
  });
}

//Método para obtener la imagen del usuario
function getImageFile(req, res){
  var image_file = req.params.imageFile;
  var path_file = './uploads/users/'+image_file;

  fs.exists(path_file, (exists) => {
    if(exists){
      res.sendFile(path.resolve(path_file));
    }else{
      return res.status(200).send({message: 'No existe la imagen ...'})
    }
  });
}

module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  uploadImage,
  getImageFile
};
