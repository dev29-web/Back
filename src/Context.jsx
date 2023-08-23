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
  function shortenAddress(address, len) {
    const length = Math.round(len / 2);
    return `${address.slice(0, length)}...${address.slice(
      parseInt(`-${length}`)
    )}`;
  }
  function parseWeiToEther(wei, wei2) {
    if (wei2) {
      wei = ethers.BigNumber.from(wei).add(ethers.BigNumber.from(wei2));
      return ethers.utils.formatEther(wei);
    }
    return ethers.utils.formatEther(wei);
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
    isOwner: false,
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
  const [connectModal, setConnectModal] = useState(false);

  //FORMS
  const handleAddForm = (values, network) => {
    console.log("values", values);
    const { name, coin, teams } = values;

    //Check coin has seleced or not
    if (network.toLowerCase() !== currentNetwork.toLowerCase()) {
      message.warning("Switching network");
      return;
    }
    if (coin.length === 0) {
      message.warning("Select coin");
      return;
    }
    if (name.length === 0) {
      message.warning("Enter vent name");
      return;
    }
    //Check name is unique or not
    let teamAdresses = [];
    if (teams.length > 0) {
      teams.forEach((team) => {
        console.log("first", team, !team.address);
        if (!team.address || team.address.length === 0) {
          message.warning("Enter team address");
          return;
        }
        teamAdresses.push(team.address);
        if (hasDuplicates(teamAdresses)) {
          message.warning("Team address must be unique");
          return;
        }
        if (!team.name || team.name.length === 0) {
          message.warning("Enter team name");
          return;
        }
        if (!team.limit || team.limit.length === "") {
          message.warning("Enter team limit");
          return;
        }
        console.log("success");
      });
    }
    // message.success("Vent created");
    // handleModal(false);
    message.success("All good");
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
    (show, id, owner) => {
      const isOwner = owner === currentAccount;

      if (show) {
        setSidebar({
          ...sidebar,
          show,
          showId: id,
          isOwner,
          show2: false,
        });
        return;
      }
      setSidebar({ ...sidebar, show, show2: false, isOwner: false });
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
      console.log("modal", open, title, vent);
      setModal({ open, title, vent });
    },
    [modal]
  );

  const handleModal2 = useCallback(
    (open2, title2, vent2) => {
      console.log("modal", open2, title2, vent2);
      setModal({ open2, title2, vent2 });
    },
    [modal]
  );

  function _checkEthereum() {
    if (!ethereum) return message.error("Can't find Metamask");
    return;
  }
  //
  //=====BlockChain
  //
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
      setCurrentAccount(_chainId);
      message.warning(
        `This network ${_chainId} doesn't support, Please change!`
      );
    } else {
      setCurrentNetwork(chains[_chainId].name);

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

  const getAllVents = useCallback(async () => {
    _checkEthereum();

    if (!contract) return message.error("It's not connected properly", 1);

    // Mongodb get all event
  }, [contract]);

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
    setVents(vents);
    setSavedVents(vents.slice(0, 3));
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
        //state
        Vents,
        SavedVents,
        sidebar,
        modal,
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
