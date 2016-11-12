var fs = require('fs');
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var Web3 = require('./node_modules/web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var coinbase = web3.eth.coinbase;

// console.log(new Buffer("xoxb-103763892755-81Qf8fOQ5tFD6YOHaDt5J5f1").toString('base64'));
var bot_token = process.env.SLACK_BOT_TOKEN || "xoxb-103158368448-iuqB2zji8VR5TGEs0UWi0o4X";
var bot_name = 'fancypants';

var slack = new RtmClient(bot_token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true
});

var me = null;
var currentLottery = null;

var accountSid = 'SKfad8a61beb60a92f0993267f0921c4b2';
var authToken = 'YKq7ukK3P0eDyipzY6UaEaAR6EUE2lqK';
var accountRealSid = 'ACb44609cbe49e73fe7beefab010c29c3e';
var telNumberTo = "+4917643424166";
var telNumberFrom = "+4915735994166";
var client = require('twilio')(accountSid, authToken);

var filePath = './files/';
var binary_file = 'lottery_binary.txt';
var definition_file = 'lottery_definition.json';
var definition_JSON = JSON.parse(fs.readFileSync(filePath + definition_file, 'utf8'));
var definition_string = JSON.stringify(definition_JSON);
var definition = fs.readFileSync(filePath + binary_file, 'utf8').trim();

var Lottery = web3.eth.contract(definition_JSON);
currentLottery = Lottery.at(definition);

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the 'rtm.start' payload if you want to cache it
slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log('Logged in, but not yet connected to a channel');
  for (var user_id in slack.dataStore.users) {
    var user = slack.dataStore.users[user_id];
    if (user.name === bot_name) {
      me = user;
      break;
    }
  }
});

slack.start();

var printLottery = function (channel) {
  slack.sendMessage('there is a lottery running on ' + currentLottery.address, channel.id);
  slack.sendMessage('here is definition:', channel.id);
  slack.sendMessage(definition_string, channel.id);
  console.log(currentLottery);
}

var printHelp = function(channel) {
  slack.sendMessage('This is an automated Lottery Bot utilizing the ethereum blockchain and smart contracts', channel.id);
  slack.sendMessage('It accepts the following commands: ',channel.id);
  slack.sendMessage('balance: - returns your account balance',channel.id);
  slack.sendMessage('running: - returns if a lottery is currently running',channel.id);
  slack.sendMessage('join: - lets you join the active lottery',channel.id);
}

var processAction = function (message) {
  var channel = slack.dataStore.getChannelGroupOrDMById(message.channel);
  if (message.text.indexOf('init') >= 0) {
    slack.sendMessage('Initializing game', channel.id);
    console.log('Initializing game');
    currentLottery.initiallize.sendTransaction({from: web3.eth.accounts[0]});
  } else if (message.text.indexOf('lottery') >= 0 && message.text.indexOf('running') >= 0) {
    slack.sendMessage('Hello <@'+ message.user +'>!', channel.id);
    if (currentLottery === null) {
      slack.sendMessage('there is no lottery running', channel.id);
    } else {
      printLottery(channel);
    }
  } else if (message.text.indexOf('balance') >= 0) {
    var balance = web3.eth.getBalance(coinbase);
    slack.sendMessage('Hello <@'+ message.user +'>, your balance is ' + balance.toString(10), channel.id);
  } else if (message.text.indexOf('join') >= 0) {
    web3.personal.unlockAccount(web3.eth.accounts[0], '61407843');
    console.log(currentLottery);
    console.log(web3.eth.accounts[0]);
    var telephone_number = message.text.split(" ") [2];
    currentLottery.addPlayer.sendTransaction(telephone_number, {from: web3.eth.accounts[0]});
    slack.sendMessage('<@'+ message.user +'>, your are now added to lottery', channel.id);
  } else if(message.text.indexOf('help') >= 0) {
	   printHelp(channel);
  } else if (message.text.indexOf('notify') >= 0) {
    client.accounts(accountRealSid).messages.create({
        to: telNumberTo,
        from: telNumberFrom,
        body: 'message',
    }, function(err, message) {
        console.log(message.sid);
    });
  }
}

slack.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (me !== null) {
    if (message.text && message.text.indexOf(me.id) >= 0) {
      processAction(message);
    }
  }
  if (message.subtype && message.subtype == "channel_join") {
      slack.sendMessage('<@'+ message.user +'>, please execute the "@fancypants join (telephone number)" ', message.channel);
  }
  console.log('Message:', message);
});
