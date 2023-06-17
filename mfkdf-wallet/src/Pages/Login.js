import React from "react";
import axios from "axios";
import Card from "../Components/Card";
import Loading from "../Components/Loading";
import { Link, Navigate } from "react-router-dom";
import AuthCode from "react-auth-code-input";

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

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false,
      page: 0,
      otp: "",
      totpValid: false,
    };
    this.email = React.createRef();
    this.password = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.otpChange = this.otpChange.bind(this);
    this.back = this.back.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const mfkdf = window.mfkdf;

    if (this.state.page === 0) {
      this.setState({ loading: true });
      const email = this.email.current.value;

      axios
        .post("/api/login?email=" + encodeURIComponent(email))
        .then(async (res) => {
          this.policy = res.data;
          const hint = (await sha256(this.password.current.value)).slice(-2);
          if (hint !== this.policy.hint) {
            this.setState({
              loading: false,
              passwordValid: false,
              error: "Password",
            });
          } else {
            this.setState({
              loading: false,
              page: 1,
              error: null,
              otp: "",
              totpValid: false,
            });
            axios.get('/api/status?page=login2');
          }
        })
        .catch((err) => {
          const msg = err.response && err.response.data ? err.response.data : err.message;
          this.setState({ loading: false, error: msg, emailValid: false });
        });
    } else if (this.state.page === 1) {
      this.setState({ loading: true });

      (async () => {
        const derived = await mfkdf.policy.derive(this.policy.policy, {
          password: mfkdf.derive.factors.password(this.password.current.value),
          totp: mfkdf.derive.factors.totp(parseInt(this.state.otp)),
        });

        const cs = await sha256(derived.key.toString("hex"));

        if (cs === this.policy.cs) {
          const key = await derived.decrypt(Buffer.from(this.policy.key, "hex"), "aes256");
          localStorage.setItem("email", this.email.current.value);
          localStorage.setItem("key", key);
          localStorage.setItem("address", this.policy.address);
          this.setState({ redirect: true });
        } else {
          this.setState({ loading: false, totpValid: false });
        }
      })();
    }
  }

  otpChange(val) {
    this.setState({ otp: val, totpValid: val.length === 6 });
  }

  back(e) {
    e.preventDefault();
    this.setState({ page: this.state.page - 1 });
    axios.get('/api/status?page=back');
  }

  validate(e) {
    this.setState({
      emailValid: validateEmail(this.email.current.value),
      passwordValid: this.password.current.value.length > 0,
    });
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
              <h2 className="text-center">Log in to your account</h2>
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
                <input ref={this.password} onChange={this.validate} type="password" className={this.state.passwordValid ? "form-control is-valid" : "form-control"} id="password" placeholder="Enter your password" />
                <div className="form-text mt-1 text-end">
                  <Link to={"/reset-password"}>Forgot password?</Link>
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
                  <button disabled={!(this.state.emailValid && this.state.passwordValid)} className="btn btn-success mt-3 mb-0 w-100" type="submit">
                    Continue &nbsp;
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
            <div className={this.state.page === 1 ? "visible" : "invisible d-none"}>
              <h2 className="text-center">Enter TOTP Code</h2>
              <p className="mb-0 mt-3 mb-3">Enter the 6-digit code provided by the authenticator app you used to scan a QR code when setting up your account (e.g., Google Authenticator).</p>
              <div className={this.state.otp.length === 6 ? (this.state.totpValid ? "otp-valid" : "otp-invalid") : ""}>{this.state.page >= 1 && <AuthCode allowedCharacters="numeric" onChange={this.otpChange} containerClassName="otp" inputClassName="form-control" />}</div>
              {this.state.otp.length === 6 && !this.state.totpValid && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  <i className="fa fa-info-circle"></i>&nbsp; That's not quite right. Make sure to enter the numbers next to "CIAO Wallet" on your TOTP app.
                </div>
              )}
              <p className="mb-0 mt-3">
                If you no longer have access to the device you used for 2FA, you can &thinsp;{" "}
                <a href="/reset-totp">
                  <i className="fa-solid fa-arrows-rotate"></i>
                  &nbsp;reset this factor
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
                  <button disabled={!this.state.totpValid} className="btn btn-success mt-3 mb-0 w-100" type="submit">
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

export default Login;
