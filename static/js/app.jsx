// import ResultMap from './components/resultMap';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.changePage = this.changePage.bind(this); // allows pageheader menu buttons to change page
    this.changeLogin = this.changeLogin.bind(this); // need to check this before this.state to be able to this.setState
    this.state = {
      results: [],
      decade: null,
      userlogin: [],
      currentpage: 0,
      pages: [
        <DecadeSelector/>,  
        // <DecadeSelector results={this.state.results}/>, 
        <ResultMap />, 
        <RandomGenerator />, 
        <Login changeLogin={this.changeLogin}/>, 
        <Register changePage={this.changePage}/>
      ],
      pageIdx: {
        'About': 0,
        'Map': 1,
        'Random': 2,
        'Login' : 3,
        'Register': 4
      }, 
    };

  }

  //This is passed to PageHeader to be able to call this function when a menuButton is clicked
  changePage(route) {
    this.setState({currentpage: this.state.pageIdx[route]});
    console.log(this.state.pageIdx, route)
  }

  changeLogin(login) {
    console.log("BEFORE LOGGED IN:" + login)
    this.setState({userlogin: login}); // why is this throwing an error
    // this.setState({login: id});
    console.log("LOGGED IN:" + login)
    
  }

  
  render() {
    return (
      <div className="page">
        <PageHeader 
        changePage={this.changePage}/>
        {this.state.pages[this.state.currentpage]}
      </div>
    )
  }
}

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


class PageHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      className: "bar-item button",
      classNameGrey: "bar-item button light-grey"
      // buttonStyle: {'backgroundColor': 'black', 'color':'white', 'width':'150px', 'height':'40px'},
    };
    this.menuButtonClicked = this.menuButtonClicked.bind(this);
    this.renderMenuButton = this.renderMenuButton.bind(this);
  }
  
  menuButtonClicked(route) {
    //change state of parent component, to track which page we're on
    //rendering will happen in app component, calls the function in the parent component/app
    this.props.changePage(route) 
  }
  
  renderMenuButton(route) {
    //when the menu button is clicked, we pass the route to the function changePage to change the page in App
    return (
      <DecadeButton 
        value={route} 
        className={this.state.className} 
        style={this.state.buttonStyle} 
        onClick={() => this.menuButtonClicked(route)} 
        //This is a function callback, closure 
        //it should only call the function when the button is clicked, and allows us to pass a function
        // otherwise this function would be called immediately if used this.menuButtonClicked
      />
    )
  }

  //Page Title and all menu buttons
  render() {
    return (
      <div className="header">
        <header className="panel center opacity" style={{ padding: '50px 16px 20px 16px' }}>
          <h1 className="xlarge">San Francisco</h1>
          <h1>Decades</h1>
          <div className="padding-20">
              <div className="bar border">
                {this.renderMenuButton('About')}
                {this.renderMenuButton('Map')}
                {this.renderMenuButton('Random')}
                {this.renderMenuButton('Login')}
                {this.renderMenuButton('Register')}
              </div>
          </div>
        </header>
      </div>
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

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="search-box">
        <form>
          <input type="text" placeholder="Search.." name="search" />
          <button type="submit"><i className="fa fa-search"></i></button>
        </form>      
      </div>
    )
  }
}


class DecadeSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      results: {},
      buttonStyle: {'backgroundColor': 'black', 'color':'white', 'width':'150px', 'height':'40px'},
      // buttonTracker: {
      //   1960: buttonStyle,
      //   1970: buttonStyle,
      //   1980: buttonStyle,
      //   1990: buttonStyle,
      //   2000: buttonStyle
      // }
    };
  }

  renderDecadeButton(year) {
    return (
      <DecadeButton 
        value={year} 
        style={this.state.buttonStyle} 
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
      <div className="body">
        <div className="decadeSelector">
          <SearchBox />
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
      buttonStyle: {'backgroundColor': 'black', 'color':'white', 'width':'150px', 'height':'40px'},
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
      <div className="randomGenerator panel center opacity">
        <h1>RANDOM RESULT</h1>
        <RandomButton 
        value="Get Random Result"
        style={this.state.buttonStyle} 
        onClick={() => this.handleClick()} //it should only do the action the thing that has been clicked 
        />
        {this.renderResultsData()}
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
        className="randomButton" 
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
    this.state = {
      email: "",
      password: "",
      login: [],
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
      alert("Invalid email entered. Please try again.")
    } else if (!valid_password) {
      alert("Invalid password. Please try again")
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
      this.setState({login: response.data})
      console.log("state login:" + this.state.login)
      this.updateLoginStatus(this.state.login)
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

  render() {
    return (
      <div className="Login panel center">
        <div className="opacity">
          <h1>Login</h1>
          <FlashMessage />
          <hr></hr>
        </div>

        <form>
          <div className="imgcontainer">
            <img src="https://cdn.akc.org/Marketplace/Breeds/Pembroke_Welsh_Corgi_SERP.jpg" alt="corgi" className="loginImage" style={{ width: '500px' }}/>
          </div>

          <div className="container opacity">
            <label for="email"><b>Username</b></label>
            <input type="text" placeholder="Enter Email" name="email" value={this.state.email} onChange={this.handleEmailChange} required></input>

            <label for="password"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="password" value={this.state.password} onChange={this.handlePasswordChange} required></input>

            <button type="submit" className="submitButton" onClick={this.loginUser}>Login</button>
            <p>Click here to Register</p>
          </div>

        </form>
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
      showError: false,
      errorMessage: "",
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

    console.log(valid_email, valid_password)

    if (valid_email && valid_password) {
      this.registerUserPost();
      this.setState({showError: false,
        errorMessage: "Invalid email entered. Please try again."
      })
    } else if (!valid_password){
      // alert("Passwords do not match.")
      this.setState({showError: true,
        errorMessage: "Passwords do not match."
      })
    } else if (!valid_email) {
      // alert("Invalid email entered. Please try again.")
      this.setState({showError: true,
        errorMessage: "Invalid email entered. Please try again."
      })
    }

  }

  registerUserPost() {
    axios.post('/register',{
      email: this.state.email,
      password: this.state.password
    })
    .then(response => {
      console.log(response.data)
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
      <div className="register panel center opacity">
        <form>
          <h1>Register</h1>
          <p>Please fill in the form below.</p>
          <FlashMessage 
            showError={this.state.showError}
            errorMessage={this.state.errorMessage}
          />
          <hr></hr>

          <div className="imgcontainer">
            <img src="https://img.buzzfeed.com/buzzfeed-static/static/2014-09/23/12/enhanced/webdr10/longform-original-22600-1411489016-22.jpg?downsize=700%3A%2A&output-quality=auto&output-format=auto&output-quality=auto&output-format=auto&downsize=360:*" alt="corgi" className="loginImage" style={{ width: '200px', opacity: '1' }}/>
          </div>

          <div className="container">
            <label for="email"><b>Username</b></label>
            <input type="text" placeholder="Enter Email" name="email" value={this.state.email} onChange={this.handleEmailChange} required></input>

            <label for="password"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="password" value={this.state.password} onChange={this.handlePasswordChange} required></input>

            <label for="password-repeat"><b>Enter Password again:</b></label>
            <input type="password" placeholder="Enter Password" name="password" value={this.state.repeatPassword} onChange={this.handleSecondPasswordChange} required></input>

            <button type="submit" className="registerButton" onClick={this.registerUser}>Register</button>
          </div>
          
          <div className="container signin">
            <p>Already have an account? {this.renderMenuButton('Login')}</p>
          </div>

        </form>
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
        {this.props.showError && <div className="error-message">{this.props.errorMessage}</div>}
      </div>
    );
  }
}

// ---------------------------------------------

ReactDOM.render(
  <App />, 
  document.getElementById('root') 
);
