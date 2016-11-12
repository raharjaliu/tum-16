var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var Web3 = require('./node_modules/web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var coinbase = web3.eth.coinbase;

var bot_token = process.env.SLACK_BOT_TOKEN || 'xoxb-104489032486-ra7lArT3c8MQHvLB1JuF0HWq';

var slack = new RtmClient(bot_token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true
});

var me = null;
var currentLottery = null;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
  for (var user_id in slack.dataStore.users) {
    var user = slack.dataStore.users[user_id];
    if (user.name === 'slottery') {
      me = user;
      console.log(me);
      break;
    }
  }
});

slack.start();

var channel = "#general";

var processAction = function (message) {
  var channel = slack.dataStore.getChannelGroupOrDMById(message.channel);
  if (message.text.indexOf('lottery') >= 0 && message.text.indexOf('running') >= 0) {
      slack.sendMessage(`Hello <@${message.user}>!`, channel.id);
      if (currentLottery === null) {
        slack.sendMessage(`there is no lottery running`, channel.id);
      } else {
        slack.sendMessage(`there is a lottery running`, channel.id);
      }
  } else if (message.text.indexOf('balance') >= 0) {
      slack.sendMessage(`Hello <@${message.user}>!`, channel.id);
      var balance = web3.eth.getBalance(coinbase);
      slack.sendMessage(`your balance is ${balance.toString(10)}`, channel.id);
  } 
}

slack.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (me !== null) {
    if (message.text.indexOf(me.id) >= 0) {
      processAction(message);
    }
  }
  console.log('Message:', message);
});
