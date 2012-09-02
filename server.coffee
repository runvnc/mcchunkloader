express = require 'express'
app = express()

app.configure ->
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static __dirname + '/public'
  app.use express.errorHandler { dumpExceptions: true, showStack: true }

app.get '/', (req, res) ->
  res.render 'index.html'

app.listen 3000
console.log "Express server listening on port 3000"


