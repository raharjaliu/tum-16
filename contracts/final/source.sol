pragma solidity ^0.4.2;

contract lottery {

    struct Player {
        string _telephonNumber;
        address _address;
    }

    Player NONE = Player({
        _telephonNumber: '', _address: 0

    });

    address owner;

    Player[] players;
    uint hashed = 0;
    Player winner;
    bool ended = false;


    event Debug1 (string msg, address data);
    event SendWinner (string telephonNumber, address a);

    modifier beforeEnded () {if (!ended) _; }
    modifier onlyOwner () {if (msg.sender == owner) _; }
    modifier onlyOwnerAfterEnd () {if (msg.sender == owner && ended) _; }

    function initialize() {
      owner = msg.sender;
    }

    function addPlayer (string telephonNumber) beforeEnded  {
        Player memory existing = getExisting(msg.sender, telephonNumber);
        if (isNull(existing)) {
            players.push(Player({
                _telephonNumber:telephonNumber,
                _address:msg.sender
            }));
            updateHash(msg.sender);
            Debug1("Participant Added: ", msg.sender);
        } else throw;
    }

    function isNull(Player player) internal returns(bool) {
        if(player._address == NONE._address)
            return true;
        return false;
    }


    function endGame () onlyOwner {
      ended = true;
    }

    function chooseWinner() onlyOwnerAfterEnd {
      winner = players[hashed % players.length];
      SendWinner(winner._telephonNumber, winner._address);
    }

    function getWinner () returns(address) {
      return winner._address;
    }

    function kill () onlyOwner {selfdestruct(owner);}
    
    function reset() onlyOwner{
      ended = false;
      players.length = 0;
      owner = 0;
      winner = NONE;
    }

     function getExisting(address _address, string _telephonNumber) internal returns (Player) {
        for(uint i = 0; i < players.length; i++) {
            Player player = players[i];
            if(player._address == _address || stringsEqual(player._telephonNumber, _telephonNumber))
                return player;
        }
        return NONE;
    }

    function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length)
			return false;
		// @todo unroll this loop
		for (uint i = 0; i < a.length; i ++)
			if (a[i] != b[i])
				return false;
		return true;
	}

    function updateHash(address a) internal {

      if(now % 2 == 0) {
        hashed = hashed * uint(sha3(a));
        Debug1("Hashed with Adress: ",msg.sender);
      } else {
        hashed = hashed * uint(sha3(now));
        Debug1("Hashed with Time: ",address(now));
      }
    }
}
