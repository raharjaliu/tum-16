pragma solidity ^ 0.4.2;

contract mortal {
    /* Define variable owner of the type address*/
    address owner;

    /* this function is executed at initialization and sets the owner of the contract */
    function mortal() { owner = msg.sender; }

    /* Function to recover the funds on the contract */
    function kill() { if (msg.sender == owner) selfdestruct(owner); }
}

contract TheWinnerTakesItAll is mortal {

    address[] public participants;
    address public winner; 
    
    uint public hashed = 1;
    bool public gameClosed = false;
    
    uint public pNum;
    
    event AddedAddressMessage(address changer, string message);

    event WinnerDeterminedMessage(address winner, string message);
    
    /*
     * Init
     */
    function TheWinnerTakesItAll(uint _pNum) {
        pNum =_pNum;
    }

    /*
     * Check whether an address already existed
     */
    function addressExsist(address a) returns(bool) {
        for(uint i = 0; i < participants.length; i++) {
            if(participants[i] == a) {
                return true;
            }
        }
        return false;
    }
    
    /*
     * Get complete list of participants
     */
    function getParticipants() returns (address[]) {
        return participants;
    }
    
    /*
     * Add new address
     */
    function addAddress(address a) public {
        if (participants.length < pNum) {
            if(now % 2 == 0) {
                if(!addressExsist(a)) {
                    hashed = hashed * uint(sha3(a));
                    participants.push(a);
                    AddedAddressMessage(a, "new address, hashed address");
                } else {
                    AddedAddressMessage(a, "address exists, nothing added");
                }
            } else {
                if(!addressExsist(a)) {
                    hashed = hashed * uint(sha3(now));
                    participants.push(a);
                    AddedAddressMessage(a, "new address, hashed timestamp");
                    AddedAddressMessage(a, "new address");
                } else {
                    AddedAddressMessage(a, "address exists, nothing added");
                }
            }
        } else {
            throw;
        }
    }
    
    /* 
     * Get winner
     */
    
    function getWinner() returns (address) {
        if ((participants.length < pNum) && (!gameClosed)) {
            throw;
        } else {
            winner = participants[hashed % pNum];
            gameClosed = true;
            WinnerDeterminedMessage(winner, "Finally we've got a winner!");
            return winner;
        }
    }
}