import React from "react";
import eth from "../Images/eth-diamond.png";
import QRCode from "react-qr-code";

class Receive extends React.Component {
  constructor(props) {
    super(props);
    this.state = { copy: false };
    this.copy = this.copy.bind(this);
  }

  copy() {
    navigator.clipboard.writeText(this.props.address);
  }

  render() {
    return (
      <div className="receive">
        <div className={this.props.show ? "modal-backdrop fade show" : "modal-backdrop fade pe-none"}></div>
        <div className={this.props.show ? "modal fade show d-block" : "modal fade"} onClick={this.props.callback}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="icon">
                <img src={eth} alt="Ethereum" />
              </div>
              <div className="modal-header">
                <button onClick={this.props.callback} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body text-center">
                <h4>Receive ETH</h4>
                <QRCode value={"ethereum:" + this.props.address} className="qr mt-4 mb-4" size={192} />
                <p>Other users can send ETH to your wallet by scanning the QR code or entering this address:</p>
                <div className="input-group mb-2">
                  <input type="text" className="form-control" value={this.props.address} onChange={() => {}} />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary" onClick={this.copy} type="button">
                      <i className={this.state.copy ? "fa fa-check" : "fa fa-clipboard"}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Receive;
