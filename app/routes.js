// load the auth variables
var request = require('request');
module.exports = function(app, passport) {
// normal routes ===============================================================

        // show the home page (will also have our login links)
        app.get('/', function(req, res) {
                res.render('index.ejs');
        });


        // DAILOG SECTION =========================
        app.get('/dailog', isLoggedIn, function(req, res) {
                res.render("dailog.ejs", {
                        user : req.user,
                        state : global.state
                });
        });

        // LOGOUT ==============================
        app.get('/logout', function(req, res) {
                req.logout();
                res.redirect('/');
        });

        app.get('/client', function(req, res) {
                res.render("client.ejs");
        });

        app.post('/client', function(req, res) {
                var authorize_endpoint = req.body.authorize_endpoint;
                var token_endpoint = req.body.token_endpoint;
        });
//Authentication

                // show the login form
app.get('/login', function(req, res) {
global.state = req.query.state;
global.scope = req.query.scope;
    request('https://acme-admin.3scale.net/admin/api/application_plans.json?provider_key=9062f7afd5a594f2e9882c34206eea67', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var parsedResponse = JSON.parse(body);
            var parsedObject = getObjects(parsedResponse, 'name', global.scope);
 	    if(parsedObject.length == 0){
	      res.render('invalidscope.ejs', {
        	invalidscope: req.query.scope
    		});		
	    } else {
            var application_id = getValues(parsedObject, 'id');

        request('https://acme-admin.3scale.net/admin/api/application_plans/'+application_id+'/features.json?provider_key=9062f7afd5a594f2e9882c34206eea67', function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var parsedResponse_features = JSON.parse(body);
	    console.log(parsedResponse_features);
            var parsedObject = getObjects(parsedResponse_features, 'id', '');
            var description = getValues(parsedObject, 'name');

            global.description = description;

        }

        })
	
    res.render('login.ejs', {
        message: req.flash('loginMessage'),
        state: req.query.state
    });
    }
   }
 })
});

                // process the login form
                app.post('/login', passport.authenticate('local-login', {
                        successRedirect : '/dailog', // redirect to the secure profile section
                        failureRedirect : '/login', // redirect back to the signup page if there is an error
                        failureFlash : true // allow flash messages
                }));

                // SIGNUP =================================
                // show the signup form
                app.get('/signup', function(req, res) {
                        res.render('signup.ejs', { message: req.flash('signupMessage') });
                });

                // process the signup form
                app.post('/signup', passport.authenticate('local-signup', {
                        successRedirect : '/dailog', // redirect to the secure profile section
                        failureRedirect : '/signup', // redirect back to the signup page if there is an error
                        failureFlash : true // allow flash messages
                }));

        // locally --------------------------------
                app.get('/connect/local', function(req, res) {
                        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
                });
                app.post('/connect/local', passport.authenticate('local-signup', {
                        successRedirect : '/profile', // redirect to the secure profile section
                        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
                        failureFlash : true // allow flash messages
                }));


        //unlink account
	app.get('/unlink/local', isLoggedIn, function(req, res) {
                var user            = req.user;
                user.local.email    = undefined;
                user.local.password = undefined;
                user.save(function(err) {
                        res.redirect('/profile');
                });
        });



};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
                return next();

        res.redirect('/');
}

// to get the objectkeys and objects values
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));    
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}
 
//return an array of values that match on a certain key
function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}
 
//return an array of keys that match on a certain value
function getKeys(obj, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getKeys(obj[i], val));
        } else if (obj[i] == val) {
            objects.push(i);
        }
    }
    return objects;
}
