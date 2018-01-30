import React, { Component } from 'react'
import { getReports } from '../../functions/getReports'
import { postReport } from '../../functions/postReport'
import { connect } from 'react-redux'
import PDFJS from 'pdfjs-dist'
import * as fs from 'fs'

// import * as fs from 'fs'

import "./reports-page.css"

export class ReportsPage extends Component {
	constructor(props){
		super(props)
		this.state = {
			trident:'',
			email:'',
			reports:'',
			numPages:0,
			pagenation:'',
			buffer:'',
			loadMsg:''
		}
		this.startRead = this.startRead.bind(this)
		this.openPDF = this.openPDF.bind(this)
		this.changePage = this.changePage.bind(this)
	}
	componentWillMount(){
		getReports(this.props.user.email)
		.then(res => {
			let reports = Object.keys(res).map((key, i) => {
				return <button 
									type="button"
									key={"button" + i}
									onClick={this.openPDF.bind(this,res[key].report)}
								>{res[key].reportName}
								</button>
			})
			this.setState({reports})
		})
		.catch(err => {
			console.log(err)
		})
	}
	onInputChange(type, event){
    let stateVal = { }
    stateVal[type] = event.target.value
    this.setState(stateVal)
  }
  openPDF(report){
  	let that = this
  	let buffer = Buffer.from(JSON.parse(report).data)
  	PDFJS.getDocument(buffer).then(function(pdf){
				that.setState({buffer})
				that.pagenation(pdf.numPages)
				pdf.getPage(1).then(function(page){
					var scale = 2 
					var viewport = page.getViewport(scale)
					var canvas = document.getElementById('pdf-report')
					var context = canvas.getContext('2d')
					canvas.height = viewport.height
					canvas.width = viewport.width
					page.render({ canvasContext: context, viewport: viewport})
				})
			})
  }
  pagenation(pages){
  	let buttons=[]
		for (var i = 1; i <= pages; i++){
			buttons.push(<button type='button' onClick={this.changePage.bind(this,i)}>Page {i}</button>)
		}
		this.setState({pagenation:buttons})
  }
  changePage(pageNum){
		let that = this
		let buffer = this.state.buffer
		PDFJS.getDocument(buffer).then(function(pdf){
				console.log('Number of pages: ' + pdf.numPages)
				that.setState({numPages:pdf.numPages,buffer})
				that.pagenation(pdf.numPages)
				pdf.getPage(pageNum).then(function(page){
					var scale = 2 
					var viewport = page.getViewport(scale)
					var canvas = document.getElementById('pdf-report')
					var context = canvas.getContext('2d')
					canvas.height = viewport.height
					canvas.width = viewport.width
					page.render({ canvasContext: context, viewport: viewport})
				})
			})
  }
	startRead(e){
		e.preventDefault()
		var file = document.getElementById('admin-panel-pdf').files[0]
		if(file){
			let info = {
				email:this.state.email,
				file: file
			}
			postReport(info)
			.then(res => {
				console.log(res)
				this.setState({loadMsg:'Document has been saved successfully',email:''})
			})
			.catch(err => {
				console.log(err.message)
				if(err.message === 'Firebase error'){
					this.setState({loadMsg:'Error with saving document. Please try again',email:''})
				}else if(err.message === 'Invalid email'){
					this.setState({loadMsg:'Please enter a valid email',email:''})
				}else{
					this.setState({loadMsg:<span>No user found at this email <i>{this.state.email}</i></span>,email:''})
				}
			})
		}
	}
	render(){
		return(
			<div>
				<div className="dashboard-header">
					<h2 className="dashboard-title">DASHBOARD</h2>
					<h3 className="dashboard-path">Home / Reports</h3>
				</div>
				<div className="reports-page-container">
					{this.props.user.creds === 'Admin' ? 
					<div className="reports-page admin-panel-container">
						<form className="reports-page admin-panel" 
									id="uploadForm" 
									encType="multipart/form-data" 
									method="post">
							<h3 className="admin-panel-heading">Submit a Report</h3>
							<label htmlFor="email" className="admin-panel-label email">User's Email</label>
							<input 
								id="email"
								type="email"
								className="admin-panel-input email"
								placeholder="email@email.com"
								value={this.state.email}
								onChange={this.onInputChange.bind(this,'email')}
							></input>
							<input 
								className="admin-panel-pdf"
								tabIndex="0"
								type="file"
								name="userFile"
								id="admin-panel-pdf"
								onPaste={this.handlePaste}>
							</input>
							<div className="admin-panel-input-container submit">
								<input type="submit" 
											 name="submit" 
											 value="submit" 
											 className="admin-panel-input submit"
											 onClick={this.startRead}/>
							</div>
							<p id="loading-message">{this.state.loadMsg}</p>
						</form>
					</div>
					: null}
					<div className="reports-page reports-container">
						<div className="reports-page reports">
							{this.state.reports}
						</div>
						<div className="reports-page pdf-container">
							<div className="reports-page pagenation">
								{this.state.pagenation}
							</div>
							<canvas id='pdf-report'></canvas>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	user: state.validUser
})

export default connect(mapStateToProps)(ReportsPage)
// <iframe src={this.state.pdf} style={{width:"600px",height:"500px"}} frameboarder="0"></iframe>
