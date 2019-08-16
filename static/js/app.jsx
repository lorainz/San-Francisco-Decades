class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decade: null,
      currentpage: 0,
      pages: [<DecadeSelector />, "holder map", <RandomGenerator />, <Login />, <Register />],
      pageIdx: {
        'About': 0,
        'Map': 1,
        'Random': 2,
        'Login' : 3,
        'Register': 4
      }, 
    };
    this.changePage = this.changePage.bind(this) // 
  }

  changePage(route) {
    this.setState({currentpage: this.state.pageIdx[route]});
  }
  
  render() {
    return (
      <div className="page">
        <PageHeader 
        changePage={this.changePage}/>
        {this.state.pages[this.state.currentpage]}
      </div>
    )
    // changepage={this.changepage} // these are props
    //{this.state.pages[this.state.currentPage]} these go in the return ()
  }
}

// class Map extends React.Component {
//   constructor(props) {
//     super(props);
//   };

//   initMap(){
//     // Map zoom and center
//     var options = {
//       zoom:14,
//       center: {lat:37.7920, lng:-122.4501}
//     }
//     // Display map
//     // var map = new google.maps.Map(document.getElementById('map'), options);
//   }

// }


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

  //When decade button is clicked, update results using getData
  handleClick(route) {
    alert('clicked ' + route)
  }

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
        Results: {Object.keys(this.state.randomResult).length}
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
      password: ""
    }
  }

  render() {
    return (
      <div className="Login panel center">
        <div className="opacity">
          <h1>Login</h1>
          <hr></hr>
        </div>

        <form action="/">
          <div className="imgcontainer">
            <img src="https://cdn.akc.org/Marketplace/Breeds/Pembroke_Welsh_Corgi_SERP.jpg" alt="corgi" className="loginImage" style={{ width: '500px' }}/>
          </div>

          <div className="container opacity">
            <label for="email"><b>Username</b></label>
            <input type="text" placeholder="Enter Email" name="email" required></input>

            <label for="password"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="password" required></input>

            <button type="submit" className="submitButton">Login</button>
          </div>

        </form>
      </div>
    )
  }

}

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      email:"",
      password:""
    }
  }

  render() {
    return (
      <div className="register panel center opacity">
        <form action="/">
          <h1>Register</h1>
          <p>Please fill in the form below.</p>
          <hr></hr>

          <div className="imgcontainer">
            <img src="https://img.buzzfeed.com/buzzfeed-static/static/2014-09/23/12/enhanced/webdr10/longform-original-22600-1411489016-22.jpg?downsize=700%3A%2A&output-quality=auto&output-format=auto&output-quality=auto&output-format=auto&downsize=360:*" alt="corgi" className="loginImage" style={{ width: '200px', opacity: '1' }}/>
          </div>

          <div className="container">
            <label for="email"><b>Username</b></label>
            <input type="text" placeholder="Enter Email" name="email" required></input>

            <label for="password"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="password" required></input>

            <label for="password-repeat"><b>Password</b></label>
            <input type="password" placeholder="Repeat Password" name="password-repeat" required></input>

            <button type="submit" className="registerButton">Register</button>
          </div>
          
          <div className="container signin">
            <p>Already have an account? ADD link/BUTTON</p>
          </div>

        </form>
      </div>
    )
  }

}


// ---------------------------------------------

ReactDOM.render(
  <App />, 
  document.getElementById('root') 
);
