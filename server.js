// Require Express.js
const express = require('express')
const app = express()

const args = require('minimist')(process.argv.slice(2))

args["port"]

const port = args["port"] || process.env.PORT || 5000

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});


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