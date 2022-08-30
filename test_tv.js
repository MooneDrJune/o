function include(file) {

    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    script.defer = true;

    document.getElementsByTagName('head')
        .item(0)
        .appendChild(script);

}

/* Include Many js files */
include('tv.min.js');
// include('https://raw.githubusercontent.com/MooneDrJune/o/dist/tv.min.js');
// include('https://media.geeksforgeeks.org/wp-content/uploads/20190704162640/second.js');

// const TradingView = require('@mathieuc/tradingview');
// const TradingView = require('../main');

/*
  This example tests an indicator that sends
  graphic data such as 'lines', 'labels',
  'boxes', 'tables', 'polygons', etc...
*/

const client = new TradingView.Client();

const chart = new client.Session.Chart();
chart.setMarket('NSE:RELIANCE', {
    timeframe: '1',
    range: 10000,
});

// TradingView.getIndicator('USER;01efac32df544348810bc843a7515f36').then((indic) => {
// TradingView.getIndicator('PUB;5xi4DbWeuIQrU0Fx6ZKiI2odDvIW9q2j').then((indic) => {


TV.getIndicator('STD;Pivot%1Points%1Standard')
    .then((indic) => {
        indic.setOption("in_0", "Camarilla");
        indic.setOption("in_1", "Daily");
        indic.setOption("in_2", 15);
        indic.setOption("in_7", 1);
        const STD = new chart.Study(indic);

        STD.onError((...err) => {
            console.log('Study error:', ...err);
        });

        STD.onReady(() => {
            console.log(`STD '${STD.instance.description}' Loaded !`);
        });

        STD.onUpdate(() => {
            console.log('Graphic data:', JSON.stringify(STD.graphic));
            // console.log('Graphic data:', require('util')
            //     .inspect(STD.graphic, true, 10));
            // console.log('Tables:', changes, STD.graphic.tables);
            // console.log('Cells', STD.graphic.tables[0].cells());
            client.end();
        });
    });
