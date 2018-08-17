import React, {Component } from 'react';
import WidgetGenerator from './widget-generator';
import Dashboard from './dashboard';
import Login from './login';
import Axios from 'axios'

class Index extends Component {
  
  constructor(props){
    super(props);
    
    this.state = {
      loggedIn: false,      
      generator: false,
      user: {}
    }
    
    this.logIn = this.logIn.bind(this);
    this.createWidget = this.createWidget.bind(this);
    this.logOut = this.logOut.bind(this);
  } 
    
    
  logIn(usr) {    
    if(usr !== null && usr !== undefined){ 
      window.localStorage.setItem('user', usr.username)
    }
      
    this.setState({loggedIn: true, generator:false, user:usr})
  }
    
  logOut() {
    return Axios({
      url:`http://hq.appmodule.rs:2031/user/logout`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
      .then(this.setState({loggedIn: false, generator: false}))
      .then(window.localStorage.removeItem('user'))
      .catch(err => {
        console.log(err);
      })
   
  }
    
  createWidget() {    
    this.setState({generator: true, loggedIn: true})
  }
    
    
  render() {
    
    const {loggedIn, generator} = this.state;
    
    if(loggedIn && !generator) {
      let user = window.localStorage.getItem('user');
      return <Dashboard logOut={this.logOut} createWidget={this.createWidget} username={user !== null && user !== undefined ? user : ""}/>      
    }
    
    else if(!loggedIn && !generator) {
      return <Login logIn={this.logIn}/>
    }

    else if(generator && loggedIn) {     
      return <WidgetGenerator backToDash={this.logIn} />
    }   
  }
  
}
export default Index;