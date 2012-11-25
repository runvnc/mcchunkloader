(function() {
  var app, express;

  express = require('express');

  app = express();

  app.configure(function() {
    app.set('views', __dirname);
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/views'));
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.get("/*", function(req, res, next) {
    var page;
    page = req.url.substr(1);
    if (page.indexOf("?") > 0) page = page.substr(0, page.indexOf("?"));
    if (page === "") page = "index";
    return res.render("views/" + page, {
      page: page,
      title: "Cure Desktop",
      email: "",
      password: "",
      existing: "",
      machine: "",
      ccnum: "",
      ccexp: ""
    });
  });

  app.listen(80);

  console.log("Express server listening on port 3000");

}).call(this);
