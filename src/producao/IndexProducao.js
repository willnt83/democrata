import React, { Component } from "react"
import { Layout, Menu, Icon, Row, Col } from "antd"
import { BrowserRouter as Router, Route, withRouter } from "react-router-dom"
import { connect } from 'react-redux'
import moment from 'moment'
import "antd/dist/antd.css"

import PageTitle from "./layout/PageTitle"


import ProducaoLancamento from './ProducaoLancamento'

const {
	Header, Content, Footer, Sider,
} = Layout;

const routes = [
	{
		path: "/producao",
		exact: true,
		sidebar: () => <div>Home</div>,
		main: () => <ProducaoLancamento />
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

	componentWillMount(){
		if(this.props.session.administrador !== 'N'){
            this.props.resetAll()
            window.location.replace("/")
        }
	}

	render() {
		return (
			<Router>
				<Layout>
					<Sider
						breakpoint="lg"
						collapsedWidth="0"
						/*onBreakpoint={(broken) => { console.log(broken); }}
						onCollapse={(collapsed, type) => { console.log(collapsed, type); }}*/
					>
						<div className="logo">Produção</div>
						<Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
							<Menu.Item key="1">
								<Icon type="export" />
								<span className="nav-text">Sair</span>
							</Menu.Item>
						</Menu>
					</Sider>
					<Layout>
						<Header style={{ background: '#fff', padding: 0 }}>
							<Row>
								<Col xs={12}>
									<PageTitle pageTitle="Marcenaria" />
								</Col>
								{/*
								<Col xs={5}>
									<h4><Icon type="user" style={{marginRight: '8px'}} />{this.props.session.usuario.nome} / {this.props.session.perfil.nome}</h4> 
								</Col>
								*/}
							</Row>
						</Header>
						<Content style={{ margin: '24px 16px 0'}}>
							<div style={{ padding: 24, background: '#fff', minHeight: '100%'}}>
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
							</div>
						</Content>
						<Footer style={{ textAlign: 'center' }}>
							Democrata Decor ©{moment().format('YYYY')}
						</Footer>
					</Layout>
				</Layout>
			</Router>
		);
	}
}

const MapStateToProps = (state) => {
	return {
		pageTitle: state.pageTitle,
		session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) },
        resetAll: () => { dispatch({ type: 'RESET_ALL' }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(withRouter(IndexProducao));
