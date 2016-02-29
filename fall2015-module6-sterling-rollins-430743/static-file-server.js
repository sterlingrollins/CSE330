var http = require('http'),
        url = require('url'),
        path = require('path'),
        mime = require('mime'),
        path = require('path'),
        fs = require('fs');


var app = http.createServer(function(req, resp){
        var filename = path.join(__dirname, "static_directory", url.parse(req.url).pathname);
        (fs.exists || path.exists)(filename, function(exists){
                if (exists) {
                        fs.readFile(filename, function(err, data){
                                if (err) {
                        resp.writeHead(500, {
                                                "Content-Type": "text/plain"
                                        });
                                        resp.write("Internal server error: could not read file");
                                        resp.end();
                                        return;
                                }
var mimetype = mime.lookup(filename);
                                resp.writeHead(200, {
                                        "Content-Type": mimetype
                                });
                                resp.write(data);
                                resp.end();
                                return;
                        });
                }else{

resp.writeHead(404, {
                                "Content-Type": "text/plain"
                        });
                        resp.write("Requested file not found: "+filename);
                        resp.end();
                        return;
                }
        });
});
app.listen(3456);