import React, { Component } from 'react'
import { Row, Col, Form, Input, notification, Icon, DatePicker, Button } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

class ProducaoLancamento extends Component{
    requestGetProducaoAcompanhamento = (id) => {
        var filter = id !== null ? '?id_setor='+id : ''
        axios
        .get(this.props.backEndPoint + '/getProducaoAcompanhamento'+filter)
        .then(res => {
            if(res.data.payload){
                // Tabs
                this.setState({
                    tabs: res.data.payload.map(setor => {
                        return({
                            key: setor.id,
                            description: setor.nome
                        })
                    })
                })
                this.props.setProducaoAcompanhamento(res.data.payload)
            }
            else
                console.log('Nenhum registro encontrado')

        })
        .catch(error => {
            console.log(error)
        })
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
            messasge: msg,
            icon:  <Icon type={type} style={style} />,
            duration: 1
        }
        notification.open(args)
    }

    componentWillMount(){
        this.props.setPageTitle('Marcenaria')
        this.requestGetProducaoAcompanhamento(this.props.session.perfil.idSetor)
    }

    render() {
        const { getFieldDecorator } = this.props.form
        console.log('this.props', this.props)
        return (
            <Form layout="vertical">
                <Row>
                    <Col xs={24} id="colData">
                        <Form.Item
                            label="Data"
                        >
                            {getFieldDecorator('dataInicial')(
                                <DatePicker
                                    locale={ptBr}
                                    format="DD/MM/YYYY"
                                    placeholder="Selecione a data"
                                    style={ {width: '100%'} }
                                    getCalendarContainer={() => document.getElementById('colData')}
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} align="middle">
                        <h3>Produção 1</h3>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} align="begining">
                        <h4>Sofá Cartagena</h4>
                    </Col>
                </Row>
                <Row type="flex" justfify="center" align="middle" style={{marginBottom: 10}}>
                    <Col xs={12}>Subprodutos</Col>
                    <Col xs={8} align="middle">Realizados</Col>
                    <Col xs={2} align="middle">Tot</Col>
                    <Col xs={2} align="middle">Sal</Col>
                    
                </Row>
                <Row type="flex" justfify="center" align="middle">
                    <Col xs={12}>
                        - Braço Direito
                    </Col>
                    <Col xs={8} align="middle">
                        <Row>
                            <Col span={8}>
                                <Button type="primary" style={{width: '40px'}}>-</Button>
                            </Col>
                            <Col span={8}>
                                <Form.Item style={{marginBottom: 0}}>
                                    {getFieldDecorator('realizadoQuantidade')(
                                        
                                        <Input
                                            style={{width: '90%'}}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" style={{width: '40px'}}>+</Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={2} align="middle">
                        10
                    </Col>
                    <Col xs={2} align="middle">
                        8
                    </Col>
                </Row>
            </Form>
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
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) },
    }
}
 
export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ProducaoLancamento))