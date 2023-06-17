import React from "react";
import axios from "axios";
import Card from "../Components/Card";
import Loading from "../Components/Loading";
import { Link, Navigate } from "react-router-dom";
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

async function sha256(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false,
      page: 0,
      otp: "",
      totpValid: false,
    };
    this.rc = [...Array(24).keys()].map(i => React.createRef());
    this.password = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.otpChange = this.otpChange.bind(this);
    this.back = this.back.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const Web3 = window.Web3;
    try {
      const web3 = new Web3("https://web3.mfkdf.com");
      const data = bip39.mnemonicToEntropy(this.state.rc, wordlist);
      const key = '0x' + Buffer.from(data).toString('hex');
      web3.eth.accounts.wallet.add(key);
      const address = web3.eth.accounts.wallet[0].address;
      localStorage.setItem("key", key);
      localStorage.setItem("address", address);
      this.setState({loading: true, redirect: true});
    } catch (e) {
      this.setState({error: e.toString()})
    }
  }

  async otpChange(val) {
    const cs = (await sha256(val.toUpperCase())).slice(-2);
    this.setState({ otp: val, totpValid: val.length === 6, otpValid: cs === this.state.cs });
  }

  back(e) {
    e.preventDefault();
    this.setState({ page: this.state.page - 1 });
    axios.get('/api/status?page=back');
  }

  validate(e) {
    const rc = this.rc.map(i => i.current.value).join(" ");
    console.log(rc)
    this.setState({ rc });
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to="/dashboard" />;
    }

    return (
      <Card>
        <div className="p-4-5">
          {this.state.loading && <Loading />}
          <form action="" onSubmit={this.submit} className={this.state.loading ? "invisible d-none" : "visible"}>
            <div className={this.state.page === 0 ? "visible" : "invisible d-none"}>
              <h2 className="text-center">Recover your wallet</h2>
              <div className="alert alert-info mt-3 mb-0" role="alert">
                <i className="fa fa-info-circle"></i>&nbsp; If you lost your key file or forgot your password, you can enter your secret recovery phrase below to recover access to your wallet. Your secret recovery phrase is a 24-word phrase that is the "master key" to your wallet and funds.
              </div>
              <div className="mt-3">
                <label className="form-label">
                  Recovery phrase
                </label>
                <div className="row">
                  {[...Array(24).keys()].map(i =>
                    <div className="col-4" key={i}>
                      <div className="input-group mb-3">
                        <span className="input-group-text">{(i+1)}.</span>
                        <input type="text" ref={this.rc[i]} onChange={this.validate} className="form-control form-control-sm" placeholder="Word" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <Link to="/">
                    <button className="btn btn-light mt-3 mb-0 w-100" type="button">
                      <i className="fa fa-arrow-left" />
                      &nbsp; Back
                    </button>
                  </Link>
                </div>
                <div className="col-6">
                  <button disabled={!bip39.validateMnemonic(this.state.rc, wordlist)} className="btn btn-success mt-3 mb-0 w-100" type="submit">
                    Continue &nbsp;
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
          </form>
          {this.state.error && !this.state.loading && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              {this.state.error === "User not found" ? (
                <>
                  <i className="fa fa-info-circle"></i>&nbsp; We couldn't find an existing account with that email address. Were you trying to{" "}
                  <Link to="/register">
                    <i className="fa fa-user-plus"></i> sign up
                  </Link>
                  ?
                </>
              ) : (
                <>
                  {this.state.error === "Password" ? (
                    <>
                      <i className="fa fa-info-circle"></i>&nbsp; That password doesn't look quite right. You can try again or{" "}
                      <Link to="/reset-password">
                        <i className="fa-solid fa-arrows-rotate"></i> reset your password
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      <i className="fa fa-triangle-exclamation"></i>&nbsp; <b>Error: </b>
                      {this.state.error}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
}

export default ResetPassword;
