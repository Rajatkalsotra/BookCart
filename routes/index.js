var express = require("express"),
  router = express.Router(),
  mysql = require("mysql"),
  config = require("../db/connect.js"),
  bcrypt = require("bcryptjs");

var connection = mysql.createConnection(config);
connection.connect(function(err) {
  if (err) throw err;
});
router.get("/", (req, res) => {
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      connection.query("SELECT * FROM products", function(
        err2,
        result,
        fields
      ) {
        if (err2) {
          console.log(err2);
        } else {
          connection.end();
          res.render("home", { result: result, n: result.length });
        }
      });
    }
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  email_id = req.body.email;
  password = req.body.password;
  if(email_id=="admin" && password =="admin"){
    req.session.user=1;
    res.render("new");
  }
  else{
  var query = "SELECT * FROM users WHERE email_id = ?";
  var connection = mysql.createConnection(config);
  connection.query(query, [email_id], function(err, results, fields) {
    if (err) console.log(err);
    else {
      if (results.length > 0) {
        bcrypt.compare(password, results[0].password, function(err, resu) {
          if (resu == 1) {
            req.session.user = results[0];
            // console.log(req.session.user);
            req.flash("success","Logged you in!!")
            res.redirect("/");
          } else {
            connection.end();
            req.flash("error","Wrong Password");
            res.redirect("/login");
          }
        });
      } else {
        connection.end();
        req.flash("error","User does not exist");
        res.redirect("/login");
      }
    }
  });
  }
  
});

router.get("/register", function(req, res) {
  res.render("register");
});
// REGISTER USER
router.post("/register", (req, res) => {
  var hashed = "";
  f_name = req.body.user.f_name;
  l_name = req.body.user.l_name;
  mobile = req.body.user.mobile;
  age = req.body.user.age;
  email_id = req.body.user.email_id;
  password = req.body.user.password;
  location = req.body.user.location;
  bcrypt.hash(password, 5, function(err, hash) {
    hashed = hash;
  });
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      req.flash("error",err.message);
      console.log(err);
    } else {
      var values = [[hashed, email_id, f_name, l_name, age, location, mobile]];
      var queryFields =
        "password, email_id, f_name, l_name, age, location, mobile";
      var query = "INSERT INTO users(" + queryFields + ") VALUES ?";
      connection.query(query, [values], function(err, result, fields) {
        if (err) {
          console.log(err);
        } else {
          console.log("User created");
          connection.end();
          req.flash("success","User successfully registered");
          res.redirect("/login");
        }
      });
    }
  });
});
router.get("/book/:pid", (req, res) => {
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      connection.query(
        "SELECT * FROM products where p_id=" + req.params.pid,
        function(err2, result, fields) {
          if (err2) {
            console.log(err2);
          } else {
            connection.end();
            res.render("product", { result: result[0] });
          }
        }
      );
    }
  });
});
router.get("/new", (req, res) => {
  res.render("admin");
});
router.post("/admin", (req, res) => {
  if (req.body.email == "admin" && req.body.password == "admin") {
    req.session.user=1;
    res.render("new");
  }
});
router.post("/new",isAdmin, (req, res) => {
  var values = [
    [
      1,
      req.body.p_name,
      req.body.p_price,
      req.body.p_author,
      req.body.p_photo,
      req.body.p_desc
    ]
  ];
  var queryFields = "cat_id,p_name,p_price,p_author,p_photo,p_desc";
  connection.query(
    "INSERT INTO products(" + queryFields + ") VALUES ?",
    [values],
    function(err, result, fields) {
      if(err) throw err;
      connection.end();
          res.redirect("/");
    }
  );
});

router.get("/search", (req, res) => {
  keyword = req.query.q;
  var n;
  var connection = mysql.createConnection(config);
  connection.query(
    "SELECT * FROM products WHERE(p_name LIKE '%" + keyword + "%')",
    function(err, result, fields) {
      connection.end();
      if(result)
        n=result.length;
      else 
        n=0;
      res.render("home", { result: result, n: n });
    }
  );
});
router.get("/cart",isLoggedIn, (req, res) => {
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      let quantity;
      connection.query(
        "select products.p_id,cat_id, p_name, p_price, p_photo from products,cart,users where users.u_id=cart.u_id and products.p_id=cart.p_id and users.u_id=?",
        [req.session.user.u_id],
        function(error, data, fields) {
          connection.end();
          if (error) throw error;
          res.render("cart", { data: data });
        }
      );
    }
  });
});

router.post("/review/:pid",isLoggedIn, (req, res) => {
  var values = [[[req.session.user.u_id, req.body.review,req.params.pid]]];
  var sql = "Insert into reviews (u_id,review,p_id) values ?";
  // console.log(user);
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      connection.query(sql, values, function(err, result, fields) {
        connection.end();
        if (err) res.send(err);
        else {
          res.redirect("/book/"+req.params.pid);
        }
      });
    }
  });
});
router.get("/remove/:pid",isLoggedIn, (req, res) => {
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      var sql = "delete from cart where p_id= ? and u_id=? LIMIT 1";
      connection.query(sql, [req.params.pid, req.session.user.u_id], function(
        err,
        result,
        fields
      ) {
        connection.end();
        if (err) res.send(err);
        else {
          res.redirect("/cart");
        }
      });
    }
  });
});
router.get("/addtocart/:pid", (req, res) => {
  var values = [[[req.session.user.u_id, req.params.pid]]];
  var sql = "INSERT INTO cart (u_id,p_id) VALUES ?";
  // console.log(user);
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      connection.query(sql, values, function(err, result, fields) {
        connection.end();
        if (err) res.send(err);
        else {
          res.redirect("/cart");
        }
      });
    }
  });
});
router.get("/confirmOrder",isLoggedIn,(req,res)=> {
  var cus_id = req.session.user.u_id;
  var connection = mysql.createConnection(config);
  connection.connect(function(err) {
    if (err) {
      console.log(err);
    } else {
      let sql = "CALL Delete_cart("+cus_id +");";
      connection.query(sql,true,(error, results, fields) => {
        connection.end();
        if (error) {
          return console.error(error.message);
        }
        console.log(results[0]);
        res.redirect("/");
      });
    }
  });

})
router.get("/logout", (req, res) => {
  req.session.user = null;
  req.flash("success","Logged you out!!")
  res.redirect("/");
});
function isLoggedIn(req, res, next) {
  if (req.session.user != null) {
      return next();
  }
  res.redirect("/login");

}
function isAdmin(req, res, next) {
  if (req.session.user == 1) {
      return next();
  }
  res.redirect("/admin");

}


module.exports = router;
