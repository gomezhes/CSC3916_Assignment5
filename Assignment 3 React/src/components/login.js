import React, { useState } from 'react';
import { submitLogin } from '../actions/authActions';
import { useDispatch } from 'react-redux';
import { Form, Button } from 'react-bootstrap';

function Login() {
  const [details, setDetails] = useState({
    username: '',
    password: '',
  });

  const dispatch = useDispatch();

  const updateDetails = (event) => {
    setDetails({
      ...details,
      [event.target.id]: event.target.value,
    });
  };

  const login = (event) => {
    event.preventDefault(); // Prevent form from refreshing the page
    dispatch(submitLogin(details));
  };

  return (
    <div className="login-container">
        <Form onSubmit={login} className='login-form bg-dark text-light p-4 rounded'> {/* Use onSubmit for the form */}
        <Form.Group controlId="username" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
            type="email"
            placeholder="Enter email"
            autoComplete="username"
            value={details.username}
            onChange={updateDetails}
            />
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={details.password}
            onChange={updateDetails}
            />
        </Form.Group>
        <Button type="submit">Sign in</Button> {/* Use type="submit" */}
        </Form>
    </div>
  );
}

export default Login;