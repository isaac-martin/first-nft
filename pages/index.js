import Head from 'next/head';
import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';
import myEpicNft from '../nft/MyEpicNFT.json';

// Constants
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-2eo1b4lo9o';
const TOTAL_MINT_COUNT = 10;

const CONTRACT_ADDRESS = '0xF849356d311A355AD7960b9FdA60760Dcc9fA756';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [status, setStatus] = useState('');
  const [mintedCount, setMintedCount] = useState('X');

  React.useEffect(() => {
    checkNetwork();
    checkIfWalletIsConnected();
    checkNftCount();
  }, []);

  const checkNetwork = async () => {
    const {ethereum} = window;
    console.log(ethereum);

    try {
      let chainId = await ethereum.request({method: 'eth_chainId'});
      console.log('Connected to chain ' + chainId);
      const rinkebyChainId = '0x4';
      if (chainId !== rinkebyChainId) {
        alert('You are not connected to the Rinkeby Test Network!');
      }
    } catch {
      console.log('not connected');
    }

    // String, hex code of the chainId of the Rinkebey test network
  };

  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;

    /*
     * First make sure we have access to window.ethereum
     */

    if (!ethereum) {
      setStatus('Make sure you have metamask!');
      return;
    } else {
      setStatus('We have the ethereum object');
    }

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({method: 'eth_accounts'});

    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */

    console.log(accounts);
    if (accounts.length !== 0) {
      const account = accounts[0];
      setStatus('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      setStatus('No authorized account found');
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
    let chainId = await ethereum.request({method: 'eth_chainId'});
    console.log('Connected to chain ' + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = '0x4';
    if (chainId !== rinkebyChainId) {
      alert('You are not connected to the Rinkeby Test Network!');
    }
  };

  const checkNftCount = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        let nftCount = await connectedContract.getTotalNFTsMintedSoFar();
        const trueCount = nftCount.toNumber();
        console.log({nftCount, trueCount});
        setMintedCount(trueCount);
      } else {
        setStatus("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(window);
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setStatus(`We've minted your NFT and sent it to your wallet. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`);
        });

        setStatus('Going to pop wallet now to pay gas...');
        let nftTxn = await connectedContract.makeAnEpicNFT();

        setStatus('Mining...please wait.');
        await nftTxn.wait();

        setStatus(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        checkNftCount();
      } else {
        setStatus("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setStatus(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="App">
        <div className="container">
          <div className="header-container">
            {currentAccount === '' ? (
              renderNotConnectedContainer()
            ) : (
              /** Add askContractToMintNft Action for the onClick event **/
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
              </button>
            )}
            <p>{status}</p>
            <a href={OPENSEA_LINK}>View Opensea Collection</a>
            <p>
              {mintedCount}/{TOTAL_MINT_COUNT} minted
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
