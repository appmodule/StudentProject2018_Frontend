import React, { Component} from 'react';
import { subscribe } from 'mqtt-react';

class Dummy extends Component {


    constructor(props) {
        super(props);
        this.state = {
            options: {
                guid: "",
                in: true,
                data: {}
            },
            format: null,        
            displayOptions: {
                width: "550px",
                height: "575px",
                border: "2px solid black",
                margin: "3% 25% 0 25%"
              
            },
            receivedMessage: null

        }
      
    }
    
    componentDidMount() {
        window.mojObjekat = {};
        fetch('http://localhost:3000/data')
            .then((data) => data.json())
            .then((jsonData) => this.setState({options : {data : jsonData} }));
        
        
    }   

    componentWillReceiveProps(nextProps) {
        if(nextProps.data.length> 0) {
            this.setState({receivedMessage: nextProps.data[0]})
        }
    }
    
  
    
    render() {
        
        if(this.props.data.length > 0) {                    
            this.props.data.length = 0;          
            window.mojObjekat = this.state.receivedMessage;            
        }
        
     
           
       
        
        return (
            <div style={this.state.displayOptions}> 
                {/*<ul>                    
                    {
                        this.state.receivedMessage ? 
                        Object.keys(this.state.options.data).map((key, index) => <li key={index}>{this.state.receivedMessage[key]}</li>)
                        : null
                    }
                </ul>
                <input type="text" onChange={this.handleChange.bind(this)} /> */}
                
             
                
                              
            </div>
        )
    }
    
    /*handleChange(event) {        
        this.setState({receivedMessage: JSON.parse(event.target.value)})
    }*/
    
    

}

export default  subscribe({
    topic: "@demo/test"
})(Dummy);

