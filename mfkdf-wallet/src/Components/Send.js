import React from "react";
import eth from "../Images/eth-diamond.png";
import Loading from "../Components/Loading";

class Send extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 0, usd: 0, valid: false };
    this.change = this.change.bind(this);
    this.addr = this.addr.bind(this);
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();
    this.setState({ loading: true });
    const obj = this;
    const web3 = this.props.web3;
    web3.eth
      .sendTransaction({
        from: web3.eth.accounts.wallet[0],
        to: this.state.address,
        value: web3.utils.toWei(web3.utils.toBN(Math.round(this.state.value * 1000000)), "microether"),
        gas: 21000,
        gasPrice: this.props.gasPrice * 2,
      })
      .on("transactionHash", function (hash) {
        obj.setState({ transactionHash: hash });
      })
      .on("receipt", function () {
        obj.setState({ success: true, confirmations: 0 });
      })
      .on("confirmation", function (number) {
        obj.setState({ confirmations: number });
      });
  }

  change(e) {
    const usd = e.target.value * this.props.rate;
    this.setState({ value: e.target.value, usd });
  }

  addr(e) {
    this.setState({ valid: this.props.web3.utils.isAddress(e.target.value), address: e.target.value });
  }

  render() {
    const available = this.props.balance - this.props.txnCost;

    return (
      <div className="receive">
        <div className={this.props.show ? "modal-backdrop fade show" : "modal-backdrop fade pe-none"}></div>
        <div className={this.props.show ? "modal fade show d-block" : "modal fade"} onClick={this.props.callback}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <form onSubmit={this.submit}>
                <div className="icon">
                  <img src={eth} alt="Ethereum" />
                </div>
                <div className="modal-header">
                  <button onClick={this.props.callback} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body text-center">
                  {this.state.loading ? (
                    <>
                      {this.state.success ? (
                        <>
                          <h4>ETH Sent!</h4>
                          <p>
                            Your transfer of {parseFloat(this.state.value).toFixed(6)} ETH (≈ {this.state.usd.toFixed(2)} USD) to recipient {this.state.address.slice(0, 6)}&hellip;{this.state.address.slice(-4)} was successful.
                          </p>
                          <p>
                            <b>Transaction ID:</b>{" "}
                            <a href={"https://sepolia.etherscan.io/tx/" + this.state.transactionHash} target="_blank" rel="noreferrer">
                              {this.state.transactionHash.slice(0, 10)}&hellip;{this.state.transactionHash.slice(-8)} <i className="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                          </p>
                          <div className="alert alert-success mt-3 mb-0" role="alert">
                            <i className="fa fa-check-circle"></i>&nbsp; Your transaction has been confirmed {this.state.confirmations} times so far. You can safely leave this page.
                          </div>
                        </>
                      ) : (
                        <>
                          <h4>Sending ETH...</h4>
                          <Loading />
                          {this.state.transactionHash && (
                            <>
                              <div className="alert alert-info mt-3 mb-0" role="alert">
                                <i className="fa fa-info-circle"></i>&nbsp; Your transaction has been created (
                                <a href={"https://sepolia.etherscan.io/tx/" + this.state.transactionHash} target="_blank" rel="noreferrer">
                                  view details <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </a>
                                ) and is being processed now.
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {available < 0 ? (
                        <>
                          <h4>Send ETH</h4>
                          <div className="alert alert-danger mt-3 mb-0" role="alert">
                            <i className="fa fa-exclamation-circle"></i>&nbsp; {this.props.txnCost.toFixed(6)} ETH is needed for transaction fees, so there's not enough ETH to send.
                          </div>
                        </>
                      ) : (
                        <>
                          <h4>Send ETH</h4>
                          <div className="alert alert-info mt-3 mb-3" role="alert">
                            <i className="fa fa-info-circle"></i>&nbsp; {this.props.txnCost.toFixed(6)} ETH is needed for transaction fees, so up to {available.toFixed(6)} ETH can be sent.
                          </div>
                          <div className="text-start">
                            <div className="form-group mb-3">
                              <label>Recipient Address</label>
                              <input type="text" className={this.state.valid ? "form-control is-valid" : "form-control"} placeholder="Enter Recipient Address" onChange={this.addr} />
                            </div>
                            <div className="form-group">
                              <label>Transaction Amount</label>
                              <div className="input-group">
                                <input type="number" className="form-control" min={0} max={available} step={0.000001} onChange={this.change} value={this.state.value} />
                                <span className="input-group-text">ETH</span>
                              </div>
                              <input type="range" className="form-range mb-0" min={0} max={available} step={0.000001} onChange={this.change} value={this.state.value} />
                              <div className="form-text text-end mt-0">≈ {this.state.usd.toFixed(2)} USD</div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                {!this.state.loading && (
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-success" disabled={!(this.state.valid && this.state.value > 0)}>
                      Send
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={this.props.callback}>
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Send;
