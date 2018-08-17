import React, { Component } from 'react';
import Widget from './widget';
import Modal from 'react-responsive-modal';
import '../styles/dashboard.css';
import { deleteWidgetAllDb, deleteWidgetDb, getLayoutWidgets, getAllWidgets, saveLayoutWidgets, getSensorsList } from '../services/widgets.service';


class Dashboard extends Component {
    
    constructor(props){
        super(props);
        
        this.state = {             
            hideList: true,                      
            layoutWidgetList: null,
            allWidgets: null,
            isDialogOpen: false,
            isSaveDialogOpen: false,
            deleteAllWidgets: false,
            sel_widg: null,
            sensors: null
        }
        
        this.renderLayoutWidgets = this.renderLayoutWidgets.bind(this);
        this.renderAllWidgets = this.renderAllWidgets.bind(this);        
        this.drawWidgetToLayout = this.drawWidgetToLayout.bind(this);
        this.deleteWidget = this.deleteWidget.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getLayout = this.getLayout.bind(this);
        this.saveLayout = this.saveLayout.bind(this);
        this.clearLayout = this.clearLayout.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.getWidget = this.getWidget.bind(this);
        this.changeData = this.changeData.bind(this);
        this.deleteWidgetPerm = this.deleteWidgetPerm.bind(this);
        this.deleteWidgetAllPerm = this.deleteWidgetAllPerm.bind(this);
    }
    
   
    getLayout() {
        getLayoutWidgets(this.props.username).then(data => {
            this.setState({layoutWidgetList: data})});
    }
    
    
    
    getAll() {
        getAllWidgets().then(data => this.setState({allWidgets: data, hideList: !this.state.hideList}));  
    }
    
    
    
    
    saveLayout() {        
        saveLayoutWidgets(this.state.layoutWidgetList, this.props.username);
        this.handleOpen("save");
    }
    
    
    
    clearLayout() {
        let list = [];
        this.setState({layoutWidgetList: list});
    }
    
    
    
    handleOpen(handle) {
        
        switch(handle) {
            case 'sensors':
                this.setState({isDialogOpen: true});
                break;
            case 'save':
                this.setState({isSaveDialogOpen: true});
                break;
            case 'delete':
                this.setState({deleteAllWidgets: true});
                break;
            default:
                this.setState({isDialogOpen: false, isSaveDialogOpen: false, deleteAllWidgets: false})            
        }        
       
    }
    
   
       
        
    handleClose(handle) {
        
        switch(handle) {
            case 'sensors':
                this.setState({isDialogOpen: false});
                break;
            case 'save':
                this.setState({isSaveDialogOpen: false});
                break;
            case 'delete':
                this.setState({deleteAllWidgets: false});
                break;   
            default:
                break;         
        }        
       
    }
    
    
    deleteWidget(indToDelete) {        
        const { layoutWidgetList } = this.state;
       
        let list = layoutWidgetList.filter((el,indx) => indToDelete !== indx);   
        
        this.setState({layoutWidgetList: list});
    }
    
    
    deleteWidgetPerm(widget){
        deleteWidgetDb(widget);
        setTimeout(() => getAllWidgets().then(data => {
            this.setState({allWidgets: data});
        }),1000)         
    }   
    
    
    
    deleteWidgetAllPerm(){
        deleteWidgetAllDb();
        setTimeout(() => getAllWidgets().then(data => {
            this.setState({allWidgets: data});
        }),1000) ;
        this.setState({deleteAllWidgets: false})   
    } 
    
    
    
   
    
    renderLayoutWidgets() { 
        return (     
            this.state.layoutWidgetList.map((widget, ind) => {                             
                return (
                    <div key={ind}>                                                
                        <Widget 
                            options={widget} 
                            index={ind}                             
                            deleteWidget={this.deleteWidget} 
                            getWidget={this.getWidget}
                            changeData={this.changeData}                                                  
                        />
                    </div> 
                )
            })
        )
    }
    
    
    
    renderAllWidgets() {        
        return (            
            this.state.allWidgets.map((widg, ind) => {
                return (
                    <li key={ind}>  
                        <span onClick={() => this.drawWidgetToLayout(widg)}>{widg.name}</span> <i style={{marginLeft:"10%"}} className="fa fa-trash" onClick={()=>this.deleteWidgetPerm(widg)}></i>
                    </li>
                )
            })
        )
    }
    
    
    
    getWidget(widg) {       
       
        const { layoutWidgetList } = this.state;    
        
        let list = layoutWidgetList.map((el) => {
            console.log(el);  
            if(el.name === widg.name) {
                el.lastData = widg.lastData;
            }
            console.log(el);
            return el;
        })    
         
       
        this.setState({layoutWidgetList: list});
    }
    
    
    
    changeData(idx, name, data) {
               
        let newList = this.state.layoutWidgetList.map((widget, index) => {
            if(idx === index) {                
                widget = {...widget, [name]: data}                
            }
            return widget;
        })        
        this.setState({layoutWidgetList: newList});
    }
    
    
    
    drawWidgetToLayout(widg) {         
        
        this.setState({sel_widg: widg});  
        getSensorsList().then(data => this.setState({sensors: data}));          
        
        setTimeout(() => this.handleOpen("sensors"),250)        
    }
    
        
    
    submit() {
      
        const { layoutWidgetList, sel_widg } = this.state;         
        
        let selTopic = this.refs.sel.value; 
        sel_widg.topic = selTopic;            
        
        let newObj = {...sel_widg, topic: selTopic }      
        let list;
        
        if(layoutWidgetList !== null && layoutWidgetList !== undefined) {
            list = [...layoutWidgetList, newObj]
        } 
        else {
            list = [newObj]    
        }
        
        this.setState({layoutWidgetList: list});
       
        this.handleClose('sensors');
    }
    
    
    
    
    render() {
        
        const { layoutWidgetList, allWidgets, isDialogOpen, sensors } = this.state;
                  
        return (
         <div className="bg_color">
         
            <div className="dashboard-container container-fluid">
                <div className="row">
                <div className="btns-container col-12">
                    <button className="btn btn-info btnDashLeft" onClick={() => this.getLayout()}>Load</button>
                    <button className="btn btn-info btnDashLeft" onClick={() => this.saveLayout()}>Save</button>
                    <button className="btn btn-info btnDashLeft" onClick={() => this.clearLayout()}>Clear Dashboard</button>
                    <button className="btn btn-info btnDashLeft" onClick={() => this.props.logOut()}>Log Out</button>
                    <button className="btn btn-info btnDashRight" onClick={() => this.props.createWidget()}>+</button>
                </div>    
                </div> 
                
                <div className="info_popup">
                    <Modal open={isDialogOpen} onClose={()=>this.handleClose("sensors")} center>                    
                        <h5 style={{margin:"13% 0 6% 0"}}>Choose a sensor to listen</h5>
                        <select className="form-control-sm sel" ref="sel">
                            {(sensors !== null && sensors !== undefined) ? sensors.map((el,ind) => <option key={ind} value={el.topic}>{ el.name}</option>) : <option>No available sensors at the moment</option>}                        
                        </select>
                        
                        <button className="btn btn-sm btn-info btnPop" onClick={this.submit.bind(this)}>Submit</button>
                    </Modal>
                    
                    <Modal open={this.state.isSaveDialogOpen} onClose={() => this.handleClose('save')} center>                    
                        <h5 style={{margin:"13% 0 6% 0"}}>Layout saved successfully</h5>
                                                
                        <button className="btn btn-info btnWidgPop btnCenter" onClick={()=>this.handleClose('save')}>OK</button>
                    </Modal>

                    <Modal open={this.state.deleteAllWidgets} onClose={()=>this.handleClose('delete')} center>                    
                        <h5 style={{margin:"13% 0 6% 0"}}>Are you sure you want to delete all widgets?</h5>
                                                
                        <button className="btn btn-info btnWidgPop btnCenter" onClick={()=>this.deleteWidgetAllPerm()}>OK</button>
                    </Modal>
                </div>
                <div className="row dash_block">
                <div className="divMyWidgets col-12">
                    <div className="row">
                        <div className="col-md-3 offset-md-9">
                        <button className="btn btn-info right btnMyWidgs" onClick={() => this.getAll()}>My widgets</button>
                        <button className={this.state.hideList ? "btn btn-info left hide" : "btn btn-info left"} onClick={() =>this.handleOpen('delete')}>Delete All</button>
                        </div>
                    </div>
                </div>
                <div className="all-widgets-container col-12 col-md-3">

                    <div>
                        <ul className={this.state.hideList ? "ul-all-widgs-hide" : "ul-all-widgs"} >
                            { (allWidgets !== null && allWidgets !== undefined) ? this.renderAllWidgets() : null }                                   
                        </ul>
                    </div>
                </div>
                <div className="widget-container col-12 col-md-9">
                { layoutWidgetList !== null && layoutWidgetList !== undefined ? 
                        <div>
                            {this.renderLayoutWidgets() } 
                        </div> 
                        : null 
                }     
                </div>     
                </div>    
            </div>
         </div>   
        )
    }    
}
export default Dashboard;   