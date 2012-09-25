New version of MC Chunk Loader.  Server.coffee is for Node.js.  I tested on Node.js 0.8.9
./run requires CoffeeScript (npm install coffee-script).  However, almost all of the code is client-side.  

You can take the JavaScript and html files from public/ and serve them with any web server, doesn't have to be Node/Express as I am doing with server.coffee.  Just note that to serve an .mca file from a different server you will need to enable CORS (http://enable-cors.org/) on that server.

Startup is in public/scripts/tests.coffee if you want to figure out how it works.

