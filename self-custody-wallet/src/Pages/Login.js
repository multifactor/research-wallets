import React from "react";
import axios from "axios";
import Card from "../Components/Card";
import Loading from "../Components/Loading";
import { Link, Navigate } from "react-router-dom";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false,
      page: 0,
      otp: "",
      totpValid: false,
      file: null
    };
    this.email = React.createRef();
    this.password = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.otpChange = this.otpChange.bind(this);
    this.back = this.back.bind(this);
    this.file = this.file.bind(this);
  }

  submit(e) {
    e.preventDefault();
    const Web3 = window.Web3;
    this.setState({loading: true});
    try {
      const web3 = new Web3("https://web3.mfkdf.com");
      const fileReader = new FileReader();
      const password = this.state.password;
      const parent = this;
      fileReader.onload = function() {
        try {
          const data = JSON.parse(fileReader.result);
          const wallet = web3.eth.accounts.wallet.decrypt([data], password);
          const address = wallet[0].address;
          const key = wallet[0].privateKey;
          localStorage.setItem("key", key);
          localStorage.setItem("address", address);
          parent.setState({redirect: true});
        } catch (e) {
          parent.setState({loading: false, error: e.toString()})
        }
      }
      fileReader.readAsText(this.state.file);
    } catch (e) {
      this.setState({loading: false, error: e.toString()})
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
      passwordValid: this.password.current.value.length > 0,
      password: this.password.current.value
    });
  }

  file(e) {
    this.setState({file: e.target.files[0]})
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
              <h2 className="text-center">Upload your key file</h2>

              <div className="mb-3 mt-3">
                <label htmlFor="formFile" className="form-label">Select your key file</label>
                <input className="form-control" type="file" id="formFile" onChange={this.file} />
                <div className="form-text mt-1 text-end">
                  <Link to={"/reset"}>Lost key file?</Link>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input ref={this.password} onChange={this.validate} type="password" className="form-control" id="password" placeholder="Enter your password" />
                <div className="form-text mt-1 text-end">
                  <Link to={"/reset"}>Forgot password?</Link>
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
                  <button disabled={!(this.state.file && this.state.passwordValid)} className="btn btn-success mt-3 mb-0 w-100" type="submit">
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
