class App extends React.Component {
  constructor(props) {
    super(props);
    // need to bind these functions before this.state to be able to this.setState
    this.changePage = this.changePage.bind(this);
    this.changeLogin = this.changeLogin.bind(this); 
    this.state = {
      router: 0, // Nav, Login, Register 
      searchResult: [], // Search Result
      loginEmail: null, // Login
      userId: null, // Likes
      userLikes: null, // Likes
    };
    this.route = {
      routeIndex: {'About': 0, 'Decade': 1, 'Random': 2, 'Login' : 3, 'Register': 4, 'SearchResult': 5, 'Likes': 6}, 
    };
  }

  // On page load, this loads default search for 1960 results

  //This is passed to PageHeader to be able to call this function when a menuButton is clicked
  changePage(route, searchResult) {
    // console.log("CHANGE PAGE")
    if (route === 'Login' || route === 'Likes') {
      this.getUserLikes(this.state.userId)
      // alert("grabbing likes")
    }

    this.setState({
      router: this.route.routeIndex[route],
      searchResult: searchResult,
    });


    console.log(this.state.searchResult)
    // console.log(this.route.routeIndex, route) // test
  }
  
  changeLogin(loginEmail, userId) {
    // console.log("BEFORE LOGGED IN:" + status) // test
    this.setState({
      loginEmail: loginEmail,
      userId: userId,
    }); 
    this.changePage('About', [])
    console.log("CHANGE APP LOGIN :" + this.state.loginEmail, this.state.userId) // test
    this.getUserLikes(this.state.userId)
  }

  getUserLikes() {
    console.log('get likes for user: ' + this.state.userId)

    const urlString = '/getUserLikes?userid=' + this.state.userId
    axios.get(urlString)
    .then(response => {
      // console.log(response.data)
      this.setState({
        userLikes: response.data
      },
        () => console.log(this.state.userLikes)
      )
    })
    .catch(error => {console.log(error)})
  }

  render() {
    var routes = [
      <AboutPage changePage={this.changePage}/>,  
      <DecadeSelector userId={this.state.userId}/>, 
      <RandomGenerator userId={this.state.userId}/>, 
      <Login changePage={this.changePage} changeLogin={this.changeLogin} />, 
      <Register changePage={this.changePage}/>,
      <SearchResult />,
      <Likes results={this.state.userLikes} /> // loginEmail={this.state.loginEmail} userLikes={this.state.UserLikes} passes null
    ]

    // var routeIndex = {'About': 0, 'Decade': 1, 'Random': 2, 'Login' : 3, 'Register': 4, 'SearchResult': 5, 'Likes': 6}

    return (
      <div>
        <NavigationBar changePage={this.changePage} loginEmail={this.state.loginEmail} userId={this.state.userId}/>
        {routes[this.state.router]}
      </div>
    )
  }
}


class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.renderMenuButton = this.renderMenuButton.bind(this);
    this.menuButtonClicked = this.menuButtonClicked.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
    this.searchTermButtonClicked = this.searchTermButtonClicked.bind(this);
    this.getSearchResult = this.getSearchResult.bind(this);
    this.state = {
      searchTerm: "",
      searchResults: [],
    }
  }

  //Change page (state) of parent component to track what page we are on, Rendering occurs in parent component when the function is called in the parent component
  menuButtonClicked(route) {
    this.props.changePage(route) 
  }
  
  renderMenuButton(route) {
    return (
      <GeneralButton 
        value={route} 
        className="nav-item btn btn-link nav-link" 
        onClick={() => this.menuButtonClicked(route)} 
      />
        //when the menu button is clicked, we pass the route to the function changePage to change the page in App
        //This is a function callback, closure 
        //it should only call the function when the button is clicked, and allows us to pass a function
        // otherwise this function would be called immediately if used this.menuButtonClicked
    )
  }

  handleSearchTermChange(event) {
    this.setState({searchTerm: event.target.value});
    console.log(this.state.searchTerm);
  }

  searchTermButtonClicked(e, route) {
    e.preventDefault();
    this.props.changePage(route, this.state.searchResults);
    this.getSearchResult()
    // console.log(this.state.searchResults)
  }

  getSearchResult(){
    console.log('search result:' + this.state.searchTerm);
    const urlString = '/inputs?searchterm=' + this.state.searchTerm;
    axios.get(urlString)
    .then(response => {
      this.setState({searchResults: response.data},
      () => {console.log("SEARCH RESULT: "); console.log(this.state.searchResult);}
      )
    })
    .catch(error => {console.log(error)})
  }

  render() {
    if (this.props.loginEmail == null) {
      return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top justify-content-between">
          <a className="navbar-brand" href="#">San Francisco Decades </a>
  
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
  
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item"> {this.renderMenuButton('About')} </li>
              <li className="nav-item"> {this.renderMenuButton('Decade')} </li>
              <li className="nav-item"> {this.renderMenuButton('Random')} </li>
              <li className="nav-item"> {this.renderMenuButton('Login')} </li>
              <li className="nav-item"> {this.renderMenuButton('Register')} </li>
            </ul>
          </div>
          <div>
          </div>
  
          <form className="form-inline">
          <input 
            className="form-control mr-sm-2" 
            type="search" 
            placeholder="Search for restaurant" 
            aria-label="Search" 
            onChange={this.handleSearchTermChange} value={this.state.searchTerm}
          />
          <button 
            value="SearchResult"
            className="btn btn-outline-secondary my-2 my-sm-0" 
            type="submit"
            onClick={(e) => this.searchTermButtonClicked(e, 'SearchResult')}
            >
              <i className="fa fa-search fa-fw"></i>
          </button>
        </form>
        </nav>
        )
    } else {
      return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top justify-content-between">
          <a className="navbar-brand" href="#">San Francisco Decades </a>
  
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
  
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item"> {this.renderMenuButton('About')} </li>
              <li className="nav-item"> {this.renderMenuButton('Decade')} </li>
              <li className="nav-item"> {this.renderMenuButton('Random')} </li>
              <li className="nav-item"> {this.renderMenuButton('Likes')} </li>
            </ul>
          </div>

          <p style={{'padding': '0px 40px 0px 0px'}}>Welcome back, {this.props.loginEmail}, {this.props.userId} </p>
  
          <form className="form-inline">
          <input 
            className="form-control mr-sm-2" 
            type="search" 
            placeholder="Search for restaurant" 
            aria-label="Search" 
            onChange={this.handleSearchTermChange} value={this.state.searchTerm}
          />
          <button 
            value="SearchResult"
            className="btn btn-outline-secondary my-2 my-sm-0" 
            type="submit"
            onClick={(e) => this.searchTermButtonClicked(e, 'SearchResult')}
            >
              <i className="fa fa-search fa-fw"></i>
          </button>
        </form>
        </nav>
      )
    }

  }
}


class SearchResult extends React.Component {
  constructor(props) {
    super(props);    
  }

  render() {
    return (
      <div className="randombg paddingbg" style={{'padding': '100px 0px 0px 50px'}}>
        <div className="container result-box">
          <div className="center">
            <div className="container">
              <h1>Search Result</h1>
              <hr />
              <div className="center">Search Page</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


class GeneralButton extends React.Component {
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
        onClick={this.props.onClick}
      >
        {this.props.value}
      </button>
    )
  }
}


class AboutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  //Change page (state) of parent component to track what page we are on, Rendering occurs in parent component when the function is called in the parent component
  menuButtonClicked(route) {
    this.props.changePage(route) 
  }
  
  renderMenuButton(route) {
    return (
      <GeneralButton value={route} className="btn btn-dark" onClick={() => this.menuButtonClicked(route)} />
        //when the menu button is clicked, we pass the route to the function changePage to change the page in App
        //This is a function callback, closure 
        //it should only call the function when the button is clicked, and allows us to pass a function
        // otherwise this function would be called immediately if used this.menuButtonClicked
    )
  }

  render() {
    return (
      <div className="aboutbg paddingbg">
        <div className="center">
          <div className="container header-box">
            <h1 className="center">
              San Francisco Decades 
              <span style={{'padding': '0px 10px', 'fontSize': '20px'}}> allows you to explore restaurants with a new perspective.</span>
            </h1>
            
            <hr />
            <h5 className="center" style={{'fontSize': '20px'}}> 
              <span> Find a restaurant by </span><span style={{'padding': '0px 0px 0px 20px'}}>{this.renderMenuButton('Decade')}</span>
              <span style={{'padding': '0px 50px 0px 50px'}}>or</span>
              <span>Pick a restaurant at </span><span  style={{'padding': '0px 0px 0px 20px'}}>{this.renderMenuButton('Random')} </span>
              <span></span>
            </h5>
          </div>
        </div>
      </div>    
    );
  }
}


class DecadeSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.renderDecadeButton = this.renderDecadeButton.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getData = this.getData.bind(this);
    this.renderResultsData = this.renderResultsData.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.renderCategories = this.renderCategories.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.getCategoryData = this.getCategoryData.bind(this);
    this.likeButtonClicked = this.likeButtonClicked.bind(this);
    this.state = {
      // showResults: true,
      results: [],
      year: null,
      categories: [],
      category: "Select category:",
      categoryResults: [],
    };
  }

  renderDecadeButton(year) {
    return (
      <GeneralButton value={year} className="btn btn-dark btn-lg" onClick={() => this.handleClick(year)} />
      //it should only do the action the thing that has been clicked       
    )
  }


  //When decade button is clicked, update results using getData
  handleClick(year) {
    // this.setState({showResults: true})
    this.getData(year)
    this.getCategories(year)
    // alert('clicked ' + year)
  }

  //Gets results from python server and stores in this.state.results
  getData(year) {
    const urlString = '/inputs?decade=' + year
    axios.get(urlString)
    .then(response => {
      // console.log(response.data)
      this.setState({results: response.data, year: year, category: "Select category:"})
    })
    .catch(error => {console.log(error)})
  }

  //Structures results into output for endpoint 
  renderResultsData() {
    return (
      <div className="restaurant"> 
        <div style={{'padding': '10px'}}>
          {this.renderCategories()}
          Results: {Object.keys(this.state.results).length}
        </div>

        <div className="grid-container">
          {       
            Object.keys(this.state.results).map((key, i) => (
              
              <div key={key} style={{'width':'300px', 'height': '300px'}}> 
                <p><span style={{'fontSize': '16px', 'padding': '10px', 'fontWeight': 'bold'}}>{this.state.results[key]['name']}, <br />{this.state.results[key]['dba_start_date']}</span><span></span></p>
                <div style={{'textAlign': 'center'}}>
                  <p><a href={this.state.results[key]['url']}><img src={this.state.results[key]['image_url']} className="food-pic-results" alt="" /></a></p>
                </div>
                <button 
                  value={this.state.results[key]['ttxid']}
                  className="btn btn-outline-dark my-2 my-sm-0" 
                  type="submit"
                  onClick={(e) => this.likeButtonClicked(e)}
                  >
                    <i class="far fa-heart"></i>
                </button>
                <div style={{'textAlign' : 'left', 'padding': '10px'}}>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Location: {this.state.results[key]['neighborhoods_analysis_boundaries']}</p>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Categories: {this.state.results[key]['categories']}</p>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Price: {this.state.results[key]['price']}</p>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Rating: {this.state.results[key]['rating']}</p>
                </div>
              </div> 
            ))
          }              
        </div>
      </div>
    )
  }

  getCategories(year) {
    const urlString = '/categories?decade=' + year 
    axios.get(urlString)
    .then(response => {
      // console.log(response.data)
      this.setState({categories: response.data})
    })
    .catch(error => {console.log(error)})
  }

  renderCategories() {
    return (
      <div>
        <select id="category" onChange={this.changeCategory} value={this.state.category}>
          <option value="Select category:" disabled>Select category:</option>
          {this.state.categories.map((category) =>
            <option key={category} value={category}>{category}</option>
          )}
        </select>
      </div>
    )
  }

  changeCategory(event) {
    this.setState(
      {
        category: event.target.value
      },
      
      this.getCategoryData // callback
    )
  }

  getCategoryData() {
    const urlString = '/inputs?decade=' + this.state.year + '&category=' + this.state.category
    axios.get(urlString)
    .then(response => {
      // console.log(response.data)
      this.setState({results: response.data, showResults: true},
        console.log(this.state.results)
      )
    })
    .catch(error => {console.log(error)})
  }

  likeButtonClicked(e) {
    e.preventDefault()
    if (this.props.userId == null) {
      alert("Please login to like a restaurant")
    } else {
      this.addUserLike(this.props.userId, e.currentTarget.value) //userid, ttxid
    }
    // console.log(e.currentTarget.value, this.props.userId)
  }

  addUserLike(userid, ttxid) {
    console.log("nothing")
    axios.post('/addUserLike',{
      userid: userid,
      ttxid: ttxid
    })
    .then(response => {
      // console.log("response:" + response.data['liked'])
      if (response.data['liked']) {
        alert('Thanks for liking this business! Check your like page.')
      } else {
        alert('You\'ve already liked this business. Check your like page.')
      }
    })
    .catch(error => {
      console.log(error)
    })
  }


  render() {
    if (Object.keys(this.state.results).length == 0) {
      return(
        <div className="decadebg paddingbg">
          <div className="container result-box">
            <h1 className="center">Find Restaurants by Decade </h1>
            <hr />

            <div className="decadeSelector center">
              {this.renderDecadeButton(1960)}<div className="divider"/>
              {this.renderDecadeButton(1970)}<div className="divider"/>
              {this.renderDecadeButton(1980)}<div className="divider"/>
              {this.renderDecadeButton(1990)}<div className="divider"/>
              {this.renderDecadeButton(2000)}
            </div>

      
          </div>
        </div>
      )
    } else {
    return (
      <div className="decadebg paddingbg">
        <div className="container result-box">
          <h1 className="center">Find Restaurants by Decade </h1>
          <hr />

          <div className="decadeSelector center">
            {this.renderDecadeButton(1960)}<div className="divider"/>
            {this.renderDecadeButton(1970)}<div className="divider"/>
            {this.renderDecadeButton(1980)}<div className="divider"/>
            {this.renderDecadeButton(1990)}<div className="divider"/>
            {this.renderDecadeButton(2000)}
          </div>

          <div className="results center">
            <div style={{'display': 'flex', 'width': '1200px'}}>
              {this.renderResultsData()}
            </div>
          </div>
        </div>
      </div>
      );
    }
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
    this.handleClick = this.handleClick.bind(this);
    this.getRandomResult = this.getRandomResult.bind(this);
    this.renderResultsData = this.renderResultsData.bind(this);
    this.likeButtonClicked = this.likeButtonClicked.bind(this);
    this.addUserLike = this.addUserLike.bind(this);
    this.state = {
      randomResult: {},
    };
  }

  handleClick() {
    this.getRandomResult()
    // alert('clicked ')
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
      <div className="restaurant" style={{'textAlign': 'center'}}> 
        {
          Object.keys(this.state.randomResult).map((key) => ( 
            <div key={key} style={{'width':'300px'}}> 
              <p style={{'fontSize': '20px'}}>{this.state.randomResult[key]['name']}, {this.state.randomResult[key]['dba_start_date']}</p>
              <div><a href={this.state.randomResult[key]['url']}>
                <div className="img-container">
                  <img src={this.state.randomResult[key]['image_url']} className ="food-pic" alt="" />
                  <div className="overlay"></div>
                </div>
              </a></div>
              <div style={{'padding': '10px 0px 10px 0px'}}>
                <button 
                  value={this.state.randomResult[key]['ttxid']}
                  className="btn btn-outline-dark my-2 my-sm-0" 
                  type="submit"
                  onClick={(e) => this.likeButtonClicked(e)}
                  >
                    <i class="far fa-heart"></i>
                </button>
              </div>
              <div style={{'textAlign' : 'left'}}>
              <p style={{'margin': '0px', 'padding': '0px 0px 4px 25px'}}>ttxid: {this.state.randomResult[key]['ttxid']}</p>
                <p style={{'margin': '0px', 'padding': '0px 0px 4px 25px'}}>Neighborhood: {this.state.randomResult[key]['neighborhoods_analysis_boundaries']}</p>
                <p style={{'margin': '0px', 'padding': '0px 0px 4px 25px'}}>Categories: {this.state.randomResult[key]['categories']}</p>
                <p style={{'margin': '0px', 'padding': '0px 0px 4px 25px'}}>Price: {this.state.randomResult[key]['price']}</p>
                <p style={{'margin': '0px', 'padding': '0px 0px 4px 25px'}}>Rating: {this.state.randomResult[key]['rating']}</p>
              </div>
            </div> 
          ))
        }
        
      </div>
    )
  }

  likeButtonClicked(e) {
    e.preventDefault()
    if (this.props.userId == null) {
      alert("Please login to like a restaurant")
    } else {
      this.addUserLike(this.props.userId, e.currentTarget.value) //userid, ttxid
    }
    // console.log(e.currentTarget.value, this.props.userId)
  }

  addUserLike(userid, ttxid) {
    console.log("nothing")
    axios.post('/addUserLike',{
      userid: userid,
      ttxid: ttxid
    })
    .then(response => {
      // console.log("response:" + response.data['liked'])
      if (response.data['liked']) {
        alert('Thanks for liking this business! Check your like page.')
      } else {
        alert('You\'ve already liked this business. Check your like page.')
      }
    })
    .catch(error => {
      console.log(error)
    })
  }

  render() {
    return (
      <div className="randombg paddingbg" style={{'padding': '100px 0px 0px 50px'}}>
        <div className="container result-box">
          <div className="center">
            <div className="container">
              <h1>Pick a Restaurant at Random.</h1>
              <hr />
              <div className="center">{this.renderResultsData()}</div>
              <div style={{'padding': '15px 0px 15px 0px'}}><GeneralButton value="Get Random Result" className="btn btn-dark" onClick={() => this.handleClick()} /></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}


  // getDataWithCategories() {
  //   console.log(this.state.results),
  //   console.log(this.state.category)
  //   Object.keys(this.state.results).map(key => (
  //     if (this.state.results[key]['categories'].includes(this.state.category))
  //       return ()
  //       // this.setState({
  //       //   changeCategory: this.state.changeCategory.concat(this.state.results[key])
  //       // })
  //   ))
    
  // }

    // renderResultsDataBootstrap() {
  //   Object.keys(this.state.results).map(key => {
  //     if (key % 4 == 3 || key == Object.keys(this.state.results).length) {
  //       <div>key</div>
  //     }
  //   })
  //   // this.setState({results: [1, 2]})
  // }


  //On page load, this loads default search for 1960 results
  // componentDidMount() {
  //   window.addEventListener('load', (event) => {
  //     this.getData(1960)
  //   });
  // }

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.menuButtonClicked = this.menuButtonClicked.bind(this)
    this.renderMenuButton = this.renderMenuButton.bind(this)  
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.loginUserPost = this.loginUserPost.bind(this);
    // this.updateLoginStatus = this.updateLoginStatus.bind(this)
    this.state = {
      email: "",
      password: "",
      loggedIn: null,
      userId: null,
      showMessage: true,
      message: "",
    }

  }

  handleEmailChange(event) {
    this.setState({email: event.target.value});
    // console.log(this.state.email)
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
    // console.log(this.state.password)
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
      this.setState({ showMessage: true, message: "Invalid email entered. Please try again."
      })
    } else if (!valid_password) {
      // alert("Invalid password. Please try again")
      this.setState({ showMessage: true, message: "Invalid password. Please try again" })
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
        message: response.data['message'],
        loginEmail: response.data['email']
      })
      console.log("RESPONSE: ", response.data['user_id'], response.data['logged_in'], response.data['message'], response.data['email'])
      console.log("state: ", this.state.loggedIn, this.state.userId, this.state.message)
      this.props.changeLogin(this.state.loginEmail, this.state.userId)

    })
    .catch(error => { 
      console.log(error)
    })
  }

  // updateLoginStatus(login) {
  //   // console.log("before" + login)
  //   this.props.changeLogin(login)
  //   // console.log("after" + login)
  // }

  menuButtonClicked(route) {
    this.props.changePage(route) 
    //change state of parent component, to track which page we're on
    //rendering will happen in app component, calls the function in the parent component/app
  }
  
  renderMenuButton(route) {
    return (
      <GeneralButton 
        value={route} 
        className="button-to-link"
        onClick={() => this.menuButtonClicked(route)} //it should only do the action the thing that has been clicked 
      />
    )
  }

  render() {
    return (
      <div className="loginbg paddingbg">
        <div className="form-box">
          <h1>Account Login</h1><hr></hr>

          <form>
            <p><span>
              <input className="inputbg" type="text" placeholder=" Enter Email" name="email" value={this.state.email} onChange={this.handleEmailChange} required />
            </span></p>

            <p><span>
              <input className="inputbg" type="password" placeholder=" Enter Password" name="password" value={this.state.password} onChange={this.handlePasswordChange} required />
            </span></p>

            <p><span className="center">
              <button type="submit" className="btn btn-dark wide-button" onClick={this.loginUser}>Login</button>
            </span></p>

            <p><span className="center">
              <p>Create an account? {this.renderMenuButton('Register')}</p>
            </span></p>
          </form>

          <FlashMessage showMessage={this.state.showMessage} message={this.state.message} />
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
    // console.log(this.state.email)
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
    // console.log(this.state.password)
  }

  handleSecondPasswordChange(event) {
    this.setState({repeatPassword: event.target.value});
    // console.log(this.state.repeatPassword)
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
      this.setState({ showMessage: true, message: "Passwords do not match." })
    } else if (!valid_email) {
      this.setState({ showMessage: true, message: "Invalid email entered. Please try again." })
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
      <GeneralButton 
        value={route} 
        className="button-to-link"
        onClick={() => this.menuButtonClicked(route)} //it should only do the action the thing that has been clicked 
      />
    )
  }

  render() {
    return (
      <div className="registerbg paddingbg">
        <div className="form-box">
          <h1>Registration</h1><hr></hr>

          <form>
              <p><span>
                <label for="email"><b>Enter Email:</b></label>
                <input className="inputbg" type="text" placeholder="Enter Email" name="email" value={this.state.email} onChange={this.handleEmailChange} required />
              </span></p>

              <p><span>
                <label for="password"><b>Enter Password:</b></label>
                <input className="inputbg" type="password" placeholder="Enter Password" name="password" value={this.state.password} onChange={this.handlePasswordChange} required />
              </span></p>

              <p><span>
                <label for="password-repeat"><b>Enter Password again:</b></label>
                <input className="inputbg" type="password" placeholder="Enter Password" name="password" value={this.state.repeatPassword} onChange={this.handleSecondPasswordChange} required />
              </span></p>

              <p><span>
                <button type="submit" className="btn btn-dark wide-button center" onClick={this.registerUser}>Register</button>
              </span></p>
            
            <div className="center">
              <p>Already have an account? {this.renderMenuButton('Login')}</p>
            </div>
          </form>

          <FlashMessage showMessage={this.state.showMessage} message={this.state.message} />
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
      <div className="flash"> {this.props.showMessage && <div className="error-message">{this.props.message}</div>}</div>
    );
  }
}

class Likes extends React.Component {
  constructor(props) {
    super(props);    
  }

  renderResultsData() {
    return (
      <div className="restaurant"> 
        <div style={{'padding': '10px'}}>
          Results: {Object.keys(this.props.results).length}
        </div>

        <div className="grid-container">
          {       
            Object.keys(this.props.results).map((key, i) => (
              
              <div key={key} style={{'width':'300px', 'height': '300px'}}> 
                <p><span style={{'fontSize': '16px', 'padding': '10px', 'fontWeight': 'bold'}}>{this.props.results[key]['name']}, <br />{this.props.results[key]['dba_start_date']}</span><span></span></p>
                <div style={{'textAlign': 'center'}}>
                  <p><a href={this.props.results[key]['url']}><img src={this.props.results[key]['image_url']} className="food-pic-results" alt="" /></a></p>
                </div>
                <div style={{'textAlign' : 'left', 'padding': '10px'}}>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Location: {this.props.results[key]['neighborhoods_analysis_boundaries']}</p>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Categories: {this.props.results[key]['categories']}</p>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Price: {this.props.results[key]['price']}</p>
                  <p style={{'margin': '0px', 'padding': '0px 0px 4px 40px', 'fontSize': '15px'}}>Rating: {this.props.results[key]['rating']}</p>
                </div>
              </div> 
            ))
          }              
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="loginbg paddingbg" style={{'padding': '100px 0px 0px 50px'}}>
        <div className="container result-box">
          <div className="center">
            <div className="container">
              <h1>Likes</h1>
              <hr />
              <div className="center">Like Page</div>
              <div className="center">{this.props.userId}</div>
              <div className="center">{this.renderResultsData()}</div>
            </div>
          </div>
        </div>
      </div>
    )
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

// class ResultMap extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     return (
//       <div className="resultMap">Map Page</div>
//     );
//   }
// }

// class MenuButton extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   //Props = Page Header
//   render() {
//     return (
//       <button 
//         className={this.props.className}
//         type="submit" 
//         value={this.props.value} 
//         style={this.props.style}
//       >
//       </button>
//     )
//   }
// }


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

// class RandomButton extends React.Component {
//   constructor(props) {
//     super(props);
//   }
//   render() {
//     return (
//       <button 
//         className={this.props.className}
//         type="submit" 
//         // value={this.props.value} 
//         style={this.props.style}
//         onClick={this.props.onClick}
//       >
//         {this.props.value}
//       </button>
//     )
//   }
// }