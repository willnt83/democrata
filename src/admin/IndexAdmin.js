import React, { Component } from "react"
import { Layout, Icon, Row, Col } from "antd"
import { BrowserRouter as Router, Route, withRouter } from "react-router-dom"
import { connect } from 'react-redux'
import moment from 'moment'

import "antd/dist/antd.css"
import "./static/index.css"

import PageTitle from "./layout/PageTitle"
import ListMenu from "./layout/ListMenu"

import Unidades from "./cadastros/Unidades"
import Usuarios from "./cadastros/Usuarios"
import PerfisDeAcesso from "./cadastros/PerfisDeAcesso"
import Funcionarios from "./cadastros/Funcionarios"
import Setores from "./cadastros/Setores"
import Produtos from "./cadastros/Produtos"
import SubProdutos from "./cadastros/Subprodutos"
import Conjuntos from "./cadastros/Conjuntos"
import LinhaDeProducao from "./cadastros/LinhaDeProducao"
import Cores from "./cadastros/Cores"
import DiasNaoUteis from "./cadastros/DiasNaoUteis"
import Producao from "./gerenciamentoProducao/Producao"
import Acompanhamento from "./gerenciamentoProducao/Acompanhamento"
import RelatorioProdutosCadastrados from "./relatorios/RelatorioProdutosCadastrados"
import RelatorioProducoes from "./relatorios/RelatorioProducoes"
import RelatorioFuncionariosPontuacoes from "./relatorios/RelatorioFuncionariosPontuacoes"


const { Header, Sider, Footer } = Layout
const { Content } = Layout
const routes = [
	{
		path: "/admin",
		exact: true,
		sidebar: () => <div>Cadastro/Conteudo</div>,
		main: () =>
			<Content
				style={{
				margin: "12px 16px 0 16px",
				padding: 24,
				background: "#fff",
				maxHeight: 800
				}}
			>
				<h1>Dashboard</h1>
			</Content>
	},
	{
		path: "/admin/cadastros/unidades",
		sidebar: () => <div>Cadastro/Unidades</div>,
		main: () => <Unidades />
	},
	{
		path: "/admin/cadastros/usuarios",
		sidebar: () => <div>Cadastro/Usuários</div>,
		main: () => <Usuarios />
	},
	{
		path: "/admin/cadastros/perfis-de-acesso",
		sidebar: () => <div>Cadastro/Perfis de Acesso</div>,
		main: () => <PerfisDeAcesso />
	},
	{
		path: "/admin/cadastros/setores",
		sidebar: () => <div>Cadastro/Setores</div>,
		main: () => <Setores />
	},
	{
		path: "/admin/cadastros/produtos",
		sidebar: () => <div>Cadastro/Produtos</div>,
		main: () => <Produtos />
	},
	{
		path: "/admin/cadastros/subprodutos",
		sidebar: () => <div>Cadastro/Subprodutos</div>,
		main: () => <SubProdutos />
	},
	{
		path: "/admin/cadastros/conjuntos",
		sidebar: () => <div>Cadastro/Conjuntos</div>,
		main: () => <Conjuntos />
	},
	{
		path: "/admin/cadastros/linha-de-producao",
		sidebar: () => <div>Cadastro/Linha de Produção</div>,
		main: () => <LinhaDeProducao />
	},
	{
		path: "/admin/cadastros/cores",
		sidebar: () => <div>Cadastro/Cores</div>,
		main: () => <Cores />
	},
	{
		path: "/admin/cadastros/dias-nao-uteis",
		sidebar: () => <div>Cadastro/Dias Não Úteis</div>,
		main: () => <DiasNaoUteis />
	},
	{
		path: "/admin/cadastros/funcionarios",
		exact: true,
		sidebar: () => <div>Cadastro/Funcionários</div>,
		main: () => <Funcionarios />
	},
	{
		path: "/admin/producao",
		exact: true,
		sidebar: () => <div>Produção</div>,
		main: () => <Producao />
	},
	{
		path: "/admin/producao/acompanhamento",
		exact: true,
		sidebar: () => <div>Produção/Acompanhamento</div>,
		main: () => <Acompanhamento />
	},
	{
		path: "/admin/relatorios/produtos-cadastrados",
		exact: true,
		sidebar: () => <div>Relatórios/Produtos Cadastrados</div>,
		main: () => <RelatorioProdutosCadastrados />
	},
	{
		path: "/admin/relatorios/producoes",
		exact: true,
		sidebar: () => <div>Relatórios/Produções</div>,
		main: () => <RelatorioProducoes />
	},
	{
		path: "/admin/relatorios/pontuacoes-por-funcionarios",
		exact: true,
		sidebar: () => <div>Relatórios/Pontuações por Funcionários</div>,
		main: () => <RelatorioFuncionariosPontuacoes />
	}
];

class IndexAdmin extends Component {
	state = {
		collapsed: false
	};

	toggle = () => {
		this.setState({
			collapsed: !this.state.collapsed
		});
	};

	componentWillMount(){
		if(this.props.session.administrador !== 'Y'){
			this.props.resetAll()
			window.location.replace("/")
		}
	}

	render() {
		return (
			<Router>
				<Layout style={{ minHeight: "100vh" }}>
					<Sider trigger={null} collapsible collapsed={this.state.collapsed}>
						<div className="logo">Painel Administrativo</div>
						<ListMenu />
					</Sider>
					<Layout>
						<Header style={{ background: "#fff", padding: 0 }}>
							<Row style={{paddingRight: '24px'}}>
								<Col span={10}>
									<Icon
									className="trigger"
									type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
									onClick={this.toggle}
									/>
									<PageTitle pageTitle={this.props.pageTitle} />
								</Col>
								<Col span={14} align="end">
									<h4><Icon type="user" style={{marginRight: '8px'}} />{this.props.session.usuario.nome} / {this.props.session.perfil.nome}</h4>
								</Col>
							</Row>
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

export default connect(MapStateToProps, mapDispatchToProps)(withRouter(IndexAdmin));
