pragma solidity ^0.4.2;

contract lottery {

    struct Player {
        string _telephonNumber;
    }

    Player NONE = Player({
        _telephonNumber: ''

    });

    address owner;

    Player[] public players;
    uint public hashed = 1;
    string public winnerNummer;
    bool public ended = false;


    event Debug1 (string msg, address data);
    event Debug2 (string msg, uint data);
    event SendWinner (string telephonNumber);

    modifier beforeEnded () {if (!ended) _; else throw;}
    modifier onlyOwner () {if (msg.sender == owner) _; else throw;}

    function initialize() {
      owner = msg.sender;
    }

    function addPlayer (string telephonNumber) public beforeEnded  {
        Player memory existing = getExisting(msg.sender, telephonNumber);
        if (isNull(existing)) {
            players.push(Player({
                _telephonNumber:telephonNumber
            }));
            updateHash(msg.sender);
            Debug2("Hash changed new is:: ", hashed);
            Debug1("Participant Added: ", msg.sender);
        } else throw;
    }

    function isNull(Player p) internal returns(bool) {
        bytes memory b = bytes(p._telephonNumber);
        if(b.length > 1)
            return false;

        return true;
    }


    function chooseWinner() public onlyOwner {
      ended = true;
      Player winner = players[hashed % players.length];
      winnerNummer = winner._telephonNumber;
      SendWinner(winner._telephonNumber);
    }

    function getWinner () public returns(string add) {
      return winnerNummer;
    }

    function kill () public onlyOwner {selfdestruct(owner);}

    function reset() public onlyOwner {
      ended = false;
      delete players;
      owner = 0;
      winnerNummer = '';
    }

     function getExisting(address _address, string _telephonNumber) internal returns (Player) {
        for(uint i = 0; i < players.length; i++) {
            Player player = players[i];
            if(stringsEqual(player._telephonNumber, _telephonNumber))
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
        Debug1("Hashed with Address: ", msg.sender);
      } else {
        hashed = hashed * uint(sha3(now));
        Debug1("Hashed with Time: ", address(now));
      }
    }
}
