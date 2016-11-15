//access filesystem
var fs = require('fs');
//define slackclient
var RtmClient = require('@slack/client').RtmClient;
//reading functions from slack
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
//
var MemoryDataStore = require('@slack/client').MemoryDataStore;
//access to ethereum library & instantiation
var Web3 = require('./node_modules/web3');
var web3 = new Web3();
//set provider for ethereum     ???
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var passphrase = "61407843";
//wallet
var coinbase = web3.eth.coinbase;
//encoding obsolete
// console.log(new Buffer("xoxb-103763892755-81Qf8fOQ5tFD6YOHaDt5J5f1").toString('base64'));
//instantiation of bot
var bot_token = process.env.SLACK_BOT_TOKEN || "xoxb-103158368448-iuqB2zji8VR5TGEs0UWi0o4X";
//bot name
var bot_name = 'fancypants';
//initialize slack
var slack = new RtmClient(bot_token, {
  logLevel: 'error',
//initialize Datastore ???
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true
});
//Global Variables
var me = null;
var currentLottery = null;
//playerNum of participants
var roomPlayers = {};

//twilio variables
var accountSid = '';
var authToken = '';
var accountRealSid = '';
var telNumberTo = "";
var telNumberFrom = "";
var client = require('twilio')(accountSid, authToken);

var filePath = './files/';
var binary_file = 'lottery_binary.txt';
var definition_file = 'lottery_definition.json';
var definition_JSON = JSON.parse(fs.readFileSync(filePath + definition_file, 'utf8'));
var definition_string = JSON.stringify(definition_JSON);
var definition = fs.readFileSync(filePath + binary_file, 'utf8').trim();

var Lottery = web3.eth.contract(definition_JSON);
currentLottery = Lottery.at(definition);
var chooseResult = null;
var theWinner = null;

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
  slack.sendMessage('join (<number>): - lets you join the active lottery with the given telephone number',channel.id);
  slack.sendMessage('end game - ends the current game ',channel.id);
  slack.sendMessage('notify - sends a SMS to the winner',channel.id);
}

var endGame = function (channel) {
  slack.sendMessage('All players are now registered. Starting game...', channel.id);
  web3.personal.unlockAccount(web3.eth.accounts[0], passphrase);
  console.log('choose winner call')
  if (chooseResult === null) {
    chooseResult = currentLottery.chooseWinner.sendTransaction({from: web3.eth.accounts[0]}, function(err,result) {
      theWinner = JSON.stringify(result);
      console.log('chooseWinner ['+JSON.stringify(err)+'] [' +JSON.stringify(result)+ ']');
      console.log('should we notify the winner?');
    });
  }
  console.log(JSON.stringify(chooseResult));
  setTimeout(function() {
    slack.sendMessage('Winner is ['+ currentLottery.getWinner.call() +']', channel.id);
    roomPlayers[channel.id] = 0;
  }, 30000);
}

var processAction = function (message) {
  var channel = slack.dataStore.getChannelGroupOrDMById(message.channel);
  if (!roomPlayers[channel.id]) roomPlayers[channel.id] = 0;

  if (message.text.indexOf('init') >= 0) {
    slack.sendMessage('Initializing game', channel.id);
    console.log('Initializing game');
    web3.personal.unlockAccount(web3.eth.accounts[0], passphrase);
    currentLottery.initialize.sendTransaction({from:web3.eth.accounts[0], gas: 1000000});
    chooseResult = null;
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
  } else if ((message.text.indexOf('join') >= 0) && (message.text.split(" ").length == 3)) {
    web3.personal.unlockAccount(web3.eth.accounts[0], passphrase);
    var telephone_number = message.text.split(" ") [2];
    var addResult = currentLottery.addPlayer.sendTransaction(telephone_number, {from: web3.eth.accounts[0]});
    console.log(addResult);
    slack.sendMessage('<@'+ message.user +'>, your are now added to lottery', channel.id);
    roomPlayers[channel.id] = roomPlayers[channel.id] + 1;
    console.log('playerNum is [' + roomPlayers[channel.id] +']');
    var threshold = channel.members.length - 1;
    console.log('threshold [' + threshold + ']');
    if (roomPlayers[channel.id] === threshold) {
      endGame(channel);
    }
  } else if (message.text.indexOf("end game") >= 0) {
    endGame(channel);
  } else if(message.text.indexOf('help') >= 0) {
	   printHelp(channel);
  } else if (message.text.indexOf('notify') >= 0) {
    client.calls.create({
      url: "https://handler.twilio.com/twiml/EH50cc57c16f97c4dba1acc1c3af741b77",
      to: theWinner,
      from: ""
    }, function(err, call) {
      process.stdout.write(call.sid);
    });
  }
  web3.eth.getBlock("pending", true).transactions;
}

slack.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (me !== null) {
    if ((message.text) && (message.text.indexOf(me.id) >= 0)) {
      console.log("Incoming message");
      processAction(message);
    }
  }
  if (message.subtype && message.subtype == "channel_join") {
      slack.sendMessage('<@'+ message.user +'>, please execute the "@fancypants join (telephone number)" ', message.channel);
  }
  console.log('Message:', message);
});
