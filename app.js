var express      = require("express"),
app       		 = express(),
bodyParser 	 	 = require("body-parser"),
methodOverride	 = require("method-override"),
flash 			 = require("connect-flash");

var indexRoutes  =require("./routes/index");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public/"));
app.use(flash());
app.use(methodOverride("_method"));

app.use(require("express-session")({
	secret:"bookstore",
	resave:false,
	saveUniniatialized:false
}));

app.use(function (req, res, next) {
	res.locals.user = req.session.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

// ROUTES
app.use(indexRoutes);

app.listen(3000,function(){
	console.log("SERVER STARTED!!!");
});