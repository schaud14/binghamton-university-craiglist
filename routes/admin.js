var router = require('express').Router();
// var express = require('express');
// var multer = require('multer');
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');

 // var storage =   multer.diskStorage({
 //   destination: function (req, file, callback) {
 //     callback(null, './images');
 //   },
 //   filename: function (req, file, callback) {
 //     callback(null, file.fieldname + '-' + Date.now());
 //   }
 // });
 // var upload = multer({ storage : storage}).single('image');
//
// var uploading = multer({
//   dest: __dirname + '../public/images/',
// });
// router.post('/upload',function(req,res){
//     upload(req,res,function(err) {
//         if(err) {
//             return res.end("Error uploading file.");
//         }
//         res.end("File is uploaded");
//     });
// });
router.get('/add-category', function(req, res, next) {
  res.render('admin/add-category', { message: req.flash('success') });
});
router.post('/add-category', function(req, res, next) {
  var category = new Category();
  category.name = req.body.name;
  category.save(function(err) {
    if (err) return next(err);
    req.flash('success', 'Successfully added a category');
    return res.redirect('/add-category');
  });
});

// router.get('/add-product0', function(req,res,next) {
//   res.render('admin/add-product0',{message: req.flash('success')});
// });

// router.post('/add-product0', uploading,function(req, res,next){
//   Product.findOne({_id: req.body._id}, function(err,prod){
//     if(err) return next(err);
//     prod.image = req.files.name;
//     prod.save(function(err) {
//       if (err) return next(err);
//       req.flash('success', 'Successfully added a Product Image');
//       return res.redirect('/admin/add-product');
//     });
//   });
// });

router.get('/add-product', function(req, res, next) {
  res.render('admin/add-product', { message: req.flash('success') });
});
router.post('/add-product', function(req, res, next) {
  // var product = new Product();
  // product.name = req.body.name;
  // product.price = req.body.price;
  // product.image = req.body.iamge;
  // product.category = req.query.category;
  //
  // // var a = req.getElementById("categorylist");
  // // product.category = a.options[a.selectedIndex].value;
  // // product.category = $('#categorylist').val();
  // product.save(function(err) {
  //   if (err) return next(err);
  //   req.flash('success', 'Successfully added a category');
  //   return res.redirect('/add-product');
  // });
  async.waterfall([
    function(callback) {
      console.log(req.body.category);
      Category.findOne({ name: req.body.category }, function(err, category1) {
        if (err) return next(err);
        console.log(category1);
        callback(null, category1);
      });
    },
    function(category1, callback) {
        var product = new Product();
        product.category = category1._id;
        product.name = req.body.name;
        product.price = req.body.price;
        product.description = req.body.description;
        product.image = "/images/"+req.body.image;
        product.save(function(err) {
          if (err) return next(err);
          req.flash('success', 'Successfully added a Product');
          return res.redirect('/add-product');
        });
    }
  ]);
})


module.exports = router;
