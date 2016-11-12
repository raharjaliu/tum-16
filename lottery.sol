pragma solidity ^0.4.2;

contract lottery {
  
    address owner;
    
    
    string greeting;
    mapping (address => string) realName;
    mapping (string => address) addFromName;
    mapping (address => uint256) participants;
    mapping (uint256 => address) listofParticipants;
    uint256 id = 0;
    address winner;
    bool ended = false;
    
    event showAdr (string msg, address a);
    //event showString (string a);
    modifier beforeEnded () {if(!ended) _; }
    modifier onlyOwner () {if(msg.sender==owner) _; }
    modifier onlyOwnerAfterEnd () {if(msg.sender==owner && ended) _; }
    
  
    function endGame () onlyOwner  {
      ended = true;
      //chooseWinner();
      //kill();
    }
    
    function addPlayer (string fullname) beforeEnded  {
      uint256 exists = participants[msg.sender];
      if ((id==0 || exists==0 && id>0 && listofParticipants[0]!=msg.sender) && addFromName[fullname]==0) {
        participants[msg.sender] = id;
        listofParticipants[id] = msg.sender;
        realName[msg.sender] = fullname;
        addFromName[fullname]=msg.sender;
        id++;
        showAdr("Participant Added: ",msg.sender);
      } else throw;
    }
    
    function randomFrom (uint256 range) internal returns (uint256){
      
      uint256 result = 0;
      result = uint256(sha3(block.blockhash(block.number-1)))%range;
      return result;
    
    }
    
    function chooseWinner() onlyOwnerAfterEnd {
      winner = listofParticipants[randomFrom(id)];
      showAdr(realName[winner],winner);
    }
    function kill () onlyOwner {selfdestruct(owner);}
}
