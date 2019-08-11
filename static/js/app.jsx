class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decade: null,
      // currentPage: 0, // this will tell me where i am array or map to show component - pageheader or decadeselector
      // pages: [<DecadeSelector/>, <Map/>]
    };
    // this.changepage = this.changepage.bind(this) // 
  }

  // changepage(pageNum) {
  //   this.setstate.currentPage
  // }
  
  render() {
    return (
      <div className="page">
        <PageHeader />
        <DecadeSelector />
        <Map />
      </div>
    )
    // changepage={this.changepage} // these are props
    //{this.state.pages[this.state.currentPage]} these go in the return ()
  }
}

class Map extends React.Component {
  constructor(props) {
    super(props);
  };

  initMap(){
    // Map zoom and center
    var options = {
      zoom:14,
      center: {lat:37.7920, lng:-122.4501}
    }
    // Display map
    // var map = new google.maps.Map(document.getElementById('map'), options);
  }

}


class PageHeader extends React.Component {

  // clicked() {
  //   this.props.chnagepage() // change the state of the parent to keep track of what parent we're on, and rendering change will happen in app
  // } //this allows the pageheader to call a function from the parent/app to call a function that changes the app setstate.currentpage

  render() {
    return (
      <div className="header">
        <header className="panel center opacity" style={{ padding: '50px 16px 20px 16px' }}>
          <h1 className="xlarge">San Francisco</h1>
          <h1>Decades</h1>
          <div className="padding-20">
              <div className="bar border">
                <a href="/" className="bar-item button">  About </a>
                <a href="/map" className="bar-item button">  Map </a>
                <a href="/likes" className="bar-item button light-grey"> Likes </a>
                <a href="/login" className="bar-item button">Login </a>
                <a href="/register" className="bar-item button">Register</a>
              </div>
          </div>
        </header>
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


// ---------------------------------------------

ReactDOM.render(
  <App />, 
  document.getElementById('root') 
);
