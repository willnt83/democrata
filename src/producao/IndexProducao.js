import React, { Component } from "react"
import { Layout, Menu, Icon, Row, Col, Modal, Button, notification } from "antd"
import { BrowserRouter as Router, Route, withRouter, Link } from "react-router-dom"
import { connect } from 'react-redux'
import moment from 'moment'
import "antd/dist/antd.css"
import axios from "axios"
import LancamentoProducao from './lancamentoCodigoDeBarras/LancamentoProducao'
import LancamentoAgrupado from './lancamentoCodigoDeBarras/LancamentoAgrupado'
import ConferenciaProducao from './lancamentoCodigoDeBarras/ConferenciaProducao'
import EstornoProducao from './lancamentoCodigoDeBarras/EstornoProducao'
import Expedicao from './lancamentoCodigoDeBarras/Expedicao'

import Entrada from './wms-produtos/Entrada'
import Armazenagem from './wms-produtos/Armazenagem'
import Saida from './wms-produtos/Saida'

const {
	Content, Footer, Sider,
} = Layout;

const { SubMenu } = Menu

class IndexProducao extends Component {
	state = {
		collapsed: false,
		showModalLogout: false,
		btnConfirmarLoading: false,
		showModalLancamentoProducao: false,
		showModalLancamentoAgrupado: false,
		showModalConferenciaProducao: false,
		showModalEstornoProducao: false,
		showModalExpedicao: false,
	};

	showNotification = (msg, success) => {
        var type = null
        var style = null
        if(success){
            type = 'check-circle'
            style = {color: '#4ac955', fontWeight: '800'}
        }
        else {
            type = 'exclamation-circle'
            style = {color: '#f5222d', fontWeight: '800'}
        }
        const args = {
            message: msg,
            icon:  <Icon type={type} style={style} />,
            duration: 1
        }
        notification.open(args)
    }

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

	showModalLancamentoAgrupadoF = (bool) => {
        this.setState({showModalLancamentoAgrupado: bool})
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

		if(this.props.session.setores.id !== null){
			
			routes = [
				{
					path: '/producao/',
					exact: true,
					main: () => <Content style={{ margin: '0 16px 0', flex: 'initial'}}>
									<div style={{ padding: 24, background: '#fff'}}>
										<h3>Lançamento por Código de Barras</h3>
										<Row>
											<Col xs={24}>
												<Button className="buttonOrange" onClick={() => this.showModalLancamentoProducaoF(true)} style={{marginRight: 10}}><Icon type="barcode" /></Button>
												<Button className="buttonYellow" onClick={() => this.showModalLancamentoAgrupadoF(true)} style={{marginRight: 10}}><Icon type="barcode" /></Button>
												<Button className="buttonGreen" onClick={() => this.showModalConferenciaProducaoF(true)} style={{marginRight: 10}}><Icon type="check" /></Button>
												<Button className="buttonRed" onClick={() => this.showModalEstornoProducaoF(true)} style={{marginRight: 10}}><Icon type="undo" /></Button>
												<Button className="buttonPurple" onClick={() => this.showModalExpedicaoF(true)} style={{marginRight: 10}}><Icon type="export" /></Button>
											</Col>
										</Row>
									</div>
								</Content>
				},
				{
					path: '/producao/wms-producao/entrada',
					main: () => <Entrada />
				},
				{
					path: '/producao/wms-producao/armazenagem',
					main: () => <Armazenagem />
				},
				{
					path: '/producao/wms-producao/saida',
					main: () => <Saida />
				}
			]
		}
		else{
			window.location.replace("/")
		}

		return (
			<React.Fragment>
				<Router>
					<Layout style={{minHeight: '100vh'}}>
						<Sider
							breakpoint="lg"
							collapsedWidth="0"
						>
							<div className="logo">Produção</div>
							<Menu theme="dark" mode="inline" defaultSelectedKeys={[this.props.session.setores[0].id]}>

								<Menu.Item key="1">
									<Link to="/producao/">
										<Icon type="right-square" />
										<span className="nav-text">Produção</span>
									</Link>
								</Menu.Item>
								<SubMenu key="sub1" title={<span><Icon type="bars" /><span>WMS Produção</span></span>}>
									<Menu.Item key="2">
										<Link to="/producao/wms-producao/entrada">
											<Icon type="right-square" />
											<span className="nav-text">Entrada</span>
										</Link>
									</Menu.Item>
									<Menu.Item key="3">
										<Link to="/producao/wms-producao/armazenagem">
											<Icon type="right-square" />
											<span className="nav-text">Armazenagem</span>
										</Link>
									</Menu.Item>
									<Menu.Item key="4">
										<Link to="/producao/wms-producao/saida">
											<Icon type="right-square" />
											<span className="nav-text">Saida</span>
										</Link>
									</Menu.Item>
								</SubMenu>

								<Menu.Item key="999" onClick={() => this.logout()}>
									<Icon type="export" />
									<span>Sair</span>
								</Menu.Item>
								
							</Menu>
						</Sider>
						<Layout>
							{/*<Header style={{ background: '#fff', padding: 0 }}>
								<Row>
									<Col xs={12}>
										<PageTitle pageTitle={this.props.pageTitle} />
									</Col>
								</Row>
							</Header>*/}

							<Content style={{ margin: '0'}}>
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
				<LancamentoAgrupado
                    showModalLancamentoAgrupado={this.state.showModalLancamentoAgrupado}
                    showModalLancamentoAgrupadoF={this.showModalLancamentoAgrupadoF}
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
