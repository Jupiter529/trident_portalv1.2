import React, { Component } from 'react'
import * as actionCreators from '../../actions'
import PortalMap from '../../components/map'
import TridentPanel from '../../components/trident-panel'
import AlertType from '../../components/alert-type-panel'
import AlertPanel from '../../components/alert-panel'
import { connect } from 'react-redux'
import { getTridentAlerts } from '../../functions/getTridentAlerts'
import { getAlerts } from '../../functions/getAlerts'

import './trident-page.css'

/**
 * The TridentPage is used to display alerts for the selected trident.
 * These alerts are categorized based on the event_type. ex. dns,ssh,http...
 * It also displays Source IP's, Destination IP's, and Current Events.
 * The map on the page is populated with alerts for the selected trident
 */
export class TridentPage extends Component {
	constructor(props){
		super(props)
		this.state = {
			trident: null,
			loading: true,
			isNewSearch: false,
			alertMessage:<div className="loading-message"> Loading... </div>
		}
	}
	componentWillMount(){
		let trident = localStorage.getItem('selectedTrident')
		this.setState({trident})
		this.fetchAlerts(trident)
	}
	componentWillReceiveProps(nextProps){
		
		if(nextProps.selectedTrident !== null && nextProps.selectedTrident !== this.state.trident ){
			this.setState({trident, loading:true})
			let trident = nextProps.selectedTrident
			this.fetchAlerts(trident)
		}
		if(nextProps.newSearch){
			console.log('request for a new search _______________________________')
			this.setState({loading:true})
			let trident = localStorage.getItem('selectedTrident')
			this.fetchAlerts(trident)
		}
	}
	fetchAlerts(trident){
		let info = {
			trident:trident,
			queryDate:this.props.queryDate
		}
		//call to backend to get alerts for the selected trident
    getTridentAlerts(info)
    .then((res)=>{
    	//if no alerts display a message in the panel
	    if(res.alerts && res.alerts.length < 1){
	    	console.log('no alerts are sent back ')
	    	this.setState({alertMessage:<div className="no-tridents">Trident is unavailable </div>})
	    }
	    //these props are from the redux store
			this.props.isNewSearch(false)
      this.props.tridentAlerts(res.alerts)
      this.props.tridentSourceIPs(res.ips)
      this.props.tridentSignatureAlerts(res.signatureAlerts)
      this.props.tridentDestIPs(res.dest_ips)
      this.setState({loading:false})
    })
    .catch(err => {
    	console.log('The is an error in the backend')
    	this.setState({alertMessage:<div className="no-tridents">Trident is unavailable </div>})
    })
	}
	render(){
		let { trident, loading } = this.state 
		// if page is loading a message will be displayed 
		let sourceIPs = loading ? [] : this.props.sourceIPs
		let destIPs = loading ? [] : this.props.destIPs
		let alerts = loading ? [] : this.props.signature
		let message = this.state.alertMessage
		// message for the Map Events section alerting user to select an alert from the map
		let mapMessage = <h2>Please select an alert from the map</h2>
		/**
		 * PortalMap displays alerts on the map corresponding to the trident passed in
		 * TridentPanel displays a section for Source IP's, Signature alerts, and Destination IP's
		 * AlertPanel gathers detail's for the alert clicked on the map
		 * AlertType displays the alerts for each event type i.e. dns,ssh,http... The props that are
		 *   passed in are
		 *   - alertFunc = the function to call the backend for alerts
		 *   - trident = the trident to search for alerts
		 *   - type = is the event type that will be passed to the backend
		 *   - loading = tells whether data is being loaded or not
		 *   - title = the title of the AlertPanel that will be displayed
		 *   - message = the message to display when loading or no data 
		 * @type {String}
		 */
		return(
			<div className="trident-page-container">
				<div className="dashboard-header">
					<h2 className="dashboard-title">DASHBOARD</h2>
					<h3 className="dashboard-path">Home / Trident</h3>
				</div>	
				<PortalMap trident={trident} />
				<TridentPanel sourceIPs={sourceIPs} destIPs={destIPs} alerts={alerts} message={message} />
				<AlertPanel alerts={this.props.alerts} title={"Map Events"} message={mapMessage}/>
				<AlertType 
					alertFunc={getAlerts} 
					trident={trident} 
					type={"alert"} 
					loading={loading}
					queryDate={this.props.queryDate}
					title={"Signature Events"} 
					message={message}/>
				<AlertType
					alertFunc={getAlerts} 
					trident={trident} 
					type={"dns"} 
					loading={loading}
					queryDate={this.props.queryDate}
					title={"DNS Events"} 
					message={message} />
				<AlertType 
					alertFunc={getAlerts} 
					trident={trident} 
					type={"http"} 
					loading={loading}
					queryDate={this.props.queryDate}
					title={"HTTP Events"} 
					message={message} />
				<AlertType 
					alertFunc={getAlerts} 
					trident={trident} 
					type={"tls"} 
					loading={loading}
					queryDate={this.props.queryDate}
					title={"TLS Events"} 
					message={message} />
				<AlertType 
					alertFunc={getAlerts} 
					trident={trident} 
					type={"fileinfo"}
					loading={loading}
					queryDate={this.props.queryDate}
					title={"File Events"} 
					message={message} />
				<AlertType 
					alertFunc={getAlerts} 
					trident={trident} 
					type={"ssh"}
					loading={loading} 
					queryDate={this.props.queryDate}
					title={"SSH Events"} 
					message={message} />
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	sourceIPs: state.sourceIPs,
	destIPs: state.destIPs,
	signature : state.signatureAlerts,
	selectedTrident: state.selectedTrident,
	alerts: state.locationAlerts,
	queryDate: state.queryDate,
	newSearch: state.newSearch
})

export default connect(mapStateToProps, actionCreators)(TridentPage)