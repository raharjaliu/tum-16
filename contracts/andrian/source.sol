pragma solidity ^0.4.2;

contract lottery {
  
    address owner;

    string greeting;
    mapping (address => string) realName;
    mapping (string => address) addFromName;
    mapping (address => uint256) participants;
    mapping (uint256 => address) listofParticipants;
    uint256 id = 1;
    uint hashed = 0;
    address winner;
    bool ended = false;
    
    event showAdr (string msg, address a);
    modifier beforeEnded () {if(!ended) _; }
    modifier onlyOwner () {if(msg.sender==owner) _; }
    modifier onlyOwnerAfterEnd () {if(msg.sender==owner && ended) _; }
    
    function initialize() {
      owner = msg.sender;
    }
    
    function addPlayer (string fullname) beforeEnded  {

      if (participants[msg.sender]==0 && addFromName[fullname]==0 && msg.sender!=owner) {
        participants[msg.sender] = id;
        listofParticipants[id] = msg.sender;
        realName[msg.sender] = fullname;
        addFromName[fullname]=msg.sender;
        id++;
        updateHash(msg.sender);
        showAdr("Participant Added: ",msg.sender);
      } else throw;
    }
    
    function updateHash(address a) internal {

      if(now % 2 == 0) {
        hashed = hashed * uint(sha3(a));
        showAdr("Hashed with Adress: ",msg.sender);
      } else {
        hashed = hashed * uint(sha3(now));
        showAdr("Hashed with Time: ",address(now));
      }
    }
    
    function endGame () onlyOwner  {
      ended = true;
    }
      
    function chooseWinner() onlyOwnerAfterEnd {
      winner = listofParticipants[hashed%id+1];
      showAdr(realName[winner],winner);
    }
    function getWinner () {
      return winner;
    }
    function kill () onlyOwner {selfdestruct(owner);}
}
