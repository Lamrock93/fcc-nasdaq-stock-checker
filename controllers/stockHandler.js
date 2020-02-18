// The stock handler is done via this file separate from the API, so as to resolve an error with the unit test, and to keep api.js to a reasonable length I suppose

var request = require('request');
var MongoClient = require('mongodb');

function stockHandler () {
    
  this.getData = function(stockCode, returnData, like, ipAddress) {
    
    let numLikes;
    
    // This function uses the request method to get the matching stock from the URL
    function getReq(stonk) {
      
    // USER STORY #6: A good way to receive current price is to use an external API (replacing 'GOOG' with your stock)
        request(`https://repeated-alpaca.glitch.me/v1/stock/${stonk}/quote`, (err, res, body) => {
          if (err) {
            res.send(err)
            console.log("ERROR: Stock code not found")
          } else {
            var data = JSON.parse(body)
                    
    // USER STORY #3: In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int).
            returnData( 'stockData', {stock: data.symbol, price: data.latestPrice.toString(), likes: numLikes} )}
          
        })
    }
    
    // Connect to MongoDB for the likes handler
    MongoClient.connect(process.env.DB, {useUnifiedTopology : true}, (err, client) => {
      var db = client.db('test')
    
    // USER STORY #4: I can also pass along field like as true(boolean) to have my like added to the stock(s). Only 1 like per ip should be accepted.
      if (like) {          
        
        db.collection('stock-likes').findOneAndUpdate({ stock: stockCode }, {$push: {user: ipAddress}}, {upsert: true})
          .catch(err)
          .then( (docs) => {
            if (docs) {
              var uniqueVisitors = [...new Set(docs.value.user)] // this ensures no repeat IP's.. the DB may get a bit cluttered with repeats but that's OK
              numLikes = uniqueVisitors.length
            } else {
              console.log("ERROR: Failed to receive likes")
            }
          
            getReq(stockCode); // call this function now that we have the likes
          })
        
      } else {
        
        // almost the same code, except it doesn't append an IP address
        db.collection('stock-likes').findOne({ stock: stockCode }, {upsert: true})
          .catch(err)
          .then( (docs) => {
            if (docs) {
              var uniqueVisitors = [...new Set(docs.user)]
              numLikes = uniqueVisitors.length;
            } else {
              console.log("ERROR: Failed to receive likes")
            }
          
            getReq(stockCode);
          }) 
      }
    }) 
  }
}

module.exports = stockHandler