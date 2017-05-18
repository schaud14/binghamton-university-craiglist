var router = require('express').Router();
var User = require('../models/user');
var Product = require('../models/product');
var Cart = require('../models/cart');
var async = require('async');

var stripe = require('stripe') ('sk_test_4QrRoPiIokRho5AOSdoWyHAc');

function paginate(req, res, next) {

  var perPage = 6;
  var page = req.params.page;

  Product
    .find()
    .skip( perPage * page)
    .limit( perPage )
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      Product.count().exec(function(err, count) {
        if (err) return next(err);
        res.render('main/product-main', {
          products: products,
          pages: count / perPage
        });
      });
    });

}

// Product.createMapping(function(err, mapping) {
//   if (err) {
//     console.log("error creating mapping");
//     console.log(err);
//   } else {
//     console.log("Mapping created");
//     console.log(mapping);
//   }
// });

// var stream = Product.synchronize();
// var count = 0;
//
// stream.on('data', function() {
//   count++;
// });
//
// stream.on('close', function() {
//   console.log("Indexed " + count + " documents");
// });
//
// stream.on('error', function(err) {
//   console.log(err);
// });

router.get('/cart', function(req, res, next) {
  Cart
    .findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
      if (err) return next(err);
      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove')
      });
    });
});

router.post('/product/:product_id', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, cart) {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });



    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save(function(err) {
      if (err) return next(err);
      return res.redirect('/cart');
    });
  });
});


router.post('/remove', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found) {
      if (err) return next(err);
      req.flash('remove', 'Successfully removed');
      res.redirect('/cart');
    });
  });
});


router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
});

// router.get('/search', function(req, res, next) {
//   if (req.query.q) {
//     Product.search({
//       query_string: { query: req.query.q}
//     }, function(err, results) {
//       results:
//       if (err) return next(err);
//       var data = results.hits.hits.map(function(hit) {
//         return hit;
//       });
//       res.render('main/search-result', {
//         query: req.query.q,
//         data: data
//       });
//     });
//   }
// });

router.get('/search', function(req, res, next) {
  if (req.query.q) {
    //var query = { name: new RegExp(req.query.q) };
    var query = RegExp(req.query.q)+"i";
    console.log(query);
    //console.log(regex);
  //  console.log(Product.find(query));

  // Product.index({name:"text"});
    // Product.find({ name: {'$regex' : req.query.q, '$options' : 'i'}})
    Product.find({ name: {'$regex' : req.query.q, '$options' : 'i'}}, function(err, data){
    // Product.find({ name: /"req.query.q"/i }, function(err, data){
      if(err) {
        return(err);
      } else {
        res.render('main/search-result', {
             query: req.query.q,
             data: data
      });
      }
    });

  //   var regex = RegExp(".*" + req.query.q + ".*");
  //   var query = { name: new RegExp(req.query.q) };
  //   console.log(query);
  // //  var myCursor = Product.find(query);
    //console.log(myCursor.forEach(printjson));
    // var data = function(query, next){
    //   Product.find(query,function(err,data){
    //     if(err) {
    //       return next(err);
    //     } else {
    //       res.render('main/search-result', {
    //         query: req.query.q,
    //         data: data
    //       });
    //     }
    //   });
    // }

    // var data = function(query, next){
    // Product.find(query).lean().exec(function (err, data) {
    //   if(err) {
    //     return next(err);
    //   } else {
    //     console.log(data);
    //     res.render('main/search-result', {
    //       query: req.query.q,
    //       data: data
    //     });
    //   }
    //   });
    // }

//     var userdata = function(query, next) {
//     Product.
//         find(query, function(err,data) {
//         if (err) {
//             return next(err);
//         } else {
//           console.log("Here");
//           res.render('main/search-result', {
//                query: req.query.q,
//                data: data
//         });
//       }
//     });
// }



//     Product.find(query).toArray(function(err, data) {
//
// assert.equal(err, null);
// assert.notEqual(data.length, 0);
//
//   res.render('main/search-result', {
//     query: req.query.q,
//     data: data
//   });
// });



//     Product.find(query).stream()
//   .on('data', function(doc){
//     es.render('main/search-result', {
//         query: req.query.q,
//         data: data
//       });
//   })
//   .on('error', function(err){
//     console.log(err);
//   })
//   .on('end', function(){
// console.log("end");
// });

    // Product.find(query).toArray(function(err, data){
    //   res.render('main/search-result', {
    //     query: req.query.q,
    //     data: data
    //   });
    // });
  }
});

router.get('/', function(req, res, next) {

  if (req.user) {
    paginate(req, res, next);
  } else {
    res.render('main/home');
  }

});

router.get('/page/:page', function(req, res, next) {
  paginate(req,res,next);
});

router.get('/about', function(req, res) {
  res.render('main/about');
});

router.get('/products/:id', function(req, res, next) {
  Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      res.render('main/category', {
        products: products
      });
    });
});


router.get('/product/:id', function(req, res, next) {
  // console.log(req);
  Product.findById({ _id: req.params.id }, function(err, product) {
    if (err) return next(err);
    res.render('main/product', {
      product: product
    });
  });
});



router.post('/payment', function(req, res, next) {

  var stripeToken = req.body.stripeToken;
  var currentCharges = Math.round(req.body.stripeMoney * 100);
  stripe.customers.create({
    source: stripeToken,
  }).then(function(customer) {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  }).then(function(charge) {
    async.waterfall([
      function(callback) {
        Cart.findOne({ owner: req.user._id }, function(err, cart) {
          callback(err, cart);
        });
      },
      function(cart, callback) {
        User.findOne({ _id: req.user._id }, function(err, user) {
          if (user) {
            for (var i = 0; i < cart.items.length; i++) {
              user.history.push({
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }

            user.save(function(err, user) {
              if (err) return next(err);
              callback(err, user);
            });
          }
        });
      },
      function(user) {
        Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated) {
          if (updated) {
            res.redirect('/profile');
          }
        });
      }
    ]);
  });


});

module.exports = router;
