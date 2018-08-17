# SSIOT Frontend (Summer internship 2018 - [AppModule](http://www.appmodule.net/))

## Description
SSIOT Frontend is a frontend web application working with [SSIOT Backend](https://github.com/appmodule/StudentProject2018_Backend) and [SSIOT iOS](https://github.com/appmodule/StudentProject2018_Mobile) on connecting Internet of things devices. It is written in javascript using React framework and its main functionality is to display data received from other devices. Data is displayed on widgets that are custom made by a user, and the user can make a completely new widget or use an already existing one.

## References

  - [Architecture project](https://drive.google.com/open?id=1WVr8KbC6PKtnrh5wBTfyniAzzACREK-E)
  - [User manual](https://drive.google.com/open?id=122N9GOuM6Bzio5tibY7mOl9ZQWlqpxPc)

## Project setup

### Installation
 - [Node.js v8+](https://nodejs.org/)
 
 
### Dependencies
```sh
$ npm install
```
This will install all the depencies the project has. 

## Starting the project

```sh
$ npm start
```

## Use

Once the project is up and running, these are the options available to you:

- sign in/up
- click the **+** to create a new widget (this will redirect you to the widget generator page)


### Widget generator
 
Once you are on this page, you can customize the data format your widget will receive, its design (HTML and inline CSS) and its functions (javascript).
 
 
#### Example
 
Format:
```
 {
    myvar: 4  
	//this only means that data format of myvar is a number, its value is not neccessarily 4, you can change it later	
 }
  
```



    Design:

    <div>
        <h1>This is my var:</h1>
        <p>d_myvar</p>
        <button onclick= f_myfunc1 >Click me</button>
    </div>
    

    Functions:

    function myfunc1() {
        alert(this.myvar);
        this.myfunc2();
        alert(this.myvar);
    }

    function myfunc2() {
        this.save({myvar: 66});
        //when you want to change your data(myvar) call function save
    }


## Used libraries
- [axios](https://www.npmjs.com/package/axios)
- [generate-schema](https://www.npmjs.com/package/generate-schema)
- [jsonschema](https://www.npmjs.com/package/jsonschema)
- [mqtt](https://www.npmjs.com/package/mqtt)
- [react-ace](https://www.npmjs.com/package/react-ace)
- [react-draggable](https://www.npmjs.com/package/react-draggable)
- [react-render-html](https://www.npmjs.com/package/react-render-html)
- [react-responsive-modal](https://www.npmjs.com/package/react-responsive-modal)
## Authors
   - **Nevena Čolić** - [Github](https://github.com/nensiiika)
   - **Stefan Čović** - [Github](https://github.com/scovic)
   - **Nenad Dinic** - [Github](https://github.com/nelex78)
   - **Petar Markovic** - [Github](https://github.com/peca993)

## Licence
This project is licensed under the **MIT Licence** - see the [LICENCE.md](LICENCE.md) file.