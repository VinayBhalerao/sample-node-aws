// load the auth variables
var request = require('request');
module.exports = function(app, passport) {
// normal routes ===============================================================

        // show the home page (will also have our login links)
        app.get('/', function(req, res) {
                res.render('index.ejs');
        });

        // PROFILE SECTION =========================
        app.get('/profile', isLoggedIn, function(req, res) {
                res.render('profile.ejs', {
                        user : req.user
                });
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
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
                // show the login form

app.get('/login', function(req, res) {

    request('https://acme-admin.3scale.net/admin/api/application_plans.json?provider_key=9062f7afd5a594f2e9882c34206eea67', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var parsedResponse = JSON.parse(body);
            var parsedObject = getObjects(parsedResponse, 'name', 'read');
	    console.log(parsedObject);
            var application_id = getValues(parsedObject, 'id');
        }


        request('https://acme-admin.3scale.net/admin/api/applications/find.json?provider_key=9062f7afd5a594f2e9882c34206eea67&application_id=' + application_id + '&app_id=0dd367de', function(error, response, body) {

            var parsedResponse_1 = JSON.parse(body);
            var service_id = getValues(parsedResponse_1, 'service_id');
            console.log(parsedResponse_1);
            request('https://acme-admin.3scale.net/admin/api/services/' + service_id + '/metrics.json?provider_key=9062f7afd5a594f2e9882c34206eea67', function(error, response, body) {

                var parsedResponse_metric = JSON.parse(body);
                var parsedObject_metric = getObjects(parsedResponse_metric, 'name', 'hits');
                var metrics_id = getValues(parsedObject_metric, 'id');
	        console.log(parsedObject_metric);
                console.log(metrics_id);

                request('https://acme-admin.3scale.net/admin/api/application_plans/' + application_id + '/limits.json?provider_key=9062f7afd5a594f2e9882c34206eea67', function(error, response, body) {

                    var parsedResponse_limits = JSON.parse(body);
                    var parsedObjects_limit = getObjects(parsedResponse_limits, 'value', '');
                    //var limit_id = getValues(parsedObject_limit, 'id');
                    //console.log(limit_id);
    		    //console.log(parsedObjects_limit);
		    var inactive_method_ids= [];
		    for( var i=0, l=parsedObjects_limit.length; i<l; i++ ) {
    			console.log( parsedObjects_limit[i] );
		        if(parsedObjects_limit[i].value == "0") {
			    inactive_method_ids.push(parsedObjects_limit[i].metric_id);
			}	
		    }
		    console.log(inactive_method_ids);

                    request('https://acme-admin.3scale.net/admin/api/services/' + metrics_id + '/metrics/2555417829552/methods.json?provider_key=9062f7afd5a594f2e9882c34206eea67', function(error, response, body) {

                        var parsedResponse_methods = JSON.parse(body);
                        var method_id = getObjects(parsedResponse_methods, 'name', '');
                        //console.log(method_id);

                    })

                })

            })

        })




    })
    res.render('login.ejs', {
        message: req.flash('loginMessage'),
        state: req.query.state
    });
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


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

        // local -----------------------------------
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

//return an array of objects according to key, value, or key and value matching
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
