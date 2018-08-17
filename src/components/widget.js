import React, { Component } from 'react';
import {Validator} from 'jsonschema';
import Generator from 'generate-schema';
import mqtt from 'mqtt';
import renderHTML from 'react-render-html';
import Draggable from 'react-draggable';
import '../styles/widget.css'


class Widget extends Component {

    constructor(props){
        super(props);
            
        this.state = {
            name: "",
            lastData: null,
            format: {},   
            scheme: {},        
            design: "",
            functions: {},
            mqttConnection: null,
            topic: "",
            coords:{
                x:0,
                y:0
            },
            subscribed: false,
            objToBind: null
        }
        this.renderDesign = this.renderDesign.bind(this);        
        this.validate = this.validate.bind(this);  
        this.handleDrag = this.handleDrag.bind(this); 
        this.findFunctions = this.findFunctions.bind(this);    
        this.save = this.save.bind(this); 
    }
    
    
    
    
    componentWillMount() {        
        this.setState({
            name: this.props.options.name,
            format: this.props.options.format,
            design: this.props.options.design,
            functions: this.props.options.functions,            
            lastData: this.props.options.lastData,
            topic: this.props.options.topic,
            scheme: Generator.json("Data Format Scheme", this.props.options.format),
            coords: this.props.options.coords ? this.props.options.coords : { x: 100, y: 0}          
        })
    
         
        // functions
        let objectToBind = Object.keys(this.props.options.functions).reduce((acc, key) => {
            return {...acc, [key.slice(2)]: new Function(...this.props.options.functions[key].args, this.props.options.functions[key].body)}
        }, {})

        //formatData
        objectToBind = Object.keys(this.props.options.format).reduce((acc, key) => {
            return {...acc, [key] : this.props.options.format[key]}
        }, objectToBind);
        
        if( !this.props.options.functions['f_init']) {
            objectToBind = { ...objectToBind, "init": new Function() }
        }

        objectToBind = {...objectToBind, "save": this.save}

        //we bind objectToBind to every function
        Object.keys(objectToBind).forEach((key) => {
            if(typeof objectToBind[key] === 'function') {
                objectToBind[key].bind(objectToBind);
            }
        })
        
        this.setState({objToBind: objectToBind})
              
    }

    
   componentWillReceiveProps(nextProps) {      
        this.setState({
            name: nextProps.options.name,
            format: nextProps.options.format,
            design: nextProps.options.design,
            functions: nextProps.options.functions,            
            lastData: nextProps.options.lastData,
            topic: nextProps.options.topic,
            scheme: Generator.json("Data Format Scheme", nextProps.options.format),
            coords: nextProps.options.coords ? nextProps.options.coords : { x:50, y: 0}              
        })
        
    }
    
     
    componentDidMount() {
        
        const client = mqtt.connect('ws://siot.net:9001/');
        const component = this;

        if(!component.state.subscribed && component.state.topic !== null && component.state.topic !== undefined) {
            client.on('connect', () => {
                client.subscribe(component.state.topic, (err) => {
                    if(!err) {
                        component.setState({mqttConnection: client, subscribed: true}) 
                        console.log(component.state.topic)                                            
                    }
                })
            } )
        }
        
            client.on('message', (topic, message) => {
            try{    
                const { lastData, format } = component.state;                                    
                let obj = component.state.objToBind;
                let recvObj = JSON.parse(message.toString());
                
                let dataToSave = Object.keys(format).reduce((acc,key) => {
                    return {...acc, [key]: recvObj[key] ? recvObj[key] : null}
                }, {})
                
                //updates data values in objToBind
                Object.keys(recvObj).forEach((key) => {
                    obj[key] = recvObj[key];
                })
                component.setState({topic: topic, lastData: dataToSave, objToBind: obj});
                
                component.state.objToBind.init();
                
                this.props.getWidget(component.state);   
            } 
            catch(err) { console.log(err) }
        })
    }
    
    
    

    componentWillUnmount() {        
        this.state.mqttConnection.unsubscribe(this.state.topic);
        this.setState({subscribed: false});
        this.state.mqttConnection.end();
    }
    
    
    
    save (newObj) {
        const { lastData } = this.state;
        
        let obj = Object.keys(lastData).reduce((acc, key) => ({...acc, [key]: newObj[key]? newObj[key]: lastData[key]}), {});
        
        this.setState({lastData: obj});
        this.props.getWidget(this.state);
    }
    
      
      
    validate(obj) {
        let validator = new Validator();        
        return validator.validate(obj, this.state.scheme).valid;      
    }
    
    

    findFunctions(elementToSearch) {
        let newElement = elementToSearch;
        if(!elementToSearch || typeof elementToSearch !== 'object') {
          return elementToSearch;
        }
    
        Object.keys(elementToSearch).forEach((key) => {
          if( key === 'props') {
            newElement = {...newElement, [key]: this.findFunctions(elementToSearch[key]) }
    
          } else if ( key === 'children') {
            newElement = {
              ...newElement,
              [key] : elementToSearch[key].map((obj) => this.findFunctions(obj))
            }
    
          } else {
                const { functions, lastData, objToBind } = this.state;
                let functionNames = Object.keys(functions);
                let indx = functionNames.indexOf(elementToSearch[key]);
                if(indx !== -1) {
                
                    let funcName = elementToSearch[key].slice(2);
                    newElement = {...newElement, [key]: () => objToBind[funcName]() }
                }
            }
        })

        return newElement;
    }
    
    
    
    renderDesign() {
           
        const {format, design, lastData, functions} = this.state;
                
        let objToBind = {};
        let htmlDesign = design;         
        
        if(lastData && format) {
            Object.keys(format).forEach((key) => htmlDesign = htmlDesign.replace("d_" + key, lastData[key]));
        }

        let renderedHtmlDesign = renderHTML(htmlDesign); 
        
        if(renderedHtmlDesign && renderedHtmlDesign.length === undefined )  {
            renderedHtmlDesign = [renderedHtmlDesign];
        }   

        try {

            renderedHtmlDesign = renderedHtmlDesign.map((element) => {
                let newElement = element;
                  
                newElement = this.findFunctions(element);
                
                return newElement;
            })
            
            return renderedHtmlDesign;  
          } catch(err) { console.log (err)}              
    }
    
    
    
    handleDrag(e, ui) {
               
        const div_coords = {
            x: ui.lastX,
            y: ui.lastY
        }
        
        const name = "coords";
        this.props.changeData(this.props.index, name, div_coords);
        this.setState({coords: div_coords})
    }
    
    
    
    
    initDragWidget() {  
          
        let renderedHTML = this.renderDesign();  
        
        const { lastData, coords, functions, name } = this.state;
        
        return (
            
            <div className="dragWrapper box" key={this.props.index}>            
                <Draggable handle=".handle" bounds=".widget-container" defaultPosition={coords} onDrag={this.handleDrag} position={coords} >

                    <div className="widget-cont handle" id={this.props.index}>  
                        <div className="widgetHeader">
                            <h2> {this.state.name} </h2>
                            <button className="btn btn-sm btn-info btnX" onClick={() => this.props.deleteWidget(this.props.index)}>x</button> 
                        </div>            
                            
                        <div className="widget">  
                            { (lastData !== null && lastData !== undefined && this.validate(lastData) )  ? renderedHTML : <h2>No current data</h2> }
                        </div>  
                    </div>
                </Draggable>
            </div>
        )
    }   
    
    
    
    
    render() {         
        return (   
            <div>
                
                {this.initDragWidget()}
            </div>               
        )        
    }
    
    
}
export default Widget;