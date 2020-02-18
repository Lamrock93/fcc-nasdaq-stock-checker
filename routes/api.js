'use strict';

var stockHandler = require('../controllers/stockHandler.js')

module.exports = function (app) {
  
  // Allows the correct IP address to be viewed
  app.enable('trust proxy')

  // stockHandler is a constructor
  var stonks = new stockHandler();
  
  app.route('/api/stock-prices')
  
    .get(function (req, res){
      var stockCode = req.query.stock; // stockCode is either a string, or an array of two strings
      var ip = req.ip; // IP address used to ensure likes from only unique users
      var like = req.query.like || false;
      let stockData = [];
      
      // Callback function for request
      function returnData(finished, data) {
        if (finished == 'stockData') {
          stockData.push(data); // Once request is fulfilled, the data for that stock code is added to the stockData array
        }
        if (!Array.isArray(stockCode)) {
  // USER STORY #2: I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData.
          res.json({stockData: stockData[0]})
        } else {
  // USER STORY #5: Can pass two stocks, get stock's info but instead of likes, it will display rel_likes
          if (stockData.length == 2) { // Wait until both stock requests have been fulfilled
            stockData[0].rel_likes = stockData[0].likes - stockData[1].likes
            stockData[1].rel_likes = stockData[1].likes - stockData[0].likes
            delete stockData[0].likes; // rel_likes replace likes in these objects
            delete stockData[1].likes;
            res.json({stockData: stockData}) // returns an array
          }
        }
      }
    
      // will run the stockHandler once or twice depending if stockCode is one string, or an array of two
      if (!Array.isArray(stockCode)) {
        stonks.getData(stockCode, returnData, like, ip);
      } else {
        stonks.getData(stockCode[0], returnData, like, ip);
        stonks.getData(stockCode[1], returnData, like, ip);
      }
  
    });
    
};