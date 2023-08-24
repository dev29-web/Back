//////////NOTE:: useMemo for get values, useCallback for functions updation
// VentContext
import React, {
  createContext,
  useCallback,
  useMemo,
  useContext,
  useEffect,
  useState,
} from "react";
import { message } from "antd";

import VentDB from "./api";

import { ventAddresses, ventAbi } from "./Constants";
import { ethers } from "ethers";
const { Contract } = ethers;
const { ethereum } = window;

const VentContext = createContext();

export function useVent() {
  return useContext(VentContext);
}

//Dummy
import { vents } from "./dummy";

export function VentProvider({ children }) {
  //Utils/Pure functions
  function hasDuplicates(array) {
    return new Set(array).size !== array.length;
  }
  async function delay(sec) {
    console.log("loading vents...");
    await new Promise((resolve) =>
      setTimeout(() => {
        console.log("loaded.");
        resolve();
      }, sec)
    );
  }
  function coin(chainName) {
    if (!chainName) return;
    return _coin[chainName.toLowerCase()];
  }
  function logoName(chainName) {
    if (!chainName) return;
    return logos[chainName.toLowerCase()];
  }
  const shortenAddress = (address, len) => {
    const length = Math.round(len / 2);
    return `${address.slice(0, length)}...${address.slice(
      parseInt(`-${length}`)
    )}`;
  };
  function parseWeiToEther(wei, wei2) {
    if (wei2) {
      wei = ethers.BigNumber.from(wei).add(ethers.BigNumber.from(wei2));
      return ethers.utils.formatEther(wei);
    }
    return ethers.utils.formatEther(wei);
  }
  function isSameAddress(owner, currentAddress) {
    const { isAddress } = ethers.utils;
    console.log(
      "isSameAddress",
      owner,
      currentAccount,
      isAddress(owner) === isAddress(currentAddress)
    );
    return owner && isAddress(owner) === isAddress(currentAddress);
  }
  function isSameNetwork(network) {
    console.log(
      "isSameNetwork",
      network.toLowerCase() === currentNetwork.toLowerCase()
    );
    return network && network.toLowerCase() === currentNetwork.toLowerCase();
  }
  function checkName(name) {
    return VentDB.post("/checkName", {
      name,
    })
      .then((res) => {
        console.log("checkName", res.data.name);
        return res.data.name;
      })
      .catch((err) => {
        console.error("checkName", err);
        return err;
      });
  }

  //Constants
  const address_shorten = "0x2Eva4...3aFW1";
  const logos = {
    avalanche: "avax.network",
    ethereum: "ethereum.org",
    polygon: "polygon.technology",
    bsc: "bsc.network",
    fantom: "fantom.foundation",
    moonbeam: "moonbeam.network",
  };

  const amount = "10";
  const color = "red";
  const chains = {
    5: {
      name: "Goreila",
    },
    4002: {
      name: "Fantom",
    },
    1287: {
      name: "Moonbeam",
    },
    80001: {
      name: "Polygon",
    },
    43113: {
      name: "Avalanche",
    },
  };
  const networks = [
    {
      value: "ethereum",
      label: "Ethereum",
    },
    {
      value: "avalanche",
      label: "Avalanche",
    },
    {
      value: "polygon",
      label: "Polygon",
    },
    {
      value: "fantom",
      label: "Fantom",
    },
  ];
  const _coin = {
    ethereum: {
      coin: "ETH",
      emoji: "🔷",
    },
    avalanche: {
      coin: "AVAX",
      emoji: "🔴",
    },
    polygon: {
      coin: "MATIC",
      emoji: "🟣",
    },
    fantom: {
      coin: "FTM",
      emoji: "🔵",
    },
    moonbeam: {
      coin: "DEV",
      emoji: "🌑",
    },
  };

  //Variables
  //---Gloabal
  const [Vents, setVents] = useState([]);
  const [SavedVents, setSavedVents] = useState([]);
  //---Modals
  const [sidebar, setSidebar] = useState({
    //For Vent Details
    show: false,
    width: 30,
    showId: "",
    chainName: "",
    cardOwner: "",
    //For Spend and Sponsor
    show2: false,
    width2: 40,
    name: "",
  });
  const [modal, setModal] = useState({
    //For Vent
    open: false,
    title: "Add",
    vent: {},
    //For Spend
    open2: false,
    title2: "Pay",
    vent2: {},
  });
  const [loading_modal, setLoading_modal] = useState(false);
  const [connectModal, setConnectModal] = useState(false);

  function _showWarning(msg) {
    setLoading_modal(false);
    message.warning(msg);
  }

  //FORMS
  const handleAddForm = async (values, network, isPublic) => {
    console.log("values", values, network, isPublic);
    //Loading
    setLoading_modal(true);
    const { name, coin, teams } = values;

    //Check coin has seleced or not
    if (network.toLowerCase() !== currentNetwork.toLowerCase()) {
      _showWarning("Switching network");
      return;
    }
    if (coin.length === 0) {
      _showWarning("Select coin");
      return;
    }
    if (name.length === 0) {
      _showWarning("Enter vent name");
      return;
    }
    //Check name is unique or not

    if (await checkName(name)) {
      _showWarning("Name is already taken");
      return;
    }

    let teamAdresses = [];

    //For contract
    let staffs = [];
    let token = coin.includes("aUSDC");
    if (teams && teams.length > 0) {
      teams.forEach((team) => {
        if (
          !team.address ||
          team.address.length === 0 ||
          !ethers.utils.isAddress(team.address)
        ) {
          //Check address valid
          _showWarning("Enter valid team address");
          return;
        }
        teamAdresses.push(team.address);
        if (hasDuplicates(teamAdresses)) {
          _showWarning("Team address must be unique");
          return;
        }
        if (!team.name || team.name.length === 0) {
          _showWarning("Enter team name");
          return;
        }
        if (team.limit === null || team.limit.length === "") {
          _showWarning("Enter team limit");
          return;
        }
        staffs.push([
          team.name,
          team.address,
          ethers.utils.parseUnits(team.limit.toString(), "ether"),
          0,
        ]); //0 is for intial balance
      });

      if (staffs.length === teams.length) {
        createVent(name, token, network, staffs, isPublic);
      }

      //Loading btn
      setLoading_modal(false);
      return;
    }
    // message.success("Vent created");
    // handleModal(false);
    createVent(name, token, network, staffs, isPublic);
  };
  const handlePayForm = (values, amount) => {
    console.log("values", values);
    const { fromNetwork, fromCoin, toNetwork, toCoin, receiver, name } = values;

    //Check coin has seleced or not
    // if (fromNetwork.toLowerCase() !== currentNetwork.toLowerCase()) {
    //   message.warning("Switching network");
    //   return;
    // }
    if (receiver.length === 0) {
      //Check address valid
      message.warning("Select coin");
      return;
    }
    if (name.length === 0) {
      message.warning("Enter vent name");
      return;
    }
    if (fromCoin.length === 0) {
      message.warning("Select coin");
      return;
    }
    if (amount === 0 || amount.length === 0) {
      message.warning("Enter amount");
      return;
    }
    //Check amount < balance

    message.success("All good");
  };

  //Handlers
  const getVent = (id) => {
    return new Promise(async (resolve) => {
      await delay(1000);
      const vent = vents.find((vent) => vent.uid === id);
      console.log("getVEnt context", id, vent);
      resolve(vent);
    });
  };

  const handleSidebar = useCallback(
    (show, id, owner, network) => {
      console.log("first", currentAccount);

      console.log(
        "hadnlesSidebar",
        show,
        id,
        owner,
        currentAccount,
        network,
        owner
      );
      if (show) {
        setSidebar({
          ...sidebar,
          show,
          showId: id,
          chainName: network.toLowerCase(),
          cardOwner: owner,
          show2: false,
        });
        return;
      }
      setSidebar({ ...sidebar, show, show2: false, cardOwner: "" });
    },
    [sidebar]
  );

  const handleSidebar2 = useCallback(
    (show2, name) => {
      setSidebar({ ...sidebar, show2, show: false, name });
    },
    [sidebar]
  );

  const handleModal = useCallback(
    (open, title, vent) => {
      console.log("first", currentAccount);
      // console.log("modal", open, title, vent);
      // setModal({ ...modal, open, title, vent });
      // //Loading btn
      // setLoading_modal(false);
    },
    [modal]
  );

  const handleModal2 = useCallback(
    (open2, title2, vent2) => {
      console.log("modal", open2, title2, vent2);
      setModal({ ...modal, open2, title2, vent2 });
    },
    [modal]
  );

  //
  //=====BlockChain
  //
  function _checkEthereum() {
    if (!ethereum) return message.error("Can't find Metamask");
    return;
  }
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [contract, setContract] = useState();

  const connectMetamask = useCallback(async () => {
    _checkEthereum();

    const provider = new ethers.providers.Web3Provider(ethereum);

    const _accounts = await ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err) => message.error(err.message, 2));

    if (_accounts) {
      setCurrentAccount(_accounts[0]);
    }

    const _chainId = ethereum.networkVersion;
    if (!Object.keys(chains).includes(_chainId)) {
      message.warning(
        `This network ${_chainId} doesn't support, Please change!`
      );
    } else {
      setCurrentNetwork(chains[_chainId].name);

      console.log("_contract", ventAddresses[_chainId].address);
      const _contract = new Contract(
        ventAddresses[_chainId].address,
        ventAbi,
        provider.getSigner()
      );
      setContract(_contract);
    }

    setConnectModal(false);
    message.success("Metamask connected!");
  }, [currentAccount, currentNetwork]);

  const createVent = async (name_, token_, network_, staffs_, isOpen) => {
    //Listening for EventAdded event
    contract.once("EventAdded", async (name, from, id) => {
      //Mongodb add event
      if (isOpen) {
        let args = {
          uid: 123,
          name,
          chainName: network_,
          owner: from,
          token: token_,
        };

        await VentDB.post("/", args);
        setVents([args, ...Vents]);

        console.log("EventAdded", args);
      }
    });
    setLoading_modal(true);

    try {
      //Contract add event
      message.info("Creating vent...");
      const tx = await (
        await contract.addEvent(name_, token_, staffs_)
      ).wait(1);

      console.log("tx", tx);
      message.success("Vent created");
      handleModal(false);
      // contract.off("EventAdded");
    } catch (err) {
      //Loading btn
      setLoading_modal(false);
      console.warn(err);
    }
  };

  const getJoinedVents = useCallback(async () => {
    _checkEthereum();

    if (!contract) return message.error("It's not connected properly", 1);

    // Mongodb get all event
  }, [contract]);

  const getAllVents = async () => {
    try {
      // Mongodb get all event
      // await delay(000);
      const res = await VentDB.get("/");
      return res.data.vents;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  useEffect(() => {
    // delay(3000).then(() => {
    //   console.log("second");
    //   setVents(vents);
    // });
    if (ethereum) {
      window.ethereum.on("chainChanged", () => {
        connectMetamask();
      });
    }
    getAllVents().then((vents) => {
      console.log(vents);
      // setVents(vents);
      // setSavedVents(vents.slice(0, 3));
      setVents([
        {
          uid: "0",
          name: "Birthday_Party ",
          owner: "0x2Ef7736AFeb464E68ecbB1258E2668e276CBBEc8",
          chainName: "Polygon",
          balance: "0",
          token: true,
        },
        ...vents,
      ]);
    });
    // console.log("context useEffect");
    // setVents(vents);
    setSavedVents(vents.slice(0, 3));
  }, []);

  useEffect(() => {
    // This effect will run after each render
    // The currentAccount state should be updated at this point
    console.log("currentAccount in useEffect:", currentAccount);
  }, []);

  return (
    <VentContext.Provider
      value={{
        //Constants
        address_shorten,
        networks,
        amount,
        color,
        // utils
        coin,
        logoName,
        shortenAddress,
        parseWeiToEther,
        isSameNetwork,
        isSameAddress,
        //state
        Vents,
        SavedVents,
        sidebar,
        modal,
        loading_modal,
        connectModal,
        //--blockchain
        currentNetwork,
        currentAccount,
        Contract: contract,
        //handle
        handleSidebar,
        handleSidebar2,
        handleModal,
        handleModal2,
        handleAddForm,
        handlePayForm,
        setConnectModal,
        //functions
        getVent,
        getAllVents,
        connectMetamask,
      }}
    >
      {children}
    </VentContext.Provider>
  );
}
