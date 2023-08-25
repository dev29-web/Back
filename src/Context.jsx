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

import { ethers } from "ethers";
const { Contract } = ethers;
const { ethereum } = window;

import VentDB from "./api";

import { ventAddresses, ventAbi } from "./Constants";
import Swap from "./Swap";
import IERC20 from "@axelar-network/axelar-gmp-sdk-solidity/interfaces/IERC20.sol/IERC20.json";
import {
  AxelarGMPRecoveryAPI,
  AxelarQueryAPI,
  Environment,
} from "@axelar-network/axelarjs-sdk";
const SDK = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET,
});
const API = new AxelarQueryAPI({ environment: Environment.TESTNET });

const VentContext = createContext();

export function useVent() {
  return useContext(VentContext);
}

//Dummy
import { vents } from "./dummy";

const CHAINS = {
  5: {
    name: "Ethereum",
    chainName: "Ethereum Goerli",
    chainId: 5,
    native: "ETH",
    rpc: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
    usdc: "0x254d06f33bDc5b8ee05b2ea472107E300226659A",
  },
  4002: {
    name: "Fantom",
    chainName: "Fantom Testnet",
    chainId: 4002,
    native: "FTM",
    rpc: "https://rpc.testnet.fantom.network/",
    gateway: "0x97837985Ec0494E7b9C71f5D3f9250188477ae14",
    usdc: "0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61",
  },
  1287: {
    name: "Moonbeam",
    chainName: "Moonbase Alpha",
    chainId: 1287,
    native: "DEV",
    rpc: "https://rpc.api.moonbase.moonbeam.network/",
    gateway: "0x5769D84DD62a6fD969856c75c7D321b84d455929",
    usdc: "0xD1633F7Fb3d716643125d6415d4177bC36b7186b",
  },
  80001: {
    name: "Polygon",
    chainName: "Polygon Mumbai",
    chainId: 80001,
    native: "MATIC",
    rpc: "https://matic-mumbai.chainstacklabs.com",
    gateway: "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B",
    usdc: "0x2c852e740B62308c46DD29B982FBb650D063Bd07",
    address: "0x3426a3C33670fB83aa88DdFEB4cC287d863025fa",
  },
  43113: {
    name: "Avalanche",
    chainName: "Avalanche Fuji",
    chainId: 43113,
    native: "AVAX",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    gateway: "0xC249632c2D40b9001FE907806902f63038B737Ab",
    usdc: "0x57F1c63497AEe0bE305B8852b354CEc793da43bB",
    address: "0x067EE458E2A9041acE8Dbb0BB4dff3a11bF19FAb",
  },
};

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
  function parseEtherToWei(eth, eth2) {
    eth = eth.toString();
    if (eth2) {
      eth2 = eth2.toString();
      const s = (parseFloat(eth) + parseFloat(eth2)).toString();
      eth = ethers.utils.parseUnits(s, "ether");
    }
    return ethers.utils.parseUnits(eth, "ether");
  }
  function isSameAddress(owner, currentAddress) {
    const { getAddress } = ethers.utils;
    console.log("isSameAddress", owner, currentAccount);
    return (
      owner &&
      currentAddress &&
      getAddress(owner) === getAddress(currentAddress)
    );
  }
  function isSameChain(chain) {
    console.log(
      "isSameNetwork",
      chain.toLowerCase() === currentNetwork.toLowerCase()
    );
    return chain && chain.toLowerCase() === currentNetwork.toLowerCase();
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
      chainId: 5,
    },
    avalanche: {
      coin: "AVAX",
      emoji: "🔴",
      chainId: 43113,
    },
    polygon: {
      coin: "MATIC",
      emoji: "🟣",
      chainId: 80001,
    },
    fantom: {
      coin: "FTM",
      emoji: "🔵",
      chainId: 4002,
    },
    moonbeam: {
      coin: "DEV",
      emoji: "🌑",
      chainId: 1287,
    },
  };

  //Variables
  //---Gloabal
  const [flag, setFlag] = useState({
    dashboard: false,
    lists: false,
  });
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
      return;
    }
    // message.success("Vent created");
    // handleModal(false);
    createVent(name, token, network, staffs, isPublic);
  };
  const [swapForm, setSwapForm] = useState({
    fromCoin: "",
    fromNetwork: "",
    amount: "",
    source: "",
    destination: "",
  });
  const handlePayForm = async (values, amount, fromNetwork, setLoading) => {
    const { fromCoin, toNetwork, toCoin, receiver, name } = values;

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
    const amount_wei = parseEtherToWei(amount);
    console.log("amount_wei", amount_wei);

    //Format values
    // amount: undefined;
    // fromCoin: "MATIC";
    // fromNetwork: undefined;
    // name: "loki";
    // receiver: "0xF747F92b123Aca5Af635d1073796129318E4791C";
    // toCoin: Array[("MATIC", false)];
    // toNetwork: "polygon";
    contract.on("SponsorAdded", (name, from, amount, spondorId) => {
      console.log("SponsorAdded", name, from, amount, spondorId);
      setLoading(false);
      setModal({ ...modal, open2: false });
      if (isSameAddress(from, currentAccount)) {
        // mongo update
      }
    });
    console.log("value", values);
    const { vent2 } = modal;
    if (isSameChain(fromNetwork) && vent2 && Object.keys(vent2).length > 0) {
      //Check balance
      //Checkers
      if (toCoin.includes(fromCoin)) {
        //======Cross Send======
        if (
          fromCoin.toLowerCase() === "aUSDC".toLowerCase() &&
          fromNetwork.toLowerCase() !== toNetwork.toLowerCase()
        ) {
          const amount_wei = parseFloat(amount) * 10 ** 6;

          const source = CHAINS[coin(fromNetwork.toLowerCase()).chainId];
          const destination = CHAINS[coin(toNetwork.toLowerCase()).chainId];
          calculate_gasFee(source, destination)
            .then(async (gasFee) => {
              addSponsor_GmpToken(
                vent2.uid,
                name,
                amount_wei,
                toNetwork,
                gasFee,
                source,
                destination,
                setLoading
              );
            })
            .catch((err) => {
              setLoading(false);
              message.error("Internal error");
              console.error(err);
            });
          return;
        }

        //======SEND======
        addSponsor_Pay(vent2.uid, name, amount_wei)
          .then((tx) => {
            console.log("SEND", tx);
          })
          .catch((err) => {
            setLoading(false);
            message.error("Internal error");
            console.error(err);
          });
        return;
      }
      //======SWAP & SEND======
      setSwapForm({
        fromCoin,
        fromNetwork,
        amount: amount.toString(),
        source: CHAINS[coin(fromNetwork.toLowerCase()).chainId],
        destination: CHAINS[coin(toNetwork.toLowerCase()).chainId],
      });
      setDoswap(true);
      // setButtonTitle("Swap & Send");
    } else {
      switchNetwork(fromNetwork);
    }
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
      setModal({ ...modal, open, title, vent });
      //Loading btn
      setLoading_modal(false);
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
  const transactionStatus = async (txHash) => {
    const res = await SDK.queryTransactionStatus(txHash);
    console.log("status", res);
    return res;
  };
  const calculate_gasFee = async (source, dest) => {
    console.log(`Gas Caluculator called`);

    return await API.estimateGasFee(
      source.name.toUpperCase(),
      dest.name.toUpperCase(),
      source.symbol
    );
  };
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
    if (!Object.keys(CHAINS).includes(_chainId)) {
      message.warning(
        `This network ${_chainId} doesn't support, Please change!`
      );
    } else {
      setCurrentNetwork(CHAINS[_chainId].name);

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

  async function switchNetwork(switch_network) {
    _checkEthereum();

    const chainId = _coin[currentNetwork.toLowerCase()].chainId;
    const switch_chainId = _coin[switch_network.toLowerCase()].chainId;
    console.log(
      "swicth",
      currentNetwork,
      switch_network,
      chainId,
      switch_chainId
    );
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexValue(switch_chainId) }],
      });
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        const { native, rpc, chainName } = CHAINS[switch_chainId];
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainName: chainName,
              chainId: ethers.utils.hexValue(switch_chainId),
              nativeCurrency: { name: native, decimals: 18, symbol: native },
              rpcUrls: [rpc],
            },
          ],
        });
      }
    }
  }

  const createVent = async (name_, token_, network_, staffs_, isOpen) => {
    try {
      //Listening for EventAdded event
      contract.once("EventAdded", async (name, owner, eventId) => {
        //Mongodb add event
        console.log("EventAdded", name, owner, eventId);
        if (isOpen) {
          let args = {
            uid: ethers.BigNumber.from(eventId).toNumber(),
            name,
            owner,
            chainName: network_,
            token: token_,
          };
          console.log("EventAdded 1", args);

          await VentDB.post("/", args);
          setVents([args, ...Vents]);
          setOwnVents([args, ...ownVents]);
        }
        setLoading_modal(false);
        message.success("Vent created");
        handleModal(false);
      });
      setLoading_modal(true);

      //Contract add event
      message.info("Creating vent...");
      const tx = await (
        await contract.addEvent(name_, token_, staffs_)
      ).wait(1);

      console.log("tx", tx);
      // contract.off("EventAdded");
    } catch (err) {
      //Loading btn
      setLoading_modal(false);
      console.warn(err);
    }
  };

  //--Sponsor Payments...
  async function addSponsor_Pay(id, name, amount_wei) {
    try {
      const tx = await (
        await contract.addSponsor_Pay(id, name, {
          value: amount_wei,
        })
      ).wait();
      return tx;
    } catch (err) {
      console.error(err);
      return;
    }
  }
  const [transaction, setTransaction] = useState("");
  async function addSponsor_GmpToken(
    id,
    name,
    amount_wei,
    toNetwork,
    gasFee,
    source,
    destination,
    setLoading
  ) {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const usdc = new Contract(source.usdc, IERC20.abi, provider.getSigner());

      message.warning("Approve usdc to continue");
      await (await usdc.approve(source.address, amount_wei)).wait();
      message.info("Approved... sending payment");

      const tx = await (
        await contract.addSponsor_GmpToken(
          id,
          name,
          amount_wei,
          destination.address,
          toNetwork,
          {
            value: gasFee,
          }
        )
      ).wait();
      const { transactionHash } = tx;

      setTransaction(transactionHash);
      setLoading(false);

      console.log(
        tx,
        "Axelar api",
        "https://testnet.axelarscan.io/gmp/" + transactionHash
      );
      transactionStatus(transactionHash).then((res) => {
        console.log("status on payform", res);
      });
      return tx;
    } catch (err) {
      setLoading(false);
      console.error(err);
      return;
    }
  }
  const [doswap, setDoswap] = useState(false);
  async function swap() {}
  //----DB
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

  const [ownVents, setOwnVents] = useState([]);
  const getOwnerVents = useCallback(
    async (currentAddress) => {
      try {
        // Mongodb get all event
        // await delay(000);
        const { data } = await VentDB.get(`/owner/${currentAddress}`);

        if (data && data.vents && data.vents.length > 0) {
          setOwnVents(data.vents);
          setFlag({ ...flag, dashboard: true });
        }
        return data.vents;
      } catch (err) {
        console.error(err);
        return [];
      }

      // Mongodb get all event
    },
    [currentAccount]
  );

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
      setVents([...vents]);
    });
    // console.log("context useEffect");
    // setVents(vents);
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
        parseEtherToWei,
        isSameChain,
        isSameAddress,
        //state
        flag,
        Vents,
        ownVents,
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
        switchNetwork,
        getVent,
        getAllVents,
        getOwnerVents,
        connectMetamask,
        transactionStatus,
        transaction,
        swapForm,
        setTransaction,
      }}
    >
      <Swap doswap={doswap} />
      {children}
    </VentContext.Provider>
  );
}
