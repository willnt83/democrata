import React, { Component } from "react"
import { Layout, Icon } from "antd"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { connect } from 'react-redux'

import "antd/dist/antd.css"
import "./static/index.css"

import PageTitle from "./layout/PageTitle"
import ListMenu from "./layout/ListMenu"

import Unidades from "./cadastros/Unidades"
import Usuarios from "./cadastros/Usuarios"
import Setores from "./cadastros/Setores"
import SubSetores from "./cadastros/SubSetores"
import Produtos from "./cadastros/Produtos"
import SubProdutos from "./cadastros/SubProdutos"


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
		path: "/admin/cadastros/setores",
		sidebar: () => <div>Cadastro/Setores</div>,
		main: () => <Setores />
	},
	{
		path: "/admin/cadastros/sub-setores",
		sidebar: () => <div>Cadastro/Sub-setores</div>,
		main: () => <SubSetores />
	},
	{
		path: "/admin/cadastros/produtos",
		sidebar: () => <div>Cadastro/Produtos</div>,
		main: () => <Produtos />
	},
	{
		path: "/admin/cadastros/sub-produtos",
		sidebar: () => <div>Cadastro/Sub-produtos</div>,
		main: () => <SubProdutos />
	}
];

class AdminIndex extends Component {
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
						<div className="logo">Painel Administrativo</div>
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

						<Footer style={{ textAlign: "center" }}>Democrata Decor ©2018</Footer>
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

export default connect(MapStateToProps)(AdminIndex);
