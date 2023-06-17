import React from "react";
import axios from "axios";
import Card from "../Components/Card";
import Loading from "../Components/Loading";
import { Link, Navigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailValid: false,
      loading: false,
      success: false,
      error: false,
      strength: 0,
      page: 0,
      downloaded: false,
      rc: '',
      phrase: ''
    };
    this.email = React.createRef();
    this.password = React.createRef();
    this.rce = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.back = this.back.bind(this);
    this.dl = this.dl.bind(this);
    this.onrc = this.onrc.bind(this);
    this.pbutton = this.pbutton.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const Web3 = window.Web3;

    if (this.state.page === 0) {
      axios.get('/api/status?page=register2');
      const web3 = new Web3("https://web3.mfkdf.com");
      web3.eth.accounts.wallet.create(1);
      const address = web3.eth.accounts.wallet[0].address;
      const key = web3.eth.accounts.wallet[0].privateKey;
      this.address = address;
      this.key = key;
      this.rc = bip39.entropyToMnemonic(Buffer.from(key.replace('0x', ''), 'hex'), wordlist);
      this.words = this.rc.split(" ")
      this.words.sort()
      this.ct = JSON.stringify(web3.eth.accounts.wallet[0].encrypt(this.password.current.value));
      this.setState({loading: false, page: 1, error: null, downloaded: false, phrase: ""});
    } else if (this.state.page === 1) {
      axios.get('/api/status?page=register3');
      this.setState({loading: false, page: 2, error: null, phrase: ""});
    } else if (this.state.page === 2) {
      localStorage.setItem("key", this.key);
      localStorage.setItem("address", this.address);
      this.setState({ loading: true, redirect: true });
    }
  }

  validate(e) {
    if (this.password.current.value.length === 0) {
      this.setState({ strength: 0 });
    } else {
      const res = zxcvbn(this.password.current.value);
      const str = Math.min(res.guesses_log10 / 10, 1) * 100;
      this.setState({ strength: str });
    }
  }

  onrc() {
    this.setState({rc: this.rce.current.value})
  }

  dl(e) {
    this.setState({downloaded: true})
  }

  back(e) {
    e.preventDefault();
    this.setState({ page: this.state.page - 1 });
    axios.get('/api/status?page=back');
  }

  pbutton(e) {
    e.preventDefault();
    const val = e.target.innerText;
    if (this.state.phrase.includes(val)) {
      this.setState({
        phrase: this.state.phrase.replace(val + " ", "")
      })
    } else {
      this.setState({
        phrase: this.state.phrase + val + " "
      })
    }
  }

  otpChange(val) {
    this.setState({ otp: val });
  }

  totpChange(val) {
    if (val.length === 6) {
      window.otplib.totp.options = { digits: 6, window: 2 };
      if (window.otplib.totp.check(val, this.state.totp.secret)) {
        this.setState({ totpStatus: 1 });
      } else {
        this.setState({ totpStatus: -1 });
      }
    } else {
      this.setState({ totpStatus: 0 });
    }
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
              <h2 className="text-center">Create your account</h2>
              <div className="mt-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input ref={this.password} onChange={this.validate} type="password" className={this.state.strength === 100 ? "form-control is-valid" : "form-control"} id="password" placeholder="Create a password" />
                {this.state.strength > 0 && (
                  <>
                    <div className="progress strength mt-2">
                      <div className={this.state.strength === 100 ? "progress-bar bg-success" : this.state.strength >= 50 ? "progress-bar bg-warning" : "progress-bar bg-danger"} style={{ width: this.state.strength + "%" }}></div>
                    </div>
                  </>
                )}
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
                  <button disabled={!(this.state.strength === 100)} className="btn btn-success mt-3 mb-0 w-100" type="submit">
                    Continue &nbsp;
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
            <div className={this.state.page === 1 ? "visible" : "invisible d-none"}>
              <h2 className="text-center">
                Save your factors
              </h2>

              <div className="mt-3">
                <label htmlFor="password" className="form-label">
                  Key file
                </label>
                <a onClick={this.dl} className="btn btn-primary mb-0 w-100" type="button" href={'data:text/plain;charset=utf-8,' + encodeURIComponent(this.ct)} download="wallet.json">
                  <i className="fa fa-download" />
                  &nbsp; Download
                </a>
              </div>


              <div className="mt-3">
                <label htmlFor="password" className="form-label">
                  Recovery phrase
                </label>
                <div className="form-text mb-3">Your secret recovery phrase is a 24-word phrase that is the "master key" to your wallet and funds.</div>
                <textarea type="text" className="form-control" readOnly value={this.rc} rows={4} />
              </div>


              <div className="row">
                <div className="col-6">
                  <button onClick={this.back} className="btn btn-light mt-3 mb-0 w-100" type="button">
                    <i className="fa fa-arrow-left" />
                    &nbsp; Back
                  </button>
                </div>
                <div className="col-6">
                  <button disabled={!this.state.downloaded} className="btn btn-success mt-3 mb-0 w-100" type="submit">
                    Continue &nbsp;
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
            <div className={this.state.page === 2 ? "visible" : "invisible d-none"}>
              <h2 className="text-center">Confirm recovery phrase</h2>

              <div className="mt-3">
                <label htmlFor="password" className="form-label">
                  Recovery phrase
                </label>
                <textarea type="text" className="form-control" ref={this.rce} rows={4} placeholder="" value={this.state.phrase} readOnly onChange={this.onrc}  />
                <div className="form-text">
                  Please select each word in order to make sure it is correct.
                </div>
              </div>

              <div className="row">
                {this.rc && this.words.map(word => <>
                  <div className="col-3">
                    <button onClick={this.pbutton} className={this.state.phrase.includes(word) ? "btn btn-light btn-sm mt-3 mb-0 w-100 active" : "btn btn-secondary btn-sm mt-3 mb-0 w-100"} type="button">{word}</button>
                  </div>
                </>)}
              </div>

              <div className="row">
                <div className="col-6">
                  <button onClick={this.back} className="btn btn-light mt-3 mb-0 w-100" type="button">
                    <i className="fa fa-arrow-left" />
                    &nbsp; Back
                  </button>
                </div>
                <div className="col-6">
                  <button disabled={this.state.phrase.trim() !== this.rc} className="btn btn-success mt-3 mb-0 w-100" type="submit">
                    Continue &nbsp;
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
          </form>
          {this.state.error && !this.state.loading && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              {this.state.error === "User exists" ? (
                <>
                  <i className="fa fa-info-circle"></i>&nbsp; It looks like you already have an account! Instead of creating a new one, try to{" "}
                  <Link to="/login">
                    <i className="fa fa-right-to-bracket"></i> log in
                  </Link>
                  .
                </>
              ) : (
                <>
                  <i className="fa fa-triangle-exclamation"></i>&nbsp; <b>Error: </b>
                  {this.state.error}
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
}

export default Register;
