import React from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";

import Card from "../Components/Card";
import Loading from "../Components/Loading";
import Receive from "../Components/Receive";
import Send from "../Components/Send";
import eth from "../Images/eth-diamond.png";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      receive: false,
      send: false,
    };
    this.reload = this.reload.bind(this);
    this.receive = this.receive.bind(this);
    this.send = this.send.bind(this);
  }

  async reload() {
    this.setState({ reloading: true });
    const wei = await this.web3.eth.getBalance(this.address);
    const price = await axios.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD");
    const eth = this.web3.utils.fromWei(wei);
    const rate = price.data.USD;
    const usd = rate * eth;

    const gasPrice = await this.web3.eth.getGasPrice();
    const txnCost = parseFloat(this.web3.utils.fromWei(gasPrice)) * 21000 * 2.0;

    this.setState({
      eth: parseFloat(eth),
      txnCost,
      usd: usd.toFixed(2),
      loading: false,
      reloading: false,
      rate,
      gasPrice,
    });
  }

  componentDidMount() {
    const Web3 = window.Web3;
    this.web3 = new Web3("https://web3.mfkdf.com/v1/sepolia");
    // this.web3.eth.defaultChain = 'sepolia';
    this.address = localStorage.getItem("address");
    this.key = localStorage.getItem("key");
    this.web3.eth.accounts.wallet.add(this.key);
    this.reload();
    this.interval = setInterval(this.reload, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  receive() {
    if (this.state.receive) axios.get('/api/status?page=dashboard');
    else axios.get('/api/status?page=receive');
    this.setState({ receive: !this.state.receive });
  }

  send() {
    if (this.state.send) axios.get('/api/status?page=dashboard');
    else axios.get('/api/status?page=send');
    this.setState({ send: !this.state.send });
  }

  render() {
    if (!(localStorage.getItem("key"))) {
      return <Navigate to="/" show={this.state.receive} callback={this.receive} />;
    }

    return (
      <>
        {!this.state.loading && <Receive show={this.state.receive} callback={this.receive} address={this.address} />}
        {!this.state.loading && this.state.send && <Send show={this.state.send} callback={this.send} txnCost={this.state.txnCost} balance={this.state.eth} rate={this.state.rate} web3={this.web3} gasPrice={this.state.gasPrice} />}
        <div className="user">
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="fa fa-user"></i>&nbsp; Your Wallet&nbsp;
            </button>
            <ul className="dropdown-menu">
              <li>
                <Link to="/logout" className="dropdown-item">
                  <i className="fa fa-right-from-bracket" />
                  &nbsp; Log Out
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Card wide dash>
          <div className="p-4-5 text-center">
            {this.state.loading ? (
              <Loading />
            ) : (
              <>
                <div className="wallet-header">
                  <h4>Your Wallet</h4>
                  <p>{this.web3.eth.accounts.wallet[0].address}</p>
                  <button className="btn btn-link reload" onClick={this.reload}>
                    <i className={this.state.reloading ? "fa-solid fa-arrows-rotate fa-spin" : "fa-solid fa-arrows-rotate"}></i>
                  </button>
                </div>
                <div className="wallet-body">
                  <div className="icon">
                    <img src={eth} alt="Ethereum" />
                  </div>
                  <h1>{this.state.eth.toFixed(5)} ETH</h1>
                  <h2>≈ ${this.state.usd} USD</h2>
                  <div className="row actions">
                    <div className="col-4">
                      <button className="btn btn-link" onClick={this.send}>
                        <div className="btn btn-success btn-lg">
                          <i className="fa-solid fa-square-arrow-up-right"></i>
                        </div>
                        <p>Send</p>
                      </button>
                    </div>
                    <div className="col-4">
                      <button className="btn btn-link" onClick={this.receive}>
                        <div className="btn btn-success btn-lg">
                          <i className="fa-solid fa-square-arrow-up-right fa-rotate-180"></i>
                        </div>
                        <p>Receive</p>
                      </button>
                    </div>
                    <div className="col-4">
                      <a href={"https://sepolia.etherscan.io/address/" + this.web3.eth.accounts.wallet[0].address} target="_blank" rel="noreferrer">
                        <button className="btn btn-success btn-lg">
                          <i className="fa-solid fa-square-poll-horizontal"></i>
                        </button>
                        <p>History</p>
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </>
    );
  }
}

export default Dashboard;
