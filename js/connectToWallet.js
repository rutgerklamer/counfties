// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal;
let web3, web3wallet;
let contract;
let hrefBscscan = "https://bscscan.com";
let lastClicked = "empty";
// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

let connected = true;

let networkId = 56;


/**
 * Setup the orchestra
 */
function init() {
    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    //    console.log("Fortmatic is", Fortmatic);
    console.log("window.ethereum is", window.ethereum);

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                rpc: {
                    56: "wss://floral-rough-snow.bsc.quiknode.pro/",
                    // ...
                },
                chainId: 56,
                rpcUrl: "wss://floral-rough-snow.bsc.quiknode.pro/",
            },
        },
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}

async function onConnect() {
    init();
    web3wallet = new Web3(window.ethereum);
    networkId = await web3wallet.eth.net.getId();
    if (networkId == 97) {
        document.getElementById("network").innerHTML = "Test net";
    } else if (networkId == 56) {
        document.getElementById("network").innerHTML = "Main net";
    }
    connectToContract();

    console.log("Opening a dialog", web3Modal);

    if (connected) {
        try {
            provider = await web3Modal.connect();
            console.log(provider);
            connectBtn.value = "Connected";
            $("#connectBtn").removeClass("glow");
            selectedAccount = await web3wallet.eth.getAccounts()[0];
            contract = new web3wallet.eth.Contract(contractAbi, contractAddress);
        } catch (e) {
            console.log("Could not get a wallet connection", e);
            return;
        }
    }
    $("#buyCountry").removeClass("notAvailable")
    document.getElementById("buyCountry").value = "Add message and buy country";
    hideAll();

}

async function checkingConnections() {


    const checkAccount = await web3wallet.eth.getAccounts();
    if (checkAccount.length > 0) {
        selectedAccount = checkAccount[0];
        ethereum.enable();
        connected = true;
        connectBtn.value = "Connected";
        $("#connectBtn").removeClass("glow");
    }

    return checkAccount;
}


async function connectToContract() {
    showAll();
    if (networkId === 97) {
        document.getElementById("network").innerHTML = "Test net";
        web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545/");
        contractAddress = "0x0567226d0b29bb965B0DC8217115d1983CEbb7df";
        hrefBscscan = "https://testnet.bscscan.com"
    } else if (networkId === 56) {
        document.getElementById("network").innerHTML = "Main net";
        contractAddress = "0x3016F9645Cacf44440E37f24E56DBaB0Aa7033ac";
        web3 = new Web3("https://bsc-dataseed.binance.org/");
    } else {
        alert("Please change your network provider to the Binance Smart Chain (or testnet)");
    }

    try {
        contract = new web3.eth.Contract(contractAbi, contractAddress);
    } catch (e) {
        console.log(e);
    }
}

async function getData(id, name) {
    document.getElementById("countryName").innerHTML = name;
    document.getElementById("countryId").innerHTML = id;
    let price = await contract.methods.getValueOfCountry(id).call();
    if (price == 0) {
        price = 0.01;
    } else {
        price = web3.utils.fromWei(price, "ether");
    }
    document.getElementById("countryPrice").innerHTML = price;
    let owner = await contract.methods.getCountryOwner(id).call();
    document.getElementById("countryOwner").innerHTML = owner;
    document.getElementById("countryOwner").href = hrefBscscan + "/address/" + owner;
    let message = await contract.methods.getMessage(id).call();
    document.getElementById("countryMessage").innerHTML = message;
}

async function refreshCountry() {
    await getLeaderboard();
    let id = document.getElementById("countryId").innerHTML;
    let name = document.getElementById("countryName").innerHTML;
    getData(id, name);
    setTimeout(refreshCountry, 5000);
    hideAll();
}

async function buyCountry() {
    showAll();
    if (document.getElementById("countryId").innerHTML == "") {
        return;
    }
    checkingConnections();

    let id = document.getElementById("countryId").innerHTML;
    let price = await contract.methods.getValueOfCountry(id).call();
    if (price == 0) {
        price = "10000000000000000";
    }

    await contract.methods.buyCountry(id, document.getElementById("newCountryMessage").value).send({
        from: selectedAccount,
        value: price
    });
    hideAll();
}

function blink() {
    $("#connectBtn").addClass("blink");
}

async function getFirstCountry() {
    let prices = await contract.methods.getTopCountriesPrices().call();
    if (prices[4][1] != "N/A") {
        highlightCountry(prices[4][1], countryListAlpha3[prices[4][1]]);
    }
    refreshCountry();
}

async function getLeaderboard() {
    let prices = await contract.methods.getTopCountriesPrices().call();
    console.log(prices[4][0]);
    document.getElementById("firstPlace").innerHTML = web3.utils.fromWei(prices[4][0], "ether") + " - " + prices[4][1] + " - " + (countryListAlpha3[prices[4][1]] == null ? "" : countryListAlpha3[prices[4][1]]);
    document.getElementById("firstPlace").onclick = function() {
        if (prices[4][1] != "N/A") {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, "slow");
            highlightCountry(prices[4][1], countryListAlpha3[prices[4][1]]);
        }
    };
    document.getElementById("secondPlace").innerHTML = web3.utils.fromWei(prices[3][0], "ether") + " - " + prices[3][1] + (countryListAlpha3[prices[3][1]] == null ? "" :" - " + countryListAlpha3[prices[3][1]]);
    document.getElementById("secondPlace").onclick = function() {
        if (prices[3][1] != "N/A") {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, "slow");

            highlightCountry(prices[3][1], countryListAlpha3[prices[3][1]]);
        }
    };
    document.getElementById("thirdPlace").innerHTML = web3.utils.fromWei(prices[2][0], "ether") + " - " + prices[2][1] + (countryListAlpha3[prices[2][1]] == null ? "" :" - " + countryListAlpha3[prices[2][1]]);
    document.getElementById("thirdPlace").onclick = function() {
        if (prices[2][1] != "N/A") {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, "slow");

            highlightCountry(prices[2][1], countryListAlpha3[prices[2][1]]);
        }
    };
    document.getElementById("fourthPlace").innerHTML = web3.utils.fromWei(prices[1][0], "ether") + " - " + prices[1][1];
    document.getElementById("fourthPlace").onclick = function() {
        if (prices[1][1] != "N/A") {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, "slow");

            highlightCountry(prices[1][1], countryListAlpha3[prices[1][1]]);
        }
    };
    hideAll();
}

function moveToCountry(country) {
    for (i = 0; i < worldData.features.length; i++) {
        if (worldData.features[i].id == country) {
            let targetItem = worldData.features[i].geometry.coordinates[0][worldData.features[i].geometry.coordinates[0].length - 1];
            if (targetItem.length > 2) {
                targetItem = targetItem[targetItem.length - 1];
            }
            projection.origin([targetItem[0], targetItem[1]])
            console.log(targetItem)
            circle.origin(projection.origin());
            refresh();
            break;
        }
    }
}

function highlightCountry(country, name) {
    // Move cam to the country @moveToCountry();
    console.log(country)
    document.getElementById(lastClicked).style.fill = getComputedStyle(document.documentElement).getPropertyValue('--country');
    document.getElementById(country).style.fill = getComputedStyle(document.documentElement).getPropertyValue('--countrySelect');
    getData(country, name);
    lastClicked = country;
}

function getOptions() {
    return {
        fadeDuration: 1,
        hideOnClick: true,
        hideOnESC: true,
        findOnResize: true
    };
}

async function resetProgram() {
    showAll();
    await onConnect();
    await connectToContract();
    await getLeaderboard();
}

$(document).ready(async function() {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
        resetProgram();
    });

    window.ethereum.on("chainChanged", (chainId) => {
        resetProgram();
    });

    window.ethereum.on("networkChanged", (networkId) => {
        resetProgram();
    });
  }

    projection.scale(document.getElementById("worldGlobe").getBoundingClientRect().width / 2).translate([document.getElementById("worldGlobe").getBoundingClientRect().width / 2, document.getElementById("worldGlobe").getBoundingClientRect().width / 2]);
    refresh();
    connectToContract();
    getFirstCountry();
    hideAll();
});
