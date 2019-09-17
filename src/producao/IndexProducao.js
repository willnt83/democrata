import React, { Component } from "react"
import { Layout, Menu, Icon, Row, Col, Modal, Button } from "antd"
import { BrowserRouter as Router, Route, withRouter, Link } from "react-router-dom"
import { connect } from 'react-redux'
import moment from 'moment'
import "antd/dist/antd.css"
import axios from "axios"
import PageTitle from "./layout/PageTitle"
import LancamentoProducao from './lancamentoCodigoDeBarras/LancamentoProducao'
import ConferenciaProducao from './lancamentoCodigoDeBarras/ConferenciaProducao'
import EstornoProducao from './lancamentoCodigoDeBarras/EstornoProducao'
import Expedicao from './lancamentoCodigoDeBarras/Expedicao'
//import ProducaoLancamento from './ProducaoLancamento'

const {
	Header, Content, Footer, Sider,
} = Layout;

class IndexProducao extends Component {
	state = {
		collapsed: false,
		showModalLogout: false,
		btnConfirmarLoading: false,
		showModalLancamentoProducao: false,
		showModalConferenciaProducao: false,
		showModalEstornoProducao: false,
		showModalExpedicao: false,
	};

	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};

	showModalLogout = (bool) => {
        this.setState({showModalLogout : bool})
	}

	logout = () => {
        this.setState({showModalLogout: true})
    }
	
	handleConfirmLogout = () => {
        this.setState({btnConfirmarLoading: true})
        axios.get(this.props.backEndPoint + '/logout')
        .then(res => {
            if(res.data.success){
                this.setState({btnConfirmarLoading: false})
                this.props.resetAll()
				this.showModalLogout(false)
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
	
	showModalLancamentoProducaoF = (bool) => {
        this.setState({showModalLancamentoProducao: bool})
	}
	
	showModalConferenciaProducaoF = (bool) => {
        this.setState({showModalConferenciaProducao: bool})
    }

    showModalEstornoProducaoF = (bool) => {
        this.setState({showModalEstornoProducao: bool})
	}
	
	showModalExpedicaoF = (bool) => {
        this.setState({showModalExpedicao: bool})
	}

	componentWillMount(){
		if(this.props.session.administrador !== 'N'){
            this.props.resetAll()
            window.location.replace("/")
		}
	}

	render() {
		var routes = null
		/*
		if(this.props.session.setores.id !== null){
			routes = this.props.session.setores.map(setor => {
				return({
					path: setor.slug,
					extact: true,
					main: () => <ProducaoLancamento idSetor={setor.id} nomeSetor={setor.nome} />
				})
			})
		}
		*/
		if(this.props.session.setores.id !== null){
			routes = this.props.session.setores.map(setor => {
				return({
					path: setor.slug,
					extact: true,
					main: () => ''
				})
			})
		}
		else{
			console.log('volta pra login')
			window.location.replace("/")
		}

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

								<Menu.Item key="999" onClick={() => this.logout()}>
									<Icon type="export" />
									<span>Sair</span>
								</Menu.Item>
								
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
							<Content style={{ margin: '24px 16px 0', flex: 'initial'}}>
								<div style={{ padding: 24, background: '#fff'}}>
									<h3>Lançamento por Código de Barras</h3>
									<Row>
										<Col xs={24}>
											<Button className="buttonOrange" onClick={() => this.showModalLancamentoProducaoF(true)} style={{marginRight: 10}}><Icon type="barcode" /></Button>
											<Button className="buttonGreen" onClick={() => this.showModalConferenciaProducaoF(true)} style={{marginRight: 10}}><Icon type="check" /></Button>
											<Button className="buttonRed" onClick={() => this.showModalEstornoProducaoF(true)} style={{marginRight: 10}}><Icon type="undo" /></Button>
											<Button className="buttonPurple" onClick={() => this.showModalExpedicaoF(true)} style={{marginRight: 10}}><Icon type="export" /></Button>
										</Col>
									</Row>
								</div>
							</Content>
							
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
				<LancamentoProducao
                    showModalLancamentoProducao={this.state.showModalLancamentoProducao}
                    showModalLancamentoProducaoF={this.showModalLancamentoProducaoF}
                    showNotification={this.showNotification}
                />
                <ConferenciaProducao
                    showModalConferenciaProducao={this.state.showModalConferenciaProducao}
                    showModalConferenciaProducaoF={this.showModalConferenciaProducaoF}
                    showNotification={this.showNotification}
                />
                <EstornoProducao
                    showModalEstornoProducao={this.state.showModalEstornoProducao}
                    showModalEstornoProducaoF={this.showModalEstornoProducaoF}
                    showNotification={this.showNotification}
                />
				<Expedicao
                    showModalExpedicao={this.state.showModalExpedicao}
                    showModalExpedicaoF={this.showModalExpedicaoF}
                    showNotification={this.showNotification}
                />
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
