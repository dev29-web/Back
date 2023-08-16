// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract Axe is AxelarExecutable {
    //========Events========
    event EventAdded(string name, address owner, string chainName);
    event EventEdited(address owner, uint256 Event);
    event EventDeleted(address owner, uint256 Event);
    //Sponsor Event
    event SponsorAdded(string name, address sponsor, uint256 amount);
    //Staffs Events
    event StaffAdded(address owner, uint256 limit);
    event StaffEdited(address owner, address staff);
    event StaffDeleted(address owner, uint256 staff);
    //Payment
    event PaymentSuccessful(address sender, uint256 amount);

    uint256 private totalIncome;
    uint256 private totalExpense;
    string public chainName;

    IAxelarGasService immutable gasService;
    IERC20 immutable Token;

    constructor(
        address gateway_,
        address gasService_,
        string memory chainName_,
        address token_
    ) AxelarExecutable(gateway_) {
        gasService = IAxelarGasService(gasService_);
        chainName = chainName_;
        //Token aUSDC
        Token = IERC20(token_);
    }

    //=======Structs and Mappings=======
    //Event
    struct Event {
        uint256 uid;
        string name;
        address owner;
        string chainName;
        //Native
        uint256 balance;
        uint256 expense;
        //For Token
        uint256 tokBalance;
        uint256 tokExpense;
        EventStaff[] staffs;
        EventSponsor[] sponsors;
        StaffExpense[] expenses;
    }
    //Event Staff
    struct EventStaff {
        string name;
        address staff;
        uint256 limit;
        uint256 expense;
    }
    //Staff Expense
    struct StaffExpense {
        string name;
        uint256 amount;
        address to;
        address from;
        bool token;
    }
    //Event Sponsors
    struct EventSponsor {
        string name;
        address sponsor;
        uint256 amount;
        bool token;
    }

    //=======Checker=======
    function _check_event_owner(uint256 eventId, address owner_) internal view {
        require(eventId < id, "Event does not exist");
        require(msg.sender == owner_, "Sorry, you are not the owner");
    }

    function _check_staff(uint256 eventId, uint256 staffId)
        internal
        view
        returns (EventStaff memory)
    {
        // Check Staff is valid
        require(
            staffId < Events[eventId].staffs.length,
            "Sorry, not a staff here"
        );
        require(
            Events[eventId].staffs[staffId].staff == msg.sender ||
                Events[eventId].owner == msg.sender,
            "Sorry no staff here"
        );

        return (Events[eventId].staffs[staffId]);
    }

    //=======Variables=======
    mapping(uint256 => Event) public Events;
    //UID for Events
    uint256 internal id = 0;
    uint256 immutable minimumGasPerEvent = 3000000;

    //=======Functions=======
    //POST Methods (Addition)
    function addEvent(string calldata name_, EventStaff[] memory staffs_)
        public
    {
        Events[id].uid = id;
        Events[id].name = name_;
        Events[id].owner = address(msg.sender);
        Events[id].balance = 0;
        Events[id].expense = 0;
        Events[id].chainName = chainName;

        if (staffs_.length > 0) {
            // StaffExpense[] memory initialExpenses = new StaffExpense[](0);
            for (uint256 i = 0; i < staffs_.length; i++) {
                Events[id].staffs.push(
                    EventStaff(
                        staffs_[i].name,
                        staffs_[i].staff,
                        staffs_[i].limit,
                        0
                    )
                );
            }
        }

        emit EventAdded(name_, msg.sender, chainName);
        //UID incrementation
        id++;
    }

    function addStaff(uint256 eventId, EventStaff[] memory staffs_) public {
        _check_event_owner(eventId, Events[eventId].owner);

        require(staffs_.length > 0, "There is no staffs to add");
        require(
            Events[eventId].staffs.length + staffs_.length < 5,
            "Sorry you can't add more than 5 members"
        );

        for (uint256 i = 0; i < staffs_.length; i++) {
            Events[eventId].staffs.push(
                EventStaff(
                    staffs_[i].name,
                    staffs_[i].staff,
                    staffs_[i].limit,
                    0
                )
            );
        }
    }

    //Receiving contribution from sponsors
    //-----Usual native
    function addSponsor_Pay(uint256 eventId, string calldata name)
        public
        payable
    {
        require(eventId < id, "Event is not exist");
        require(msg.value > 0, "Need eth to sponsor");

        Events[eventId].sponsors.push(
            EventSponsor(name, msg.sender, msg.value, false)
        );
        totalIncome += msg.value;
        Events[eventId].balance += msg.value;

        emit SponsorAdded(name, msg.sender, msg.value);
    }

    //----Token Swap
    //-----Gmp Token
    //------Sender
    function addSponsor_GmpToken(
        uint256 eventId,
        string calldata name,
        uint256 amount,
        string calldata destinationAddress_,
        string calldata destinationChain_
    ) public payable {
        require(msg.value > 0 && amount > 0, "Need eth to sponsor");

        bytes memory payload = abi.encode(eventId, msg.sender, name);

        Token.transferFrom(msg.sender, address(this), amount);
        bool accept = Token.approve(address(gateway), amount);
        require(accept, "Allow approval to send"); //Approval of user token

        gasService.payNativeGasForContractCallWithToken{value: msg.value}(
            address(this),
            destinationChain_,
            destinationAddress_,
            payload,
            "aUSDC",
            amount,
            msg.sender
        );

        gateway.callContractWithToken(
            destinationChain_,
            destinationAddress_,
            payload,
            "aUSDC",
            amount
        );
    }

    string public token_name;
    uint256 public amount_param;
    uint256 public amount_payload;

    //----Receiver
    function _executeWithToken(
        string calldata,
        string calldata,
        bytes calldata payload,
        string calldata,
        uint256 amount
    ) internal override {
        (uint256 eventId, address _sender, string memory name) = abi.decode(
            payload,
            (uint256, address, string)
        );

        //update balance

        Events[eventId].sponsors.push(
            EventSponsor(name, _sender, amount, true)
        );

        Events[eventId].tokBalance += amount;

        emit SponsorAdded(name, _sender, amount);
        // Token.transfer(_sender, amount); TRANSFERRING TOKEN method
    }

    //----Swap
    //------Sender
    //After Squid Swap --> pass data - Gmp
    function addSponsor_Gmp(
        uint256 eventId,
        string calldata name,
        uint256 amount,
        string calldata destinationChain_,
        string calldata destinationAddress_
    ) public payable {
        require(msg.value > 0 && amount > 0, "Need eth to sponsor");

        bytes memory payload = abi.encode(eventId, msg.sender, name, amount);

        gasService.payNativeGasForContractCall{value: msg.value}(
            msg.sender,
            destinationChain_,
            destinationAddress_,
            payload,
            msg.sender
        );

        gateway.callContract(destinationChain_, destinationAddress_, payload);
        emit SponsorAdded(name, msg.sender, amount);
    }

    //------Receiver
    function _execute(
        string calldata,
        string calldata,
        bytes calldata payload
    ) internal override {
        (
            uint256 eventId,
            address _sender,
            string memory name,
            uint256 amount
        ) = abi.decode(payload, (uint256, address, string, uint256));

        Events[eventId].sponsors.push(
            EventSponsor(name, _sender, amount, false)
        );

        totalIncome += amount;
        Events[eventId].balance += amount;

        emit SponsorAdded(name, _sender, amount);
    }

    //=======Get Methods=======
    function getEvent_balance(uint256 eventId) public view returns (uint256) {
        return (Events[eventId].balance);
    }

    function getEvent_expenses(uint256 eventId)
        public
        view
        returns (StaffExpense[] memory)
    {
        return (Events[eventId].expenses);
    }

    function getTotalBalance() public view returns (uint256) {
        return (address(this).balance);
    }

    function getStaffs(uint256 eventId)
        public
        view
        returns (EventStaff[] memory, uint256)
    {
        return (Events[eventId].staffs, Events[eventId].staffs.length);
    }

    // //---Sponsor
    function getSponsors(uint256 eventId)
        public
        view
        returns (EventSponsor[] memory)
    {
        _check_event_owner(eventId, msg.sender);
        return (Events[eventId].sponsors);
    }

    //=======UPDATE Methods=======
    //Edition
    function editEvent(uint256 eventId, string calldata updatedName) public {
        _check_event_owner(eventId, Events[eventId].owner);

        Events[eventId].name = updatedName;
        emit EventEdited(msg.sender, eventId);
    }

    function editStaff(
        uint256 eventId,
        uint256 staffId,
        string memory updatedName,
        uint256 updatedLimit
    ) public {
        _check_event_owner(eventId, Events[eventId].owner);

        //returns _staff...........Checks Staff
        EventStaff memory _staff = _check_staff(eventId, staffId);
        // EventStaff memory _staff = _event.staffs[staffId];

        if (updatedLimit != _staff.limit) {
            Events[eventId].staffs[staffId].limit = updatedLimit;
        }
        if (
            keccak256(abi.encodePacked(updatedName)) !=
            keccak256(abi.encodePacked(_staff.name))
        ) {
            Events[eventId].staffs[staffId].name = updatedName;
        }

        emit StaffEdited(msg.sender, _staff.staff);
    }

    //=======DELETE Methods=======
    //Deletion
    function deleteEvent(uint256 eventId) public {
        _check_event_owner(eventId, Events[eventId].owner);

        delete Events[eventId];

        emit EventDeleted(msg.sender, eventId);
    }

    function deleteStaff(uint256 eventId, uint256 staffId) public {
        _check_event_owner(eventId, Events[eventId].owner);

        uint256 lastStaffId = Events[eventId].staffs.length - 1;
        // Check Staff is valid
        require(staffId < lastStaffId + 1, "Sorry, not a staff here");

        if (staffId != lastStaffId) {
            Events[eventId].staffs[staffId] = Events[eventId].staffs[
                lastStaffId
            ];
        }
        Events[eventId].staffs.pop();

        emit StaffDeleted(msg.sender, staffId);
    }

    //========PAYMENTS========
    //-----STAFF -> Native
    function staff_pay_native(
        uint256 eventId,
        uint256 staffId,
        uint256 amount,
        address payable _to,
        string calldata reason
    ) public {
        // Check Event is valid
        require(eventId < id, "Event is not exist");
        Event memory _event = Events[eventId];

        //Check blance of event
        require(
            amount < (_event.balance - _event.expense - minimumGasPerEvent),
            "Sorry, There is no enough balance for payment"
        );

        //Check Owner
        if (msg.sender == _event.owner) {
            //gives him full access
            (bool ownerSent, ) = _to.call{value: amount}("");
            require(ownerSent, "Internal Error");

            //add expense into Staff Expenses
            _addEventExpenses(eventId, reason, amount, msg.sender, _to, false);

            emit PaymentSuccessful(_event.owner, amount);
            return;
        }

        //returns _staff...........Checks Staff
        EventStaff memory _staff = _check_staff(eventId, staffId);

        //Check amount is lt limit
        require(
            _staff.limit == 0 ||
                (_staff.expense + amount + minimumGasPerEvent) < _staff.limit,
            "Sorry your limit exceeds"
        );

        // to address
        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Internal Error");

        //update staff expense amount
        Events[eventId].staffs[staffId].expense = _staff.expense + amount;

        //add expense into Staff Expenses
        _addEventExpenses(eventId, reason, amount, msg.sender, _to, false);

        emit PaymentSuccessful(_staff.staff, amount);
    }

    //-----STAFF
    function staff_pay_token(
        uint256 eventId,
        uint256 staffId,
        uint256 amount,
        address payable _to,
        string calldata reason
    ) public {
        // Check Event is valid
        require(eventId < id, "Event is not exist");
        Event memory _event = Events[eventId];

        //Check blance of event
        require(
            amount < (_event.tokBalance - _event.tokExpense),
            "Sorry, There is no enough token balance for payment"
        );

        //Check Owner
        if (msg.sender == _event.owner) {
            //gives him full access
            Token.transfer(_to, amount);

            //add expense into Staff Expenses
            _addEventExpenses(eventId, reason, amount, msg.sender, _to, true);

            emit PaymentSuccessful(_event.owner, amount);
            return;
        }

        //returns _staff...........Checks Staff
        EventStaff memory _staff = _check_staff(eventId, staffId);

        //Message ---> We havent have a limit on token === we can implement later
        // //update staff expense amount
        // Events[eventId].staffs[staffId].expense = _staff.expense + amount;

        // to address
        Token.transfer(_to, amount);

        //add expense into Staff Expenses
        _addEventExpenses(eventId, reason, amount, msg.sender, _to, true);

        emit PaymentSuccessful(_staff.staff, amount);
    }

    function _addEventExpenses(
        uint256 eventId,
        string calldata reason,
        uint256 amount,
        address _to,
        address _from,
        bool _token
    ) internal {
        //update Event expense amount
        Events[eventId].expense += amount;

        //Add on Lists
        Events[eventId].expenses.push(
            StaffExpense(reason, amount, _from, _to, _token)
        );
    }

    //FallBack to Payments
    receive() external payable {
        // require(msg.value >= 0, "Can't send without id"); //change
    }
}
//AVAX https://testnet.snowtrace.io/address/0xa552f29fe5500740B8360D1E30bD5C40A0c4b230 - v1 success GMP
//POLY https://mumbai.polygonscan.com/address/0x96226Cd9E7037767e5d3A29D8810A2bCDb1E8156 - v1 success
//AVAX 0xF6c4E65d4F8A275fE5527bd0D799f8abAEF02D2C - v0 failed
