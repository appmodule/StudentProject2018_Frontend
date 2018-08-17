import Axios from 'axios';

export function getLayoutWidgets(username) {
        
    let obj = {
        name: `layout-${username}`
    }   
  
    
    return Axios ({
        url:`http://hq.appmodule.rs:2031/layout/load`,
        method:'post',
        headers: {
            'Content-Type': 'application/json'               
        },
        data: obj,
        withCredentials: true
    })
    .then(response => response.data.widgets)    
    .catch(err => console.log("caught error: " + err))
    
}



export function getAllWidgets() {     
               
    return Axios ({
        url:`http://hq.appmodule.rs:2031/widget/load`,
        method:'post',
        headers: {
            'Content-Type' : 'application/json'               
        },
        withCredentials: true
    })
    .then(response => response.data.body.widgets)         
    .catch(err => console.log("caught error: " + err))
}



export function saveLayoutWidgets(layoutWidgetList, username) {        
            
    let arr = [];   
    
    if (layoutWidgetList !== null && layoutWidgetList !== undefined) {
        layoutWidgetList.forEach(widget => {        
            arr = [...arr, widget]
        })
      
        let objToSend = {
            name: `layout-${username}`,
            widgets: arr
        }
            
        const {mqttConnection, ...obj} = objToSend;          
               
        return Axios ({
            url:`http://hq.appmodule.rs:2031/layout/save`,
            method:'post',
            headers: {
                'Content-Type': 'application/json'               
            },
            data: obj,
            withCredentials: true
        })
        .then(data => data)
        .catch(err => console.log(err.response.data.errorBody.message)) 
    }
}




export function saveGeneratedWidget(name, design, mockData, functions, scheme, coords) {       
        
    const widget = {
        name: name,
        design: design,
        format: mockData,
        functions: functions,
        scheme: scheme,
        coords: coords        
    }
    
           
    return Axios ({
        url:`http://hq.appmodule.rs:2031/widget/save`,
        method:'post',
        headers: {
            'Content-Type' : 'application/json'                
        },
        data: widget,
        withCredentials: true
        
    })
    .then(data => data)        
    .catch(err => console.log(err))
}




export function getSensorsList() {
    return Axios ({
        url: `http://hq.appmodule.rs:2031/sensor/load`,
        method: 'post',
        withCredentials: true
    })
    .then(response => response.data)
    .then(data => data.body.sensors)
    .catch(err => console.log(err))
}



export function deleteWidgetDb(widget) {    
    return Axios ({
        url:`http://hq.appmodule.rs:2031/widget/delete`,
        method: 'post',
        withCredentials: true,
        data: widget
    })
    .then(response => console.log(response))
    .catch(err => console.log(err))    
}

export function deleteWidgetAllDb() {    
    return Axios ({
        url:`http://hq.appmodule.rs:2031/widget/deleteall`,
        method: 'post',
        withCredentials: true
    })
    .then(response => console.log(response))
    .catch(err => console.log(err))    
}