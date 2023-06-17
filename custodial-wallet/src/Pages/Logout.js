import React from "react";
import { Navigate } from "react-router-dom";

class Logout extends React.Component {
  render() {
    localStorage.removeItem("email");
    localStorage.removeItem("key");
    return <Navigate to="/" />;
  }
}

export default Logout;
