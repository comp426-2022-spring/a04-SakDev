// Require Express.js
const express = require('express')
const app = express()

const args = require('minimist')(process.argv.slice(2))

args["port", "debug", "log", "help"]
console.log(args)

const port = args.port || process.env.PORT || 5555
const debug = args.debug || false
const log = args.log || true
const help = args.help

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

const db = require("./database.js");
const fs = require('fs');
const morgan = require('morgan');
app.use(express.urlencoded({ extended: true}));
app.use(express.json())

const help_msg = (`
server.js [options]
--por		Set the port number for the server to listen on. Must be an integer
              between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
              a JSON access log from the database and /app/error which throws 
              an error with the message "Error test successful." Defaults to 
  false.
--log		If set to false, no log files are written. Defaults to true.
  Logs are always written to database.
--help	Return this message and exit.
`);

if (args.help || args.h) {
    console.log(help_msg)
    process.exit(0)
}

if (args.log == true) {
    const accesslog = fs.createWriteStream('access.log', { flags: 'a' })
    app.use(morgan('combined', {stream: accesslog}))
} 
// else {
//     console.log("No written log.")
// }

if (args.debug) {
    app.get('/app/log/access', (req, res) => {
        const statement = db.prepare('SELECT * FROM accesslog').all();
        res.status(200).json(statement)
        //res.writeHead(res.statusCode, {"Content-Type" : "text/json"});
    })

    app.get('/app/error', (req, res) => {
        throw new Error('error test successful.')
    })
}

app.use((req, res, next) => {
    let logData = {
            remoteaddr: req.ip,
            remoteuser: req.user,
            time: Date.now(),
            method: req.method,
            url: req.url,
            protocol: req.protocol,
            httpversion: req.httpVersion,
            status: res.statusCode,
            referer: req.headers['referer'],
            useragent: req.headers['user-agent']
        }
        console.log(logData)
        const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        const info = stmt.run(logData.remoteaddr, logData.remoteuser, logData.time, logData.method, logData.url, logData.protocol, logData.httpversion, logData.status, logData.referer, logData.useragent)
        next()
    })

function coinFlip() {
    return (Math.random() < 0.5 ? 'tails' : 'heads');
}

function coinFlips(flips) {
    var flips_arr = [];
  
    if (flips<=0 || typeof flips=="undefined") {
      flips=1;
    } 
  
    for (let i=0;i<flips;i++){
      flips_arr.push(coinFlip());
    }
  
    return flips_arr
}

function countFlips(array) {
    var head_count=0;
    var tail_count=0;
  
    for (let i=0;i<array.length;i++){
      if (array[i]=='heads'){
        head_count++;
      }
      else{
        tail_count++;
      }
    }
   
    if (head_count > 0 && tail_count == 0) {
      return { "heads": head_count}
    } 
    else if (tail_count > 0 && head_count == 0) {
      return { "tails": tail_count}
    } 
    else {
      return { "heads": head_count, "tails": tail_count} 
    }
  }

  function flipACoin(call) {
    var flip=coinFlip();
    var result='lose'
  
    if (flip==call){
      result='win'
    }
      
    return { 'call': call, 'flip': flip, 'result': result };  
}


app.get('/app/flip/', (req, res) => {
    res.status(200);
    const result = {"flip" : coinFlip()};
    res.json(result);
});

app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
});
   
app.get('/app/flips/:number/', (req, res) => {
    res.status(200);
    const flips = req.params.number || 1;
    const vals = coinFlips(flips);
    const rawjson = {
        "raw" : vals,
        "summary": countFlips(vals)
    };
    res.json(rawjson)
});

app.get('/app/flip/call/heads/', (req, res) => {
    res.status(200);
    res.json(flipACoin('heads'));
});

app.get('/app/flip/call/tails/', (req, res) => {
    res.status(200);
    res.json(flipACoin('tails'));
});




// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});