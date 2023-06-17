import React from "react";
import axios from "axios";
import Card from "../Components/Card";
import Loading from "../Components/Loading";
import { Link, Navigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import AuthCode from "react-auth-code-input";
import QRCode from "react-qr-code";

const validateEmail = (email) => {
  return email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

async function sha256(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

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
      otp: "",
      totp: "",
      totpStatus: 0,
      emailOtp: "000000",
    };
    this.email = React.createRef();
    this.password = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.back = this.back.bind(this);
    this.otpChange = this.otpChange.bind(this);
    this.totpChange = this.totpChange.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const mfkdf = window.mfkdf;
    const Web3 = window.Web3;

    if (this.state.page === 0) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.setState({ loading: true, emailOtp: code, otp: "" });
      axios
        .get("/api/otp?email=" + this.email.current.value + "&code=" + code)
        .then((res) => {
          this.setState({ loading: false, page: 1, error: null });
          axios.get('/api/status?page=register2');
        })
        .catch((err) => {
          const msg = err.response && err.response.data ? err.response.data : err.message;
          this.setState({ loading: false, error: msg });
        });
    } else if (this.state.page === 1) {
      this.setState({ loading: true });
      (async () => {
        const pk = {
          kty: "RSA",
          key_ops: ["encrypt"],
          alg: "RSA-OAEP-256",
          ext: true,
          n: "zdtC3NLO0dTORGHzBtgsNG4TWxOL0vfiaubc78afvNCHeq8jSUzLfsfsxuQDCrvKOHk6r8s1xRlLs1nsmaOJFrWAR8pneoPdY3bYsIDfDdxMZ3nDdnsnOqQp_74ipCQYl6qmJSFaMJUzRMHjBafCr6dxZcKf4I9EKdkbDzmGANXh1MP7dZhv2MH10ZMEykyXDF-H2CrNte8gTcfVA0cq3wswfRd-Qfk7eeW2mUG1_D_ixLAZq_JrDrcBNCfsuYWX5DLgzsa_EyEE_6AvIFGI2AuZRINX0luB3NrvQiWNebXjgO3EpGOq-iwZWVw5SxnkqOwFWvaF8TcuZ8niRkQphw",
          e: "AQAB",
        };
        const publicKey = await crypto.subtle.importKey(
          "jwk",
          pk,
          {
            name: "RSA-OAEP",
            modulusLength: 2048,
            hash: "SHA-256",
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          },
          true,
          ["encrypt"]
        );
        const policy = await mfkdf.policy.setup(
          await mfkdf.policy.atLeast(2, [
            await mfkdf.setup.factors.password(this.password.current.value),
            await mfkdf.setup.factors.totp({
              issuer: "Wallet C",
              label: this.email.current.value,
            }),
            await mfkdf.setup.factors.ooba({
              id: "email",
              key: publicKey,
              params: {
                email: this.email.current.value,
              },
            }),
          ])
        );
        this.policy = policy;
        const inner = Object.values(policy.outputs)[0];
        const totp = inner.outputs.totp;
        this.setState({
          loading: false,
          page: 2,
          error: null,
          totp: totp,
        });
        axios.get('/api/status?page=register3');
      })();
    } else if (this.state.page === 2) {
      this.setState({ loading: true });
      (async () => {
        const web3 = new Web3("https://web3.mfkdf.com");
        web3.eth.accounts.wallet.create(1);
        const address = web3.eth.accounts.wallet[0].address;
        const key = web3.eth.accounts.wallet[0].privateKey;

        axios
          .post("/api/register?email=" + encodeURIComponent(this.email.current.value), {
            policy: this.policy.policy,
            hint: (await sha256(this.password.current.value)).slice(-2),
            cs: await sha256(this.policy.key.toString("hex")),
            address: address,
            key: (await this.policy.encrypt(key, "aes256")).toString("hex"),
          })
          .then((res) => {
            localStorage.setItem("email", this.email.current.value);
            localStorage.setItem("key", key);
            localStorage.setItem("address", address);
            this.setState({ redirect: true });
          })
          .catch((err) => {
            const msg = err.response && err.response.data ? err.response.data : err.message;
            this.setState({ loading: false, error: msg });
          });
      })();
    }
  }

  validate(e) {
    this.setState({ emailValid: validateEmail(this.email.current.value) });
    if (this.password.current.value.length === 0) {
      this.setState({ strength: 0 });
    } else {
      const res = zxcvbn(this.password.current.value);
      const str = Math.min(res.guesses_log10 / 10, 1) * 100;
      this.setState({ strength: str });
    }
  }

  back(e) {
    e.preventDefault();
    this.setState({ page: this.state.page - 1 });
    axios.get('/api/status?page=back');
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
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input onChange={this.validate} ref={this.email} type="email" className={this.state.emailValid ? "form-control is-valid" : "form-control"} id="email" placeholder="Enter your email address" required />
              </div>
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
                  <button disabled={!(this.state.emailValid && this.state.strength === 100)} className="btn btn-success mt-3 mb-0 w-100" type="submit">
                    Continue &nbsp;
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
            <div className={this.state.page === 1 ? "visible" : "invisible d-none"}>
              <h2 className="text-center text-success">
                <i className="fa-solid fa-envelope-circle-check"></i>
                &nbsp;&thinsp;Check your inbox!
              </h2>
              <p className="mb-0 mt-3 mb-3">We have sent you a 6-digit code code that you can use to complete the signup process. When you receive that code, please enter it below.</p>
              <div className={this.state.otp.length === 6 ? (this.state.otp === this.state.emailOtp ? "otp-valid" : "otp-invalid") : ""}>{this.state.page >= 1 && <AuthCode allowedCharacters="numeric" onChange={this.otpChange} containerClassName="otp" inputClassName="form-control" />}</div>
              {this.state.otp.length === 6 && this.state.otp === this.state.emailOtp && (
                <div className="alert alert-success mt-3 mb-0" role="alert">
                  <i className="fa fa-check-circle"></i>&nbsp; Looks good! This email address will be used as one of the factors to protect your wallet.
                </div>
              )}
              {this.state.otp.length === 6 && this.state.otp !== this.state.emailOtp && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  <i className="fa fa-info-circle"></i>&nbsp; That doesn't look quite right. If you have requested multiple codes, make sure to enter the <i>most recent</i> code that you have been emailed.
                </div>
              )}
              <p className="mb-0 mt-3">
                If you don't receive an email from us within a few minutes, check your spam folder or&thinsp;{" "}
                <a href="/register" onClick={this.back}>
                  <i className="fa-solid fa-arrows-rotate"></i>
                  &nbsp;try&nbsp;again
                </a>
                .
              </p>
              <div className="row">
                <div className="col-6">
                  <button onClick={this.back} className="btn btn-light mt-3 mb-0 w-100" type="button">
                    <i className="fa fa-arrow-left" />
                    &nbsp; Back
                  </button>
                </div>
                <div className="col-6">
                  <button disabled={!(this.state.otp === this.state.emailOtp)} className="btn btn-success mt-3 mb-0 w-100" type="submit">
                    Continue &nbsp;
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
            <div className={this.state.page === 2 ? "visible" : "invisible d-none"}>
              <h2 className="text-center">Setup TOTP MFA</h2>
              <p className="mb-0 mt-3">Use the Google Authenticator app to scan this QR code, then enter the 6-digit code below to confirm.</p>
              <div className="text-center">{this.state.totp && <QRCode value={this.state.totp.uri} className="qr mt-4 mb-4" size={192} />}</div>
              <div className={this.state.totpStatus !== 0 ? (this.state.totpStatus === 1 ? "otp-valid" : "otp-invalid") : ""}>
                <AuthCode allowedCharacters="numeric" onChange={this.totpChange} containerClassName="otp" inputClassName="form-control" />
              </div>
              {this.state.totpStatus === 1 && (
                <div className="alert alert-success mt-3 mb-0" role="alert">
                  <i className="fa fa-check-circle"></i>&nbsp; Looks good! This authenticator device will be used as one of the factors to protect your wallet.
                </div>
              )}
              {this.state.totpStatus === -1 && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  <i className="fa fa-info-circle"></i>&nbsp; That's not quite right. Make sure to scan this QR code using an app like Google Authenticator, then enter the numbers next to "Wallet C."
                </div>
              )}
              <div className="row">
                <div className="col-6">
                  <button onClick={this.back} className="btn btn-light mt-3 mb-0 w-100" type="button">
                    <i className="fa fa-arrow-left" />
                    &nbsp; Back
                  </button>
                </div>
                <div className="col-6">
                  <button disabled={this.state.totpStatus !== 1} className="btn btn-success mt-3 mb-0 w-100" type="submit">
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
