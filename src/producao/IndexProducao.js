import React, { Component } from "react"
import { Layout, Icon } from "antd"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { connect } from 'react-redux'
import moment from 'moment'

import "antd/dist/antd.css"
import "./static/index.css"

import Home from './Home'

const { Header, Sider, Footer } = Layout
const { Content } = Layout
const routes = [
	{
		path: "/producao",
		exact: true,
		sidebar: () => <div>Home</div>,
		main: () => <Home />
	}
];

class IndexProducao extends Component {
	state = {
		collapsed: false
	};

	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};
	render() {
		return (
			<Router>
				<Layout style={{ minHeight: "100vh" }}>
					<Sider trigger={null} collapsible collapsed={this.state.collapsed}>
						<div className="logo">Produção</div>
						<ListMenu />
					</Sider>
					<Layout>
						<Header style={{ background: "#fff", padding: 0 }}>
							<Icon
								className="trigger"
								type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
								onClick={this.toggle}
							/>
							<PageTitle pageTitle={this.props.pageTitle} />
						</Header>
						{
							routes.map((route, index) => (
								<Route
									key={index}
									path={route.path}
									exact={route.exact}
									component={route.main}
								/>
							))
						}

						<Footer style={{ textAlign: "center" }}>Democrata Decor ©{moment().format('YYYY')}</Footer>
					</Layout>
				</Layout>
			</Router>
		);
	}
}

const MapStateToProps = (state) => {
  return {
    pageTitle: state.pageTitle
  }
}

export default connect(MapStateToProps)(IndexProducao);
