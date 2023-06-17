import React from "react";
import icon from "../Images/icon-w.png";

class Card extends React.Component {
  render() {
    return (
      <div className="splash-bg">
        <div className="bg-image"></div>
        {this.props.dash && (
          <div className="ciao">
            <img className="logo" src={icon} alt="MFKDF" /> <span>Wallet A</span>
          </div>
        )}
        <div className={this.props.wide ? "form text-center wide" : "form text-center"}>
          {!this.props.dash && <img className="logo" src={icon} alt="MFKDF" />}
          <div className="card text-start p-0 overflow-hidden border-0">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default Card;
