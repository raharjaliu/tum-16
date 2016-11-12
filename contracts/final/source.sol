pragma solidity ^0.4.2;

contract lottery {

    struct Player {
        string _name;
        address _address;
    }

    Player NONE = Player({
        _name: '', _address: 0

    });

    address owner;

    Player[] players;
    uint hashed = 0;
    Player winner;
    bool ended = false;

    event showAdr (string msg, address a);
    modifier beforeEnded () {if (!ended) _; }
    modifier onlyOwner () {if (msg.sender == owner) _; }
    modifier onlyOwnerAfterEnd () {if (msg.sender == owner && ended) _; }

    function initialize() {
      owner = msg.sender;
    }

    function addPlayer (string fullname) beforeEnded  {
        Player memory existing = getExisting(msg.sender, fullname);
        if (isNull(existing)) {
            players.push(Player({
                _name:fullname,
                _address:msg.sender
            }));
            updateHash(msg.sender);
            showAdr("Participant Added: ", msg.sender);
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
      showAdr(winner._name, winner._address);
    }

    function getWinner () returns(address) {
      return winner._address;
    }

    function kill () onlyOwner {selfdestruct(owner);}

     function getExisting(address _address, string _fullname) internal returns (Player) {
        for(uint i = 0; i < players.length; i++) {
            Player player = players[i];
            if(player._address == _address || stringsEqual(player._name, _fullname))
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
        showAdr("Hashed with Adress: ",msg.sender);
      } else {
        hashed = hashed * uint(sha3(now));
        showAdr("Hashed with Time: ",address(now));
      }
    }
}
