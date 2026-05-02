import React, { useState } from 'react';
import { submitRegister } from '../actions/authActions';
import { useDispatch } from 'react-redux';
import { Form, Button } from 'react-bootstrap';

function Register() {
    const [details, setDetails] = useState({
        name: '',
        username: '',
        password: ''
    });

    const dispatch = useDispatch();

    const updateDetails = (event) => {
        setDetails({
          ...details,
            [event.target.id]: event.target.value
        });
    };

    const register = () => {
        dispatch(submitRegister(details));
    };

    return (
        <div className="register-container">
            <Form className='register-form bg-dark text-light p-4 rounded'>
                <Form.Group controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control onChange={updateDetails} value={details.name} type="text" placeholder="Name" />
                </Form.Group>

                <Form.Group controlId="username">
                    <Form.Label>Email</Form.Label>
                    <Form.Control onChange={updateDetails} value={details.username} autoComplete="username" type="email" placeholder="Enter email" />
                </Form.Group>

                <Form.Group controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control onChange={updateDetails} value={details.password} autoComplete="current-password" type="password" placeholder="Password" />
                </Form.Group>
                <Button onClick={register}>Register</Button>
            </Form>
        </div>
    );
}

export default Register;