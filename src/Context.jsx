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
//--Ssx
import { SSX } from "@spruceid/ssx";
import { defaultClientConfig, Types, Client } from "@spruceid/rebase-client";
import { WasmClient } from "@spruceid/rebase-client/wasm";
//--Axelar
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
    address: "0x40B8Ad69Ab7B80Eb3d3761A84A8459340e05E56C",
  },
  1287: {
    name: "Moonbeam",
    chainName: "Moonbase Alpha",
    chainId: 1287,
    native: "DEV",
    rpc: "https://rpc.api.moonbase.moonbeam.network/",
    gateway: "0x5769D84DD62a6fD969856c75c7D321b84d455929",
    usdc: "0xD1633F7Fb3d716643125d6415d4177bC36b7186b",
    address: "0xA6B3FD3F2fC910f0B5ED15cD1b39127b72572109",
  },
  80001: {
    name: "Polygon",
    chainName: "Polygon Mumbai",
    chainId: 80001,
    native: "MATIC",
    rpc: "https://matic-mumbai.chainstacklabs.com",
    gateway: "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B",
    usdc: "0x2c852e740B62308c46DD29B982FBb650D063Bd07",
    address: "0x2dd4350c0e41543bE302F471C3568485465B0cd1",
  },
  43113: {
    name: "Avalanche",
    chainName: "Avalanche Fuji",
    chainId: 43113,
    native: "AVAX",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    gateway: "0xC249632c2D40b9001FE907806902f63038B737Ab",
    usdc: "0x57F1c63497AEe0bE305B8852b354CEc793da43bB",
    address: "0x1A260eBD5006B53132eCAe60973c79c0Ddca8e3D",
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
    wei = wei.toString();
    if (wei2) {
      wei2 = wei2.toString();
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
  const logos = {
    avalanche: "avax.network",
    ethereum: "ethereum.org",
    polygon: "polygon.technology",
    fantom: "fantomnetwork.com",
    moonbeam: "moonbeam.network",
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
    {
      value: "moonbeam",
      label: "Moonbeam",
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

  const constants = useMemo(() => ({
    networks,
    logos,
    _coin,
  }));
  console.log("first", constants);
  //Variables
  //---Gloabal
  const [flag, setFlag] = useState({
    dashboard: false,
    lists: false,
    lists_joined: false,
  });
  const flagJoined = useCallback(
    (bool) => {
      setFlag({ ...flag, lists_joined: bool });
    },
    [flag]
  );
  const [joinedVents, setJoinedVents] = useState([]);
  const getJoinedVents = async () => {
    try {
      const _vents = await contract.getEventsOfStaff(currentAccount);
      flagJoined(true);
      setJoinedVents(_vents);
    } catch (er) {
      console.log("err", er);
    }
  };
  //---Modals
  const [sidebar, setSidebar] = useState({
    //For Vent Details
    show: false,
    width: 30,
    verified: false,
    cardOwner: "",
    showId: "",
    chainName: "",
    //For Spend and Sponsor
    show2: false,
    width2: 40,
    isSponsor: false,
  });
  const SidebarCtx = useMemo(
    () => ({
      sidebar,
      setSidebar,
    }),
    [sidebar]
  );

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

  //Handlers
  const handleSidebar = useCallback(
    (show, id, owner, network, verified) => {
      if (show) {
        setSidebar({
          ...sidebar,
          show,
          showId: id,
          chainName: network.toLowerCase(),
          cardOwner: owner,
          show2: false,
          verified,
        });
        return;
      }
      setSidebar({
        ...sidebar,
        show,
        show2: false,
        cardOwner: "",
        verified: false,
      });
    },
    [sidebar]
  );

  const handleSidebar2 = useCallback(
    (show2, chainName, uid, isSponsor) => {
      if (show2) {
        setSidebar({
          ...sidebar,
          show: false,
          show2,
          showId: uid,
          chainName: chainName.toLowerCase(),
          isSponsor,
        });
        return;
      }
      setSidebar({ ...sidebar, show2, show: false, shoqId: "", chainName: "" });
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

  function _showWarning(msg) {
    setLoading_modal(false);
    message.warning(msg);
  }

  //FORMS
  const handleAddForm = async (values, network, isPublic, credential) => {
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
    if (!name.match("^[a-zA-Z0-9_]*$")) {
      _showWarning("Name should not contain special charcters");
      return;
    }

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
        createVent(name, token, network, staffs, isPublic, credential);
      }
      return;
    }
    // message.success("Vent created");
    // handleModal(false);
    createVent(name, token, network, staffs, isPublic, credential);
  };

  const [swapFunction, setSwapFunction] = useState(() => () => {});
  const handlePayForm = async (
    values,
    amount,
    fromNetwork,
    setLoading,
    handleCancle
  ) => {
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
    setLoading(true);
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
      const source = CHAINS[coin(fromNetwork.toLowerCase()).chainId];
      const destination = CHAINS[coin(toNetwork.toLowerCase()).chainId];
      if (toCoin.includes(fromCoin)) {
        //======Cross Send======
        if (
          fromCoin.toLowerCase() === "aUSDC".toLowerCase() &&
          fromNetwork.toLowerCase() !== toNetwork.toLowerCase()
        ) {
          const amount_wei = parseFloat(amount) * 10 ** 6;

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
              ).then((tx) => {
                console.log("SEND", tx);
                updateBalance(
                  toNetwork.toString(),
                  vent2.uid,
                  amount_wei.toString()
                );
                handleCancle();
              });
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
            updateBalance(
              toNetwork.toString(),
              vent2.uid,
              amount_wei.toString()
            );
            handleCancle();
          })
          .catch((err) => {
            setLoading(false);
            message.error("Internal error");
            console.error(err);
          });
        return;
      }
      //======SWAP & SEND======
      // setSwapForm({
      //   fromCoin,
      //   fromNetwork,
      //   amount: amount.toString(),
      // });

      const res = await swapFunction(
        source.native,
        source.name,
        amount.toString(),
        source,
        destination,
        signer
      );
      console.log("res", res);
      if (res) {
        calculate_gasFee(source, destination).then(async (gasFee) => {
          contract
            .addSponsor_Gmp(
              vent2.uid,
              name,
              amount_wei,
              destination.name,
              destination.address,
              { value: gasFee }
            )
            .then((tx) => {
              console.log("SEND", tx);
              updateBalance(toNetwork.toString(), vent2.uid, amount.toString());
            });
        });
      }
      // setLoading(false);
      // handleCancle();
      // open the loader form
      // setButtonTitle("Swap & Send");
    } else {
      switchNetwork(fromNetwork);
      setLoading(false);
    }
    message.success("All good");
  };

  //
  //=====BlockChain
  //
  //--CHECKERS
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
  const sanityCheck = () => {
    if (!rebaseClient) throw new Error("Rebase client is not configured");
    if (!signer) throw new Error("Signer is not connected");
  };

  const [currentAccount, setCurrentAccount] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [signer, setSigner] = useState("");

  const [contract, setContract] = useState();
  const [ssxProvider, setSsx] = useState();
  const [rebaseClient, setRebaseClient] = useState();

  //---METAMASK
  const connectMetamask = useCallback(async () => {
    _checkEthereum();

    const provider = new ethers.providers.Web3Provider(ethereum);
    setSigner(provider.getSigner());

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

      console.log("_contract", CHAINS[_chainId].address);
      const _contract = new Contract(
        CHAINS[_chainId].address,
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

    // const chainId = _coin[currentNetwork.toLowerCase()].chainId;
    const switch_chainId = _coin[switch_network.toLowerCase()].chainId;

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

  //--SIGN-IN-WITH-ETHEREUM
  const [apply, setApply] = useState(false);
  const connectSignInWithEthereum = useCallback(async () => {
    _checkEthereum();

    const _ssx = new SSX({
      siweConfig: {
        statement: "Sign into Vent to access your Verifiable eVents!",
      },
      modules: {
        storage: {
          prefix: "vent",
        },
        credentials: true,
      },
      resolveEns: true,
    });

    setSsx(_ssx);
    const session = await _ssx.signIn();

    if (session) {
      setCurrentAccount(session.walletAddress);
    }

    setSigner(_ssx.getSigner());
    setRebaseClient(
      new Client(new WasmClient(JSON.stringify(defaultClientConfig())))
    );

    const _chainId = session.chainId.toString();
    if (!Object.keys(CHAINS).includes(_chainId)) {
      message.warning(
        `This network ${_chainId} doesn't support, Please change!`
      );
    } else {
      setCurrentNetwork(CHAINS[_chainId].name);

      const _contract = new Contract(
        CHAINS[_chainId].address,
        ventAbi,
        _ssx.getSigner()
      );
      setContract(_contract);
    }

    message.success("Signed in with SIWE!");

    let { data } = await _ssx.storage.list();
    console.log(data);
    data = data.filter((d) => d.includes("vent/credentials/"));

    if (data.length > 0) {
      message.info("Verification data avalaiable");
      setCredentialList(data);
      setApply(false);
    } else {
      message.warning("You have to verify!");
      setApply(true);
    }
    setConnectModal(false);
  }, [currentAccount, currentNetwork]);

  const toSubject = (chainId, address) => {
    return {
      pkh: {
        eip155: {
          address: address,
          chain_id: chainId,
        },
      },
    };
  };

  const statement = async (credentialType, content) => {
    sanityCheck();

    const chainId = ssxProvider?.chainId().toString();
    const obj = {};

    obj[credentialType] = Object.assign(
      { subject: toSubject(chainId, currentAccount) },
      content
    );
    console.log(obj);
    const req = {
      Attestation: obj,
    };

    const resp = await rebaseClient?.statement(req);
    if (!resp?.statement) {
      throw new Error("No statement found in witness response");
    }
    return resp.statement;
  };

  const witness = async (credentialType, content, signature) => {
    sanityCheck();

    const chainId = ssxProvider?.chainId().toString();
    const obj = {};

    obj[credentialType] = {
      signature,
      statement: Object.assign(
        { subject: toSubject(chainId, currentAccount) },
        content
      ),
    };
    const req = {
      Attestation: obj,
    };

    const resp = await rebaseClient?.witness_jwt(req);
    if (!resp?.jwt) {
      throw new Error("No jwt found in witness response");
    }
    return resp.jwt;
  };

  const issueVerification = async (idNumber) => {
    try {
      const fileName = "credentials/post_" + Date.now();
      const credentialType = "BasicPostAttestation";

      const content = {
        title: "Id",
        body: idNumber,
      };

      console.log("content", content);
      const stmt = await statement(credentialType, content);
      const sig = (await signer?.signMessage(stmt)) ?? "";
      const jwt_str = await witness(credentialType, content, sig);

      await ssxProvider.storage.put(fileName, jwt_str);
      setApply(false);
      setCredentialList((prevList) => [...prevList, `vent/${fileName}`]);
    } catch (e) {
      console.error(e);
    }
  };
  const [credentialList, setCredentialList] = useState([]);

  const getCredentialList = async () => {
    let { data } = await ssxProvider.storage.list();
    console.log("lists", data);
    data = data.filter((d) => d.includes("/credentials/"));
    setCredentialList(data);
    return data;
  };
  //
  //
  //====VENTS use Contract
  const createVent = async (
    name_,
    token_,
    network_,
    staffs_,
    isOpen,
    credential
  ) => {
    try {
      //Listening for EventAdded event
      contract.once("EventAdded", async (name, owner, eventId) => {
        //Mongodb add event
        console.log("EventAdded", name, owner, eventId);
        let args = {
          uid: ethers.BigNumber.from(eventId).toNumber(),
          name,
          owner,
          chainName: network_,
          token: token_,
          public: isOpen,
          verified: credential ? true : false,
          credential: credential ? credential : "",
        };
        console.log("EventAdded 1", args);

        await VentDB.post("/", args);

        setVents([args, ...Vents]);
        setOwnVents([args, ...ownVents]);

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
      const usdc = new Contract(source.usdc, IERC20.abi, signer);

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

  //
  //
  //=====DB
  async function updateBalance(chainName, id, amount) {
    await VentDB.put(`/balance/${chainName}/${id}`, { balance: amount });
  }

  const [Vents, setVents] = useState([]);
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

  const [savedVents, setSavedVents] = useState([]);
  const getSavedVents = async () => {
    if (savedVents.length > 0 && flag.lists) return savedVents;

    const { data } = await VentDB.get(`/saved/${currentAccount}`);

    setSavedVents(data.vent);
    setFlag({ ...flag, lists: true });
    return data.vent;
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

  const updateVentName = useCallback(
    async (name, updatedName) => {
      const updatedVents = Vents.map((vent) => {
        if (vent.name === name) {
          vent.name = updatedName;
        }
        return vent;
      });
      setVents(updatedVents);
    },
    [Vents]
  );

  const updateVentSave = useCallback(
    async (chainName, id, isSave, address) => {
      let updatedVents = Vents.map((vent) => {
        if (vent.chainName === chainName && vent.uid === id) {
          if (isSave) {
            vent.saved = [...vent.saved, address];
            console.log(savedVents);
          } else {
            vent.saved = vent.saved.filter((_address) => _address !== address);
          }
        }
        return vent;
      });
      setVents(updatedVents);
      setFlag({ ...flag, lists: false });
    },
    [Vents]
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
  }, []);

  return (
    <VentContext.Provider
      value={{
        //Constants
        constants,
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
        flagJoined,
        Vents,
        ownVents,
        savedVents,
        SidebarCtx,
        modal,
        apply,
        loading_modal,
        connectModal,
        //--blockchain
        currentNetwork,
        currentAccount,
        ssx: ssxProvider,
        Contract: contract,
        credentialList,
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
        getAllVents,
        getSavedVents,
        getOwnerVents,
        getJoinedVents,
        joinedVents,
        updateVentSave,
        //
        setSwapFunction,
        connectMetamask,
        connectSignInWithEthereum,
        issueVerification,
        getCredentialList,
        updateVentName,
        //
        transactionStatus,
      }}
    >
      <Swap />
      {children}
    </VentContext.Provider>
  );
}
