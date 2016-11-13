pragma solidity ^0.4.2;

contract lottery {

    address owner;

    string[] public players;
    uint public hashed = 1;
    string public winnerNummer;
    bool public ended = false;


    event Debug1 (string msg, string data);
    event Debug2 (string msg, uint data);
    event SendWinner (string telephonNumber);

    modifier beforeEnded () {if (!ended) _; else throw;}
    modifier onlyOwner () {if (msg.sender == owner) _; else throw;}

    function initialize() {
      owner = msg.sender;
    }

    function addPlayer (string telephonNumber) public beforeEnded  {
        if (!exists(telephonNumber)) {
            players.push(telephonNumber);
            updateHash(msg.sender);
            Debug2("Hash changed new is:: ", hashed);
            Debug1("Participant Added: ", telephonNumber);
        } else throw;
    }


    function chooseWinner() public onlyOwner {
      ended = true;
      winnerNummer = players[hashed % players.length];
      SendWinner(winnerNummer);
    }

    function getWinner () public returns(string add) {
      return winnerNummer;
    }

    function kill () public onlyOwner {selfdestruct(owner);}

    function reset() public onlyOwner {
      ended = false;
      players.length = 0;
      delete players;
      owner = 0;
      winnerNummer = '';
    }

     function exists(string _telephonNumber) internal returns (bool) {
        for(uint i = 0; i < players.length; i++) {
            string player = players[i];
            if(stringsEqual(player, _telephonNumber))
                return true;
        }
        return false;
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
      } else {
        hashed = hashed * uint(sha3(now));
      }
    }
}
