import React, { Fragment,useState } from 'react'
import {Link} from 'react-router-dom'

const Login = () => {
    const [formData,setFormData] = useState({
        name :'',
        password:''
    })

    const {name,password} = formData

    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name] : e.target.value
        })
    }

    return (
        <Fragment>
            <section className="container">
                <div className="alert alert-danger">
                    Invalid credentials
                </div>
                <h1 className="large text-primary">Sign In</h1>
                <p className="lead"><i className="fas fa-user"></i> Sign into Your Account</p>
                <br />
                <form className="form" action="dashboard.html">
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            name="email"
                            required
                            value={name}
                            onChange={e=>handleChange(e)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            required
                            value={password}
                            onChange={e=>handleChange(e)}
                        />
                    </div>
                    <input type="submit" className="btn btn-primary" value="Login" />
                </form>
                <p className="my-1">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </section>
        </Fragment>
    )
}

export default Login