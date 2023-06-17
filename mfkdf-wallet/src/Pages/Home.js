import React from "react";
import { Link } from "react-router-dom";

import Card from "../Components/Card";

class Home extends React.Component {
  render() {
    return (
      <Card wide>
        <div className="row">
          <div className="col-6 pe-0">
            <div className="p-4-5">
              <h3>Wallet C</h3>
              <p className="text-muted mt-0">MFKDF-Based Wallet &nbsp;&middot;&nbsp; <i>Sepolia Testnet</i></p>
              <p className="mt-3 mb-0">Wallet C is a decentralized, self-custody cryptocurrency wallet based on multi-factor key derivation (MFKDF) technology.</p>
              <Link to="/register" className="btn btn-success m-0 mt-4">
                <i className="fa fa-user-plus" />
                &nbsp; Sign Up
              </Link>
              <Link to="/login" className="btn btn-light m-0 mt-4 ms-2">
                <i className="fa fa-right-to-bracket" />
                &nbsp; Log In
              </Link>
            </div>
          </div>
          <div className="col-6 ps-0">
            <div className="embed-container">
              <iframe src="https://www.youtube.com/embed/0zr7xWKZWY4" frameBorder="0" allowFullScreen title="embed"></iframe>
            </div>
          </div>
        </div>
      </Card>
    );
  }
}

export default Home;
