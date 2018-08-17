import React, { Component } from 'react';
import { Validator } from 'jsonschema';
import Generator from 'generate-schema';
import renderHTML from 'react-render-html';
import AceEditor from 'react-ace';
import { saveGeneratedWidget } from '../services/widgets.service';
import '../styles/widgetGenerator.css';
import 'brace/mode/html';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/theme/solarized_dark';
import { withStyles } from '@material-ui/core/styles';
import {Grid, TextField} from '@material-ui/core/';
import Modal from 'react-responsive-modal';
import PropTypes from 'prop-types';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
    color: theme.palette.getContrastText('#ffffff'),
    backgroundColor: '#197676',
    '&:hover': {
      backgroundColor: '#1E8A87'
    }
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  },
  textField: {
    color: 'white'
  },
  input: {
    color: '#859900'
  }
})



class WidgetGenerator extends Component {
  constructor (props) {
    super(props);

    this.state = {
      name: ' ',
      mockData: {
        'temp': 23,
        'c': true
      },
      design: "<h3>Hello world!</h3>\n<h4> d_temp <span id='k'>C</span></h4>\n<button class='btn' onclick= f_druga>Click mee</button>",
      scheme: {},
      functions: {
        f_init: {
          args: [],
          body: "console.log('jupi jupi jeej')"
        },
        f_druga: {
          args: [],
          body: "console.log('hello')"
        }
      },
      isDialogOpen: false,
      objToBind: null
    }
    

    this.widgetName = '';

    this.save = this.save.bind(this);
    this.validate = this.validate.bind(this);
    this.renderFunctionsToString = this.renderFunctionsToString.bind(this);
    this.renderDesign = this.renderDesign.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleWidgetNameChange = this.handleWidgetNameChange.bind(this);
    this.findFunctions = this.findFunctions.bind(this);
    
  }
  
  componentWillMount() {
    //binding functions
    let objectToBind = Object.keys(this.state.functions).reduce((acc, key) => {
      return {...acc, [key.slice(2)]: new Function(...this.state.functions[key].args, this.state.functions[key].body)}
      }, {})

    //binding data 
    objectToBind = {...objectToBind, ...this.state.mockData}
    
    objectToBind = {...objectToBind, save: this.save};

    Object.keys(objectToBind).forEach( (key) => {
      if(typeof objectToBind[key] === 'function') {
        objectToBind[key].bind(objectToBind);
      }
    });
    this.setState({objToBind: objectToBind})


  }
  
  
  handleWidgetNameChange (event) {
    this.widgetName = event.target.value;
  }
  
  
  handleChangeData (newValue) {
    try {
      const { objToBind } = this.state;
      let val = this.refs._aceData.editor.getValue();
      let objVal = JSON.parse(val);

      let objectToBind = Object.keys(objVal).reduce( (acc, key) => {
        return {...acc, [key] : objVal[key] };
      }, objToBind);

      this.setState({
        mockData: JSON.parse(val),
        objToBind: objectToBind
      });
    } catch (err) { console.error(err.message) }
  }

  
   
  handleChangeDesign (newValue) {
    try {
      this.setState({design: newValue});
    } catch (err) { console.error(err.message) }
  }

  
  handleOpen () {
    this.setState({isDialogOpen: true});
  }
  

  handleClose () {
    this.setState({isDialogOpen: false});
  }
  

  renderFunctionsToString () {
    const { functions } = this.state;

    let funcString = Object.keys(functions).reduce((acc, key) => {
      acc += 'function ' + key.slice(2) + ' (' + functions[key].args.toString() + ') {\n';
      acc += '    ' + functions[key].body + '\n}\n\n';
      return acc;
    }, '')
    return funcString;
  }
  

  saveFunctions () {
    try {
      const { mockData } = this.state;
      let newValue = this.refs.aceFuncs.editor.getValue();

      let arrOfFunctions = newValue.split('function');
      arrOfFunctions.shift();

      let functionsToSave = arrOfFunctions.reduce((acc, func) => {
        let body = func.slice(func.indexOf('{') + 1, func.lastIndexOf('}')).trim();
        let name = func.slice(0, func.indexOf('(')).trim();
        let argPart = func.slice(func.indexOf('(') + 1, func.indexOf(')'));

        let args = argPart.split(',').map(element => element.trim());

        let newFunc = {
          args: args,
          body: body
        }

        return {...acc, ['f_' + name]: newFunc}
      }, {})

      let objToBind = Object.keys(functionsToSave).reduce((acc, key) => {
          return {...acc, [key.slice(2)]: new Function(...functionsToSave[key].args, functionsToSave[key].body )};
      }, {})

      objToBind = {...objToBind, ...mockData, save: this.save}

      Object.keys(objToBind).forEach((key) => {
          if(typeof objToBind[key] === 'function') {
            objToBind[key].bind(objToBind);
          }
      })

      this.setState({
        functions: functionsToSave,
        objToBind : objToBind
      });
    } catch (err) {}
  }
  
  

  save (newObj) {
    const { mockData} = this.state;
    let obj = Object.keys(mockData).reduce((acc, key) => ({...acc, [key]: newObj[key]? newObj[key]: mockData[key]}), {});
    this.setState({mockData: obj});
  }

  
  
  validate (obj) {
    let validator = new Validator();
    return validator.validate(obj, Generator.json('Data Format Scheme', this.state.mockData)).valid;
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
        const { functions, mockData } = this.state;
        let functionNames = Object.keys(functions);
        let indx = functionNames.indexOf(elementToSearch[key]);
        if(indx !== -1) {
          let funcName = elementToSearch[key].slice(2)

          newElement = {...newElement, [key]: () => this.state.objToBind[funcName]()}
    
        }
      }

    })

    return newElement;

  }

  renderDesign () {
    const { design, mockData } = this.state;

    let htmlDesign = design;
    // rendering data in html string
    Object.keys(mockData).forEach((key) => htmlDesign = htmlDesign.replace('d_' + key, mockData[key]));

    let renderedHtmlDesign = renderHTML(htmlDesign);
    console.log(renderedHtmlDesign);
    // if only one element, renderHTML returns an object, we need it to be an array of object
    //even if it is array of only one element-object
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
    } catch(err) {}
  }

  
  
  
  saveScheme () {
    if (this.widgetName === '') return;
    const { mockData, design, functions } = this.state;

    let ime = this.widgetName;
    let sch = Generator.json('Data Format Scheme', this.state.mockData);

    saveGeneratedWidget(ime, design, mockData, functions, sch);
    this.setState({name: ime, scheme: sch, isDialogOpen: true});
  }
  
  

  render () {
    const { mockData } = this.state;
    const renderedHTML = this.renderDesign();
    const { classes } = this.props;

    return (
      <Grid container style={{color: '#217FBF', padding: "20px"}} >
        <Grid item xs={12} md={6} >
          <Grid item xs={12} >
            <h4>Format:</h4>
            <AceEditor
              mode='json'
              theme='solarized_dark'
              name='formatEditor'
              value={JSON.stringify(this.state.mockData, undefined, 4)}
              onChange={this.handleChangeData.bind(this)}
              height='150px'
              width='100%'
              editorProps={{$blockScrolling: Infinity}}
              ref='_aceData'
              fontSize={14}
              showPrintMargin
              showGutter
              highlightActiveLine
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2
              }}
            />
          </Grid>

          <Grid item xs={12} >
            <h4>Design:</h4>
            <AceEditor
              value={this.state.design}
              name='designEditor'
              theme='solarized_dark'
              mode='html'
              onChange={this.handleChangeDesign.bind(this)}
              height='150px'
              width='100%'
              editorProps={{$blockScrolling: Infinity}}
              ref='_aceDesign'
              fontSize={14}
              showPrintMargin
              showGutter
              highlightActiveLine
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2
              }}

            />
          </Grid>

          <Grid item xs={12} >
            <h4>Functions</h4>
            <AceEditor
              name='dataEditor'
              value={this.state.functions === [] ? '' : this.renderFunctionsToString()}
              mode='javascript'
              theme='solarized_dark'
              height='150px'
              width='100%'
              editorProps={{$blockScrolling: Infinity}}
              ref='aceFuncs'
              fontSize={14}
              showPrintMargin
              showGutter
              highlightActiveLine
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2
              }}

            />
            <div className='container text-center'>
              <button onClick={this.saveFunctions.bind(this)} className='btn btn-info'>
                  Save functions
              </button>
            </div>
          </Grid>

        </Grid>

        <Grid item style={{color: 'white'}} xs={12} md={6} >
          <div className='text-center'>
            <h2 style={{color: '#217FBF'}} >Preview</h2>
            <form id='text-field-form'>
              <TextField
                required
                type='text'
                label='Name your widget:'
                margin='normal'
                onChange={this.handleWidgetNameChange}
                InputProps={{
                  className: classes.input
                }}
                className={classes.textField}
              />
            </form>
          </div>
          <Modal open={this.state.isDialogOpen} onClose={this.handleClose} center>
            <h5 style={{margin: '13% 0 6% 0'}}>Widget saved successfully</h5>
            <h6>Go back to dashboard?</h6>
            <div className='btns'>
              <button className='btn btn btn-info btnWidgPop' onClick={() => this.props.backToDash()}>Yes</button>
              <button className='btn btn btn-info btnWidgPop' onClick={() => this.handleClose()}>No</button>
            </div>
          </Modal>
          <div style={{width: '75%', height: '50%', padding: "10px", border: '1px solid black', margin: '5% 10% 0 15%'}}>
            { this.validate(mockData) ? renderedHTML : null }
          </div>
          <div className='container text-center'>
            <button type='button' form='text-field-form' className='btn btn-info' onClick={this.saveScheme.bind(this)}>Save widget</button>
          </div>
        </Grid>
        <button className='btn btn-info bckLink' onClick={() => this.props.backToDash()}>Back</button>
      </Grid>
    )
  }
}

WidgetGenerator.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(WidgetGenerator);
