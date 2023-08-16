// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
// import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract Axe is AxelarExecutable {
    //========Events========
    event EventAdded(
        string name,
        address owner,
        uint256 balance,
        string chainName
    );
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

    uint256 private totalBalance;
    string public chainName;

    IAxelarGasService immutable gasService;

    constructor(
        address gateway_,
        address gasService_,
        string memory chainName_
    ) AxelarExecutable(gateway_) {
        gasService = IAxelarGasService(gasService_);
        chainName = chainName_;
    }

    //=======Structs and Mappings=======
    //Event
    struct Event {
        uint256 uid;
        string name;
        address owner;
        uint256 balance;
        uint256 expense;
        string chainName;
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
    }
    //Event Sponsors
    struct EventSponsor {
        string name;
        address sponsor;
        uint256 amount;
    }

    //=======Checker=======
    function _check_event_owner(uint256 eventId, address owner_) internal view {
        require(eventId < id, "Event does not exist");
        require(msg.sender == owner_, "Sorry, you are not the owner");
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

        emit EventAdded(name_, msg.sender, 0, chainName);
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
            EventSponsor(name, msg.sender, msg.value)
        );
        totalBalance += msg.value;
        Events[eventId].balance += msg.value;

        emit SponsorAdded(name, msg.sender, msg.value);
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
        require(eventId < id, "Event is not exist");
        require(msg.value > 0 && amount > 0, "Need eth to sponsor");

        bytes memory payload = abi.encode(eventId, name, amount);

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
        address,
        address sourceAddress_,
        bytes memory payload
    ) internal {
        (uint256 eventId, string memory name, uint256 amount) = abi.decode(
            payload,
            (uint256, string, uint256)
        );

        Events[eventId].sponsors.push(
            EventSponsor(name, sourceAddress_, amount)
        );
        totalBalance += amount;
        Events[eventId].balance += amount;

        emit SponsorAdded(name, sourceAddress_, amount);
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
        return (totalBalance);
    }

    function getStaffs(uint256 eventId)
        public
        view
        returns (EventStaff[] memory, uint256)
    {
        return (Events[eventId].staffs, Events[eventId].staffs.length);
    }

    function getStaff_expense(uint256 eventId, uint256 staffId)
        public
        view
        returns (uint256)
    {
        return (Events[eventId].staffs[staffId].expense);
    }

    function getStaff_length(uint256 eventId) public view returns (uint256) {
        return (Events[eventId].staffs.length);
    }

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

        Event memory _event = Events[eventId];

        // Check Staff is valid
        require(staffId < _event.staffs.length, "Sorry, not a staff here");
        // EventStaff memory _staff = _event.staffs[staffId];

        if (updatedLimit != _event.staffs[staffId].limit) {
            Events[eventId].staffs[staffId].limit = updatedLimit;
        }
        if (
            keccak256(abi.encodePacked(updatedName)) !=
            keccak256(abi.encodePacked(_event.staffs[staffId].name))
        ) {
            Events[eventId].staffs[staffId].name = updatedName;
        }

        emit StaffEdited(msg.sender, _event.staffs[staffId].staff);
    }

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

    //STAFF PAYMENTS
    function staff_pay(
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
            _addEventExpenses(eventId, reason, amount, msg.sender, _to);

            emit PaymentSuccessful(_event.owner, amount);
            return;
        }

        // Check Staff is valid
        require(staffId < _event.staffs.length, "Sorry, not a staff here");

        EventStaff memory _staff = _event.staffs[staffId];
        require(_staff.staff == msg.sender, "Sorry no staff here");

        //Check amount is lt limit
        require(
            _staff.limit == 0 ||
                (_staff.expense + amount + minimumGasPerEvent) < _staff.limit,
            "Sorry your limit exceeds"
        );

        // to address
        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Internal Error");

        //update Event expense amount
        Events[eventId].expense += amount;

        //update staff expense amount
        Events[eventId].staffs[staffId].expense = _staff.expense + amount;

        //add expense into Staff Expenses
        _addEventExpenses(eventId, reason, amount, msg.sender, _to);

        emit PaymentSuccessful(_staff.staff, amount);
    }

    function _addEventExpenses(
        uint256 eventId,
        string calldata reason,
        uint256 amount,
        address _to,
        address _from
    ) internal {
        Events[eventId].expenses.push(StaffExpense(reason, amount, _from, _to));
    }

    //FallBack to Payments
    receive() external payable {
        require(msg.value >= 0, "Can't send without id");
    }

    // function getEvents() public view returns (Events memory) {}
    // Event memory _event = Event({
    //         uid: id,
    //         name: name_,
    //         owner: owner_,
    //         balance: 0,
    //         chainName: chainName,
    //         staffs: new EventStaff[](0),
    //         sponsors: new EventSponsor[](0)
    //     });
    // function getLen() public view returns (uint256) {
    //     return ();
    // }
}
//AVAX https://testnet.snowtrace.io/address/0x2c9d9864275f4b33a35020bce1e25d5e36495684
//POLY https://mumbai.polygonscan.com/address/0x2ef7736afeb464e68ecbb1258e2668e276cbbec8
//AVAX 0xF6c4E65d4F8A275fE5527bd0D799f8abAEF02D2C
