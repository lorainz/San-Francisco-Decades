class App extends React.Component {
  constructor(props) {
    super(props);
    this.changePage = this.changePage.bind(this); // allows navgation menu buttons to change page
    this.changeLogin = this.changeLogin.bind(this); // need to check this before this.state to be able to this.setState
    this.state = {
      results: [], // DecadeSelector
      decade: null, // DecadeSelector
      logged_in: null, // Login
      currentpage: 0, // Nav, Login, Register 
      pages: [
        <AboutPage />,  
        <DecadeSelector />, 
        <RandomGenerator />, 
        <Login changeLogin={this.changeLogin} changePage={this.changePage}/>, 
        <Register changePage={this.changePage}/>
      ],
      pageIdx: {'About': 0, 'Decade': 1, 'Random': 2, 'Login' : 3, 'Register': 4}, 
    };
  }
  //This is passed to PageHeader to be able to call this function when a menuButton is clicked
  changePage(route) {
    this.setState({currentpage: this.state.pageIdx[route]});
    // console.log(this.state.pageIdx, route) // test
  }

  //
  changeLogin(status) {
    // console.log("BEFORE LOGGED IN:" + status) // test
    this.setState({logged_in: status}); 
    // console.log("LOGGED IN:" + status) // test
  }

  render() {
    return (
      <div className="app">
        <NavigationBar changePage={this.changePage} />
        {this.state.pages[this.state.currentpage]}
      </div>
    )
  }
}

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.renderMenuButton = this.renderMenuButton.bind(this);
    this.menuButtonClicked = this.menuButtonClicked.bind(this);
    this.state = {}
  }
  //Change page (state) of parent component to track what page we are on, Rendering occurs in parent component when the function is called in the parent component
  menuButtonClicked(route) {
    this.props.changePage(route) 
  }
  //
  renderMenuButton(route) {
    return (
      <DecadeButton 
        value={route} 
        class="nav-item btn btn-link nav-link"
        onClick={() => this.menuButtonClicked(route)} 
        //when the menu button is clicked, we pass the route to the function changePage to change the page in App
        //This is a function callback, closure 
        //it should only call the function when the button is clicked, and allows us to pass a function
        // otherwise this function would be called immediately if used this.menuButtonClicked
      />
    )
  }

  render() {
    return (
      <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top justify-content-between" style={{'backgroundColor': '#e3f2fd'}}>
          <a class="navbar-brand" href="#">San Francisco Decades</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav">
              <li class="nav-item"> {this.renderMenuButton('About')} </li>
              <li class="nav-item"> {this.renderMenuButton('Decade')} </li>
              <li class="nav-item"> {this.renderMenuButton('Random')} </li>
              <li class="nav-item"> {this.renderMenuButton('Login')} </li>
              <li class="nav-item"> {this.renderMenuButton('Register')} </li>
            </ul>
          </div>
          <form class="form-inline">
            <input class="form-control mr-sm-2" type="search" placeholder="Search for restaurant" aria-label="Search" />
            <button class="btn btn-outline-secondary my-2 my-sm-0" type="submit"><i class="fa fa-search fa-fw"></i></button>
          </form>
      </nav>
      )
    }
}

class AboutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <div className="aboutbg opacity-extra-medium bg-black" style={{'padding': '100px 0px 0px 50px'}}>
        <h1 id="opacity-none">
          San Francisco Decades 
          <span style={{'fontSize': '20px'}}> allows you to explore restaurants with a new perspective.</span>
        </h1>
        <hr className="hr-light" />
        <h5> 
          <span style={{'padding': '0px 20px 0px 0px', 'fontSize': '20px'}}>Start by</span>
          <span style={{'padding': '0px 0px 0px 0px', 'fontSize': '20px'}}>finding a restaurant by Decade </span>
          <span style={{'padding': '0px 20px 0px 20px', 'fontSize': '20px'}}>or</span>
          <span style={{'padding': '0px 0px 0px 0px', 'fontSize': '20px'}}>picking a restaurant at Random. </span>
        </h5>
      </div>    
    );
  }
}


class DecadeSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      results: {},
      buttonStyle: {'backgroundColor': 'black', 'color':'white', 'width':'150px', 'height':'40px'},
    };
  }

  renderDecadeButton(year) {
    return (
      <DecadeButton 
        value={year} 
        class="btn btn-dark btn-lg"
        onClick={() => this.handleClick(year)} //it should only do the action the thing that has been clicked 
      />
    )
  }

  //On page load, this loads default search for 1960 results
  componentDidMount() {
    window.addEventListener('load', (event) => {
      this.getData(1960)
    });
  }

  //When decade button is clicked, update results using getData
  handleClick(year) {
    this.getData(year)
    alert('clicked ' + year)
  }

  //Gets results from python server and stores in this.state.results
  getData(year) {
    const urlString = '/inputs?decade=' + year
    axios.get(urlString)
    .then(response => {
      console.log(response.data)
      this.setState({results: response.data})
    })
    .catch(error => {console.log(error)})
  }

  //Structures results into output for endpoint
  renderResultsData() {
    return (
      <div className="restaurant"> 
        Results: {Object.keys(this.state.results).length}
        {
          Object.keys(this.state.results).map((key) => ( 
            <div key={key}> 
              <a href={this.state.results[key]['url']}>
                <img src={this.state.results[key]['image_url']} className ="food-pic" alt="" style={{'width':'20%'}} />
              </a>
              <p>{this.state.results[key]['dba_name']}</p>
              Year: {this.state.results[key]['dba_start_date']}
              Name: {this.state.results[key]['name']}
              Neighborhood: {this.state.results[key]['neighborhoods_analysis_boundaries']}
              Categories: {this.state.results[key]['categories']}
              Coordinates: {this.state.results[key]['coordinates']}
              Price: {this.state.results[key]['price']}
              Rating: {this.state.results[key]['rating']}
              Review count: {this.state.results[key]['review_count']}
              
            </div> 
          ))
        }
        
      </div>
    )
  }

  render() {
    return (
      <div className="decadebg opacity-extra-medium bg-black" style={{'padding': '100px 0px 0px 50px'}}>
        <h1>
          Find Restaurants by Decade 
          <span style={{'fontSize': '20px'}}></span>
        </h1>
        <hr></hr>

        <div className="decadeSelector">
          {this.renderDecadeButton(1960)}
          {this.renderDecadeButton(1970)}
          {this.renderDecadeButton(1980)}
          {this.renderDecadeButton(1990)}
          {this.renderDecadeButton(2000)}
        </div>
        <div className="results">
          {this.state.resultsLength}
          {this.renderResultsData()}
        </div>
      </div>
    );
  }
}


class DecadeButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <button 
        className="decadeButton" 
        class={this.props.class}
        type="submit" 
        value={this.props.value} 
        style={this.props.style}
        onClick={this.props.onClick}
      >
        {this.props.value}
      </button>
    )
  }
}

class Restaurant extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="restaurant">
        {this.props}
      </div>
    )
  }
}

class RandomGenerator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      randomResult: {},
      buttonStyle: {'backgroundColor': 'black', 'color':'white', 'width':'200px', 'height':'40px'},
      // buttonTracker: {
      //   1960: buttonStyle,
      //   1970: buttonStyle,
      //   1980: buttonStyle,
      //   1990: buttonStyle,
      //   2000: buttonStyle
      // }
    };
    this.handleClick = this.handleClick.bind(this)
    this.getRandomResult = this.getRandomResult.bind(this)
    this.renderResultsData = this.renderResultsData.bind(this)
  }

  handleClick() {
    this.getRandomResult()
    alert('clicked ')
  }

  getRandomResult() {
    const urlString = '/random'
    axios.get(urlString)
    .then(response => {
      console.log(response.data)
      this.setState({randomResult: response.data})
    })
    .catch(error => {console.log(error)})
  }

  renderResultsData() {
    return (
      <div className="restaurant"> 
        {
          Object.keys(this.state.randomResult).map((key) => ( 
            <div key={key}> 
              <a href={this.state.randomResult[key]['url']}>
                <img src={this.state.randomResult[key]['image_url']} className ="food-pic" alt="" style={{'width':'20%'}} />
              </a>
              <p>{this.state.randomResult[key]['dba_name']}</p>
              Year: {this.state.randomResult[key]['dba_start_date']}
              Name: {this.state.randomResult[key]['name']}
              Neighborhood: {this.state.randomResult[key]['neighborhoods_analysis_boundaries']}
              Categories: {this.state.randomResult[key]['categories']}
              Coordinates: {this.state.randomResult[key]['coordinates']}
              Price: {this.state.randomResult[key]['price']}
              Rating: {this.state.randomResult[key]['rating']}
              Review count: {this.state.randomResult[key]['review_count']}
              
            </div> 
          ))
        }
        
      </div>
    )
  }


  render() {
    return (
      <div className="randombg opacity-extra-medium bg-black" style={{'padding': '100px 0px 0px 50px'}}>
          <div className="container random-form-box">
            <h1>
            Pick a Restaurant at Random.
            <span style={{'fontSize': '20px'}}></span>
          </h1>
          <hr></hr>
          <RandomButton 
          value="Get Random Result"
          className="randomButton btn btn-dark"
          // style={this.state.buttonStyle} 
          onClick={() => this.handleClick()} //it should only do the action the thing that has been clicked 
          />
          {this.renderResultsData()}
        </div>
      </div>
    )
  }

}

class RandomButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <button 
        className={this.props.className}
        type="submit" 
        // value={this.props.value} 
        style={this.props.style}
        onClick={this.props.onClick}
      >
        {this.props.value}
      </button>
    )
  }
}

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.menuButtonClicked = this.menuButtonClicked.bind(this)
    this.renderMenuButton = this.renderMenuButton.bind(this)  
    this.state = {
      email: "",
      password: "",
      loggedIn: null,
      userId: null,
      showMessage: true,
      message: "",
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.loginUserPost = this.loginUserPost.bind(this);
    this.updateLoginStatus = this.updateLoginStatus.bind(this);
  }

  handleEmailChange(event) {
    this.setState({email: event.target.value});
    console.log(this.state.email)
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
    console.log(this.state.password)
  }

  loginUser(e){
    e.preventDefault();
    console.log('login user')

    let symbol_regex = RegExp('["\']');
    let valid_email = !symbol_regex.test(this.state.email)
    let valid_password = !symbol_regex.test(this.state.password) 
    console.log(valid_email, valid_password)

    if (!valid_email) {
      // alert("Invalid email entered. Please try again.")
      this.setState({
        showMessage: true,
        message: "Invalid email entered. Please try again."
      })
    } else if (!valid_password) {
      // alert("Invalid password. Please try again")
      this.setState({
        showMessage: true,
        message: "Invalid password. Please try again"
      })
    } else {
      this.loginUserPost()
    }

  }

  loginUserPost() {
    axios.post('/login',{
      email: this.state.email,
      password: this.state.password
    })
    .then(response => {
      console.log(response.data)
      this.setState({
        loggedIn: response.data['logged_in'],
        userId: response.data['user_id'],
        message: response.data['message']
      })
      console.log("RESPONSE: ", response.data['user_id'], response.data['logged_in'], response.data['message'])
      console.log("state: ", this.state.loggedIn, this.state.userId, this.state.message)

    })
    .catch(error => {
      console.log(error)
    })
  }

  updateLoginStatus(login) {
    console.log("before" + login)
    this.props.changeLogin(login)
    console.log("after" + login)
  }

  menuButtonClicked(route) {
    this.props.changePage(route) 
    //change state of parent component, to track which page we're on
    //rendering will happen in app component, calls the function in the parent component/app
  }
  
  renderMenuButton(route) {
    return (
      <DecadeButton 
        value={route} 
        // className={this.state.className} 
        // style={this.state.buttonStyle} 
        onClick={() => this.menuButtonClicked(route)} //it should only do the action the thing that has been clicked 
      />
    )
  }

  render() {
    return (
      <div className="loginbg" style={{'padding': '100px 0px 0px 50px'}}>
        <div className="login-form-box">
          <h1>Account Login</h1>

          <hr></hr>

          <FlashMessage 
            showMessage={this.state.showMessage}
            message={this.state.message}
          />
        
          <form>
            <p><span>
              <input className="input inputbg" type="text" placeholder=" Enter Email" name="email" value={this.state.email} onChange={this.handleEmailChange} required></input>
            </span></p>
            <p><span>
              <input className="input inputbg" type="password" placeholder=" Enter Password" name="password" value={this.state.password} onChange={this.handlePasswordChange} required></input>
            </span></p>
            <p><span className="center">
              <button type="submit" className="submitButton btn btn-dark login-button" onClick={this.loginUser}>Login</button>
            </span></p>
            <p><span className="center">
              <p>Create an account? {this.renderMenuButton('Register')}</p>
            </span></p>
          </form>
          </div>
      </div>

      
    ) 
  }

}


class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      repeatPassword: "",
      status: false,
      showMessage: true,
      message: "",
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSecondPasswordChange = this.handleSecondPasswordChange.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.registerUserPost = this.registerUserPost.bind(this);
    this.menuButtonClicked = this.menuButtonClicked.bind(this);
    this.renderMenuButton = this.renderMenuButton.bind(this);
  }

  handleEmailChange(event) {
    this.setState({email: event.target.value});
    console.log(this.state.email)
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
    console.log(this.state.password)
  }

  handleSecondPasswordChange(event) {
    this.setState({repeatPassword: event.target.value});
    console.log(this.state.repeatPassword)
  }

  registerUser(e){
    e.preventDefault();
    console.log('register user')
    // let valid_email = "/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/"
    // let valid_email = RegExp('[^@]+@[^\.]+\..+\.com');
    let gmail_regex = RegExp('[^@]+@gmail\.com');
    let yahoo_regex = RegExp('[^@]+@yahoo\.com');
    let hotmail_regex = RegExp('[^@]+@hotmail\.com');
    let symbol_regex = RegExp('["\']');
    let valid_email =  !symbol_regex.test(this.state.email) && (gmail_regex.test(this.state.email) || yahoo_regex.test(this.state.email) || hotmail_regex.test(this.state.email))
    let valid_password = this.state.password == this.state.repeatPassword

    if (valid_email && valid_password) {
      this.registerUserPost();
      //change message in registerUserPost function
    } else if (!valid_password) {
      this.setState({
        showMessage: true,
        message: "Passwords do not match."
      })
    } else if (!valid_email) {
      this.setState({
        showMessage: true,
        message: "Invalid email entered. Please try again."
      })
    }

  }

  registerUserPost() {
    axios.post('/register',{
      email: this.state.email,
      password: this.state.password
    })
    .then(response => {
      console.log("response:" + response.data)
      this.setState({
        showMessage: response.data[0],
        message: response.data[1]
      })
    })
    .catch(error => {
      console.log(error)
    })
  }

  menuButtonClicked(route) {
    this.props.changePage(route) 
    //change state of parent component, to track which page we're on
    //rendering will happen in app component, calls the function in the parent component/app
  }
  
  renderMenuButton(route) {
    return (
      <DecadeButton 
        value={route} 
        className={this.state.className} 
        style={this.state.buttonStyle} 
        onClick={() => this.menuButtonClicked(route)} //it should only do the action the thing that has been clicked 
      />
    )
  }

  render() {
    return (
      <div className="registerbg opacity-extra-medium bg-black" style={{'padding': '100px 0px 0px 50px'}}>
        <div className="registration-form-box">
          <h1>
            Registration
            <span style={{'fontSize': '20px'}}></span>
          </h1>

          <hr></hr>
          
          <FlashMessage 
            showMessage={this.state.showMessage}
            message={this.state.message}
          />

          <form>
            <div className="container">
              <p><span>
                <label for="email"><b>Enter Email:</b></label>
                <input className="input inputbg" type="text" placeholder="Enter Email" name="email" value={this.state.email} onChange={this.handleEmailChange} required></input>
              </span></p>
              <p><span>
                <label for="password"><b>Enter Password:</b></label>
                <input className="input inputbg" type="password" placeholder="Enter Password" name="password" value={this.state.password} onChange={this.handlePasswordChange} required></input>
              </span></p>
              <p><span>
                <label for="password-repeat"><b>Enter Password again:</b></label>
                <input className="input inputbg" type="password" placeholder="Enter Password" name="password" value={this.state.repeatPassword} onChange={this.handleSecondPasswordChange} required></input>
              </span></p>
              <p><span>
                <button type="submit" className="registerButton btn btn-dark login-button center" onClick={this.registerUser}>Register</button>
              </span></p>
            </div>
            
            <div className="container signin center">
              <p>Already have an account? {this.renderMenuButton('Login')}</p>
            </div>

          </form>
        </div>
      </div>
    )
  }
}

class FlashMessage extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div>
        {this.props.showMessage && <div className="error-message">{this.props.message}</div>}
      </div>
    );
  }
}

// ---------------------------------------------

ReactDOM.render(
  <App />, 
  document.getElementById('root') 
);


//-------------------- OLD CODE --------------------------
// class PageHeader extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//     this.menuButtonClicked = this.menuButtonClicked.bind(this);
//     this.renderMenuButton = this.renderMenuButton.bind(this);
//   }
  
//   menuButtonClicked(route) {
//     //change state of parent component, to track which page we're on
//     //rendering will happen in app component, calls the function in the parent component/app
//     this.props.changePage(route) 
//   }
  
//   renderMenuButton(route) {
//     //when the menu button is clicked, we pass the route to the function changePage to change the page in App
//     return (
//       <DecadeButton 
//         value={route} 
//         className={this.state.className} 
//         style={this.state.buttonStyle} 
//         onClick={() => this.menuButtonClicked(route)} 
//         //This is a function callback, closure 
//         //it should only call the function when the button is clicked, and allows us to pass a function
//         // otherwise this function would be called immediately if used this.menuButtonClicked
//       />
//     )
//   }

//   //Page Title and all menu buttons
//   render() {
//     return (
//       <div className="header">
//         <header className="panel center opacity" style={{ padding: '50px 16px 20px 16px' }}>
//           <div className="padding-20">
//               <div className="bar border">
//                 {this.renderMenuButton('About')}
//                 {this.renderMenuButton('Decade')}
//                 {this.renderMenuButton('Random')}
//                 {this.renderMenuButton('Login')}
//                 {this.renderMenuButton('Register')}
//               </div>
//           </div>
//         </header>
//       </div>
//     );
//   }
// }

class ResultMap extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="resultMap">Map Page</div>
    );
  }
}

class MenuButton extends React.Component {
  constructor(props) {
    super(props);
  }

  //Props = Page Header
  render() {
    return (
      <button 
        className={this.props.className}
        type="submit" 
        value={this.props.value} 
        style={this.props.style}
      >
      </button>
    )
  }
}


// class SearchBox extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     return (
//       <div className="search-box">
//         <form>
//           <input type="text" placeholder="Search.." name="search" />
//           <button type="submit"><i className="fa fa-search"></i></button>
//         </form>      
//       </div>
//     )
//   }
// }
