'use strict';

const express = require('express');

const apiHelper = require('./apiHelper.js');

module.exports = (io) => {
  let apiRouter = express.Router();
  
  // io events
  let symbolList = {
    'ABAX': null,
    'MSFT': null,
    'ABCB': null
  };
  io.on('connection', (socket) => {
    let p = Math.floor(1000*Math.random());
    console.log('user connected: ' + p);
    socket.on('addCompanyClient', (symbol) => {
      console.log('addCompanyClient: ');
      console.log(symbol);
      io.emit('addCompanyServer', symbol.toUpperCase());  //we should validate it first
    });
    socket.on('removeCompanyClient', (symbol) => {
      console.log('removeCompanyClient: ');
      console.log(symbol);
      io.emit('removeCompanyServer', symbol.toUpperCase());  //we should validate it first
    });
    socket.on('disconnect', () => {
      console.log('user disconnected: ' + p);
    });
  });

  // expects query parameters (case sensitive) of:
  //  Symbol - symbol of company to query
  //  EndOffsetDays - number of days to look backwards (for the last day in our range)
  //  NumberOfDays - how many days are in our range
  apiRouter.get('/companyData', (req, res) => {
    if (!req.query.Symbol) { res.json({ error: 'no symbol given'}); }
    // build external API url based on internal query parameters
    let baseApiUrl = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=";
    let requestParams = JSON.stringify({
      Normalized: false,
      EndOffsetDays: req.query.EndOffsetDays || 0,
      NumberOfDays: req.query.NumberOfDays || 90,
      DataPeriod: "Day",
      Elements: [
        {
          Symbol: req.query.Symbol,
          Type: "price",
          Params: ["c"]
        }
      ]
    });
    apiHelper.get(baseApiUrl + encodeURIComponent(requestParams), (err, data) => {
      if (err) throw err;
      res.json(JSON.parse(data));
      res.end();
    });
  });
  apiRouter.get('/allSymbols', (req, res) => {
    res.json(symbolList);
  });

  apiRouter.get('/tester', (req, res) => {
    res.send('success' + req.query.paa);
  });
  apiRouter.get('/addCompanyClient/:symbol', (req, res) => {
    io.emit('addCompanyClient', req.params.symbol);
    console.log('adding ' + req.params.symbol);
    res.send('event emitted ' + Math.floor(1000*Math.random()));
  });
  apiRouter.get('/removeCompanyClient/:symbol', (req, res) => {
    io.emit('removeCompanyClient', req.params.symbol);
    console.log('removing ' + req.params.symbol);
    res.send('event emitted ' + Math.floor(1000*Math.random()));
  });
  apiRouter.get('/addCompanyServer/:symbol', (req, res) => {
    io.emit('addCompanyServer', req.params.symbol);
    console.log('adding ' + req.params.symbol);
    res.send('event emitted ' + Math.floor(1000*Math.random()));
  });
  apiRouter.get('/removeCompanyServer/:symbol', (req, res) => {
    io.emit('removeCompanyServer', req.params.symbol);
    console.log('removing ' + req.params.symbol);
    res.send('event emitted ' + Math.floor(1000*Math.random()));
  });

  return apiRouter;
};
