"use strict";

var path = require('path');
var fs = require('fs'); //Librería file sistem de node js
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require("../models/user");
var Follow = require('../models/follow');

function probando(req, res) {
    res.status(200).send({
      message: "prueba controlador publicaciones"
    });
}

//Método para guardar una publicación
function savePublication(req, res) {
    var params = req.body;

    if(!params.text) return res.status(200).send({message: "Debe enbiar un texto"});
    var publication = new Publication();
    publication.text = params.text;
    publication.file = null;
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) => {
        if(err) return res.status(500).send({message: "Error al guardar la publicación"});
        if(!publicationStored) return res.status(400).send({message: "La publicación no se ha guardado"});
        return res.status(200).send({publication: publicationStored});
    });
    
}

//Método para traer todas las publicaciones
function getPublications(req, res) {
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;
    var userId = req.user.sub;

    Follow.find({'user': userId}).populate('followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: "Error al devolver el seguiminento"});
        //Traer los usuarios que se están siguiendo
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed)
        });
        //Buscar todos los documentos cuyo usuario esté contenido en follows_clean
        Publication.find({user: {"$in": follows_clean}}).sort('created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if(err) return res.status(500).send({message: "Error al devolver publicaciones"});
            if(!publications) return res.status(400).send({message: "No hay publicaciones"});
            return res.status(200).send({
                total_items: total,
                page: page,
                pages: Math.ceil(total/itemsPerPage),
                publications
            });
        });
        
    });   
}

//Método para obtener una publicación por id
function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if(err) return res.status(500).send({message: "Error al devolver la publicación"});
        if(!publication) return res.status(400).send({message: "La publicación no existe"});
        return res.status(200).send({publication});
    });   
}


//Método para eliminar una publicación por id
function deletePublication(req, res) {
    var publicationId = req.params.id;

    Publication.find({'user': req.user.sub, '_id': publicationId}).remove((err) => {
        if(err) return res.status(500).send({message: "Error al borrar la publicación"});
        //if(!publicationRemoved) return res.status(400).send({message: "La publicación no se ha borrado"});
        return res.status(200).send({message:'Publicación eliminada'});
    });   
}

//Método para subir archivos de imagen en la publicación
function uploadImage(req,res){
    var publicationId = req.params.id;
  
    if(req.files){
      var file_path = req.files.image.path;
      var file_split = file_path.split('\/');
      var file_name = file_split[2];
      var ext_split = file_name.split('\.');
      var file_ext = ext_split[1];
  
      if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ){
        //Verificar que el usuario que va a subir la imagen es el dueño de la publicación
        Publication.findOne({'user': req.user.sub, '_id':publicationId}).exec((err,publication) => {
            if(publication){
                //Actualizar documento de la publicación
                Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true}, (err, publicationUpdate) => {
                    if(err) return res.status(500).send({message:'Error en la petición'});

                    if(!publicationUpdate) return res.status(404).send({message:'No se ha podido actualizar el usuario'});

                    return res.status(200).send({publication: publicationUpdate});
                }); 
            }else{
                return removeFilesOfUploads(res, file_path, 'No tiene permisos para actualizar esta publicación');
            }
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
  
  //Método para obtener la imagen de la publicación
  function getImageFile(req, res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/publications/'+image_file;
  
    fs.exists(path_file, (exists) => {
      if(exists){
        res.sendFile(path.resolve(path_file));
      }else{
        return res.status(200).send({message: 'No existe la imagen ...'})
      }
    });
  }

  module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
  };