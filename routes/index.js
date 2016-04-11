var express = require('express');
var router = express.Router();

var getVersion = require('../my_modules/version.js');

console.log( getVersion() );

// require the function that is exported from my connection module
var connection = require('../my_modules/connection');


// I am requiring the ObjectID object from 'mongodb' to that I can convert
// mongodb _id's from strings to ObjectId objects and back again.
var ObjectId = require('mongodb').ObjectID;

// If I am running locally then use 'mongodb://localhost:27017/test' otherwise
// look for the environment variable
var url = process.env.CUSTOMCONNSTR_MongoDB || 'mongodb://localhost:27017/test'; 

/* GET home page. */
router.get('/', function(req, res, next) {
    // ok, just for the fun of it let's add a "document" (aka a 
    // javascript object) to the database
    
    var stuffToStore = {
        name: 'John',
        kids: ['Ben', 'Leah', 'Sadhbh'],
        age: 21
    };
    
    // Notice that I am now calling the connection function that has been exported
    // from my_module called 'connection.js'.
    connection(function(err, conn) {
        if(err){
            console.log(err);
            throw err;
        } else {
            conn.collection('stuff').insertOne(stuffToStore, function(err, result){
                // This callback is going to get called by the insertOne function
                // when either the insertion has been successful or not.
                if (err) {
                    console.log(err);
                    throw err;
                }
                else {
                    console.log("Insertion complete");
                    conn.close();
                }
            });
            
            // Notice that I render the index page without even waiting for the db to say that 
            // it has inserted the document
            res.render('index', { title: 'MongoDB' });
        }
    });
    
    
});

router.get('/seeStuff', function(req, res, next) {
    connection(function(err, conn) {
       if (err) {
           console.log(err);
           throw err;
       } else {
           var cursor = conn.collection('stuff').find();
           
           // cursor is like a pointer to the first item in the DB that matches the
           // above query. Calling toArray gets all if these items from the DB and
           // stores them in an array.
           cursor.toArray(function(err, docs){
              res.render('stuff', {stuff: docs}); 
           });
       }
    });
});

router.get('/delete/:docID', function(req, res, next) {
    connection(function(err, conn) {
       if (err) {
           console.log(err);
           throw err;
       } else {
           // Ok, let me get the Id of the document that needs to be deleted
           var oid = new ObjectId(req.params.docID);
           
        conn.collection('stuff', function(err, collection) {
            collection.remove({_id: oid}, {w:1}, function (err, result) {
                if (err) throw err;

                console.log("Result from removing a user: ", result);
                res.redirect('/seeStuff');
            });
        });   
      }
    });
    
});


module.exports = router;
