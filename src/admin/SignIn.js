import React, { Component } from 'react'
import { Layout, Row, Col, Form, Icon, Input, Button, Card, notification } from 'antd'
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"
import axios from 'axios'

const { Content } = Layout;

class SignIn extends Component {
	state =  {
		entrarButtonLoading: false
	}
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
            duration: 5
        }
        notification.open(args)
	}

	convertToSlug = (text) => {
		const a = 'àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
		const b = 'aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
		const p = new RegExp(a.split('').join('|'), 'g')
		return text.toString().toLowerCase().trim()
		.replace(p, c => b.charAt(a.indexOf(c)))
		.replace(/&/g, '-and-')
		.replace(/[\s\W-]+/g, '-')
	}

	handleLoginSubmit = (event) => {
		event.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
				this.setState({ entrarButtonLoading: true })
				axios.post(this.props.backEndPoint + '/login', {
					email: values.email,
					senha: values.senha
				})
				.then(res => {
					if(res.data.success){
						var setores = null
						if(res.data.payload.setores.length > 0){
							setores = res.data.payload.setores.map(setor => {
								var slug = '/producao'
								return({
									...setor,
									slug
								})
							})
						}

						var session = {
							idSession: res.headers['token'],
							usuario: {
								id: res.data.payload.id,
								nome: res.data.payload.nome
							},
							perfil: res.data.payload.perfil,
							setores: setores,
							administrador: res.data.payload.administrativo
						}

						this.props.setSession(session)
						this.setState({entrarButtonLoading: false})

						axios.defaults.headers = {
							'Authorization': res.headers['token']
						}

						if(res.data.payload.administrativo === 'Y')
							this.props.history.push('/admin')
						else{
							this.props.history.push(session.setores[0].slug)
						}

					}
					else{
						this.showNotification(res.data.msg, false)
						this.setState({entrarButtonLoading: false})
					}
				})
				.catch(error =>{
					console.log(error)
					this.setState({
						entrarButtonLoading: false
					})
				})
            }
        })
	}

	render () {
		const { getFieldDecorator } = this.props.form;
		return (
			<Content
				id="mainContent"
				style={{
					padding: "50px 24px 0 24px",
					background: "#fff"
				}}
			>
				<Row type="flex" justify="center" align="middle">
					<Col span={8} xs={24} align="middle">
						<Card
							style={{ width: 312, minHeight: 461 }}
						>
							<Row style={{marginTop: 20, paddingBottom: 20}}>
								<Col span={24} align="center">
									<h2>DEMOCRATA DECOR</h2>
									<h4>Sistema de Gerenciamento de Linhas de Produção</h4>
								</Col>
							</Row>
							<Row style={{paddingBottom: 20}}>
								<Col span={24} align="center" style={{color: 'red', fontSize: 40}}>
									<Icon type="lock" />
								</Col>
							</Row>
							<Form onSubmit={this.handleLoginSubmit} className="login-form">
								<Form.Item>
									{getFieldDecorator('email', {
										rules: [{ required: true, message: 'Informe o e-mail' }],
									})(
										<Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="E-mail" />
									)}
								</Form.Item>
								<Form.Item>
									{getFieldDecorator('senha', {
										rules: [{ required: true, message: 'Informe a senha' }],
									})(
										<Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Senha" />
									)}
								</Form.Item>
								<Form.Item style={{padding: 10}}>
									<Button type="primary" htmlType="submit" className="login-form-button" loading={this.state.entrarButtonLoading}>Entrar</Button>
								</Form.Item>
							</Form>
						</Card>
					</Col>
				</Row>
			</Content>
		)
	}
}

const MapStateToProps = (state) => {
	return {
		backEndPoint: state.backEndPoint,
		session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
		setSession: (session) => { dispatch({ type: 'SET_SESSION', session }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(withRouter(Form.create()(SignIn)))