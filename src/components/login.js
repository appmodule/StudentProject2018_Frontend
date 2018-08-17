import React, { Component } from 'react'
import Axios from 'axios'
import '../App.css'
import '../styles/login.css'

const url = 'http://hq.appmodule.rs:2031/'
// const url = "https://tritum.serveo.net/"

class Login extends Component {

  Login () {
    this.userLoginCreate('user/login')
  }

  Create () {
    this.userLoginCreate('user/create')
  }


  keyEnter(event){
    if(event.key === 'Enter'){
      this.Login();
    }
  }
  

  userLoginCreate (urlCheck) {
    let userInfo = {
      username: this.refs._txtUsername.value,
      password: this.refs._txtPass.value
    }


    return Axios({
      url: url + urlCheck,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: userInfo,
      withCredentials: true
    })
      .then(() => this.props.logIn(userInfo))
      .catch(err => {
        err.response ?
        this.showSnack(err.response.data.errorBody.message) : this.showSnack(err)
      })
  }





  showSnack (errorMsg) {
    var snack = document.getElementById('snackbar')
    snack.className = 'show'
    snack.innerHTML = errorMsg
    setTimeout(() => snack.className = snack.className.replace('show', 'hide'), 2000)
  }



  render () {
    return (
      <div className='bg_color'>
        <div className='container container-login'>
          <div className='form_wrapper'>
            <form>
              <label htmlFor='user_name' className='left'>
                Username
              </label>
              <br />
              <input type='text' id='user_name' ref='_txtUsername' />
              <br/>
              <br/>
              <label htmlFor='user_pass' className='left'>
                Password
              </label>
              <br />
              <input type='password' id='user_pass' ref='_txtPass' onKeyPress={this.keyEnter.bind(this)} />
              <br/>
              <br/>
              <input
                type='button'
                value='Log In'
                className='left'
                onClick={this.Login.bind(this)}
                ref='_btnLogin' 
              />
              <input
                type='button'
                value='Sign Up'
                className='right'
                onClick={this.Create.bind(this)}
                ref='_btnCreate' 
              />
              <div id='snackbar'>
                Some text some message..
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default Login
