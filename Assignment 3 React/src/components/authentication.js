import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import useSelector and useDispatch
import Login from './login';
import Register from './register';
import { logoutUser } from '../actions/authActions';
import { Nav, Button } from 'react-bootstrap';

const Authentication = () => {
  const [activeTab, setActiveTab] = useState('login');
  const dispatch = useDispatch(); 

  // Retrieve Redux state values
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const username = useSelector((state) => state.auth.username);

  // Switch tabs when user selects a tab
  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const userNotLoggedIn = (
    <div className="auth-container">
      {/* Render Nav tabs */}
      <Nav variant="tabs" activeKey={activeTab} onSelect={handleSelect} className="mb-3 dark-tabs justify-content-center">
        <Nav.Item>
          <Nav.Link eventKey="login">Login</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="register">Register</Nav.Link>
        </Nav.Item>
      </Nav>
      {/* Conditionally render based on the active tab */}
      {activeTab === 'register' ? <Register /> : <Login />}
    </div>
  );

  const userLoggedIn = (
    <div className="text-center">
      Logged in as: {username}{' '}
      <Button variant="outline-light" onClick={logout}>
        Logout
      </Button>
    </div>
  );

  return <div>{loggedIn ? userLoggedIn : userNotLoggedIn}</div>;
};

export default Authentication;