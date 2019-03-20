import React, { Component } from "react"
import { Layout, Menu, Icon, Row, Col, Modal, Button } from "antd"
import { BrowserRouter as Router, Route, withRouter, Link } from "react-router-dom"
import { connect } from 'react-redux'
import moment from 'moment'
import "antd/dist/antd.css"
import axios from "axios"
import PageTitle from "./layout/PageTitle"


import ProducaoLancamento from './ProducaoLancamento'

const {
	Header, Content, Footer, Sider,
} = Layout;

class IndexProducao extends Component {
	state = {
		collapsed: false,
		showModalLogout: false,
        btnConfirmarLoading: false
	};

	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};

	showModalLogout = (bool) => {
        this.setState({showModalLogout : bool})
	}
	
	handleConfirmLogout = () => {
        this.setState({btnConfirmarLoading: true})
        axios.get(this.props.backEndPoint + '/logout')
        .then(res => {
            if(res.data.success){
                this.setState({btnConfirmarLoading: false})
                this.props.resetAll()
                this.showModalLogout(false)
                window.location.replace("/")
            }
            else{
                this.setState({btnConfirmarLoading: false})
                this.showModalLogout(false)
            }
        })
        .catch(error =>{
            console.log(error)
        })
    }

	componentWillMount(){
		if(this.props.session.administrador !== 'N'){
            this.props.resetAll()
            window.location.replace("/")
		}

		// Routes
		/*
		this.setState({
			routes: this.props.session.setores.map(setor => {
				return({
					path: setor.slug,
					extact: true,
					main: () => <ProducaoLancamento idSetor={setor.id} />
				})
			})
		})
		*/
	}

	render() {
		const routes = this.props.session.setores.map(setor => {
			return({
				path: setor.slug,
				extact: true,
				main: () => <ProducaoLancamento idSetor={setor.id} nomeSetor={setor.nome} />
			})
		})

		return (
			<React.Fragment>
				<Router>
					<Layout style={{minHeight: '100vh'}}>
						<Sider
							breakpoint="lg"
							collapsedWidth="0"
							/*onBreakpoint={(broken) => { console.log(broken); }}
							onCollapse={(collapsed, type) => { console.log(collapsed, type); }}*/
						>
							<div className="logo">Produção</div>
							<Menu theme="dark" mode="inline" defaultSelectedKeys={[this.props.session.setores[0].id]}>
								{
									this.props.session.setores.map(setor => {
										return(
											<Menu.Item key={setor.id}>
												<Link to={setor.slug}>
													<Icon type="right-square" />
													<span className="nav-text">{setor.nome}</span>
												</Link>
											</Menu.Item>
										)
									})
								}
								
							</Menu>
						</Sider>
						<Layout>
							<Header style={{ background: '#fff', padding: 0 }}>
								<Row>
									<Col xs={12}>
										<PageTitle pageTitle={this.props.pageTitle} />
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
				<Modal
					title="Sair do Sistema"
					visible={this.state.showModalLogout}
					onOk={this.handleModalLogoutOk}
					onCancel={() => this.showModalLogout(false)}
					footer={[
						<Button key="back" onClick={() => this.showModalLogout(false)}><Icon type="close" /> Cancelar</Button>,
						<Button className="buttonGreen" key="primary" type="primary" onClick={this.handleConfirmLogout} loading={this.state.btnConfirmarLoading}>
							<Icon type="check" /> Confirmar
						</Button>,
					]}
				>
					<p>Você está prestes a sair do sistema. Todos os dados não salvos serão perdidos!</p>
				</Modal>
			</React.Fragment>
		);
	}
}

const MapStateToProps = (state) => {
	return {
		pageTitle: state.pageTitle,
		session: state.session,
		backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetAll: () => { dispatch({ type: 'RESET_ALL' }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(withRouter(IndexProducao));
