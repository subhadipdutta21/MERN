import axios from 'axios'
import {setAlert} from './alert'
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR
} from './types'

import setAuthToken from '../utils/setAuthToken'

// load user
export const loadUser = () => async dispatch => {
    if(localStorage.token) {
        setAuthToken(localStorage.token)
    }
    try {
        const res = await axios.get('/api/auth')
        dispatch({
            type : USER_LOADED,
            payload : res.data
        })
    } catch (err) {
        dispatch({
            type : AUTH_ERROR
        })
    }
}

//register user
export const register = ({name, email, password}) => async dispatch => {
    const config ={
        headers : {
            'Content-Type' : 'application/json'
        }
    }

    const body = JSON.stringify({name,email,password})

    try {
        //goto server side/backend 
        // API call
        const res = await axios.post('/api/users', body, config)
        // if success dispacth an Action & go to Reducer
        dispatch({
            type : REGISTER_SUCCESS,
            payload : res.data
        })
    } catch (err) {
        // if failure dispacth an Action & go to Reducer
        const errors = err.respose.data.errors
        if(errors) {
            errors.forEach(error => dispatch(setAlert(error.msg,'danger')))
        }
        dispatch({
            type : REGISTER_FAIL
        })
    }
}

//Login user
export const login = (email, password) => async dispatch => {
    const config ={
        headers : {
            'Content-Type' : 'application/json'
        }
    }

    const body = JSON.stringify({email,password})

    try {
        //goto server side/backend 
        // API call
        const res = await axios.post('/api/auth', body, config)
        // if success dispacth an Action & go to Reducer
        dispatch({
            type : LOGIN_SUCCESS,
            payload : res.data
        })
    } catch (err) {
        // if failure dispacth an Action & go to Reducer
        const errors = err.respose.data.errors
        if(errors) {
            errors.forEach(error => dispatch(setAlert(error.msg,'danger')))
        }
        dispatch({
            type : LOGIN_FAIL
        })
    }
}