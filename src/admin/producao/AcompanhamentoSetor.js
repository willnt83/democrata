import React, { Component } from 'react'
//import { Layout, Tabs, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, DatePicker, Divider } from 'antd'
import { Row, Col, Divider, Form, Input, Select } from 'antd'
//import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
//import axios from "axios"
import { withRouter } from "react-router-dom"
//import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

class AcompanhamentoSetor extends Component {
    state = {
        dataAcompanhamentoOptions: [],
        dataAcompanhamento: moment().format('YYYY-MM-DD'),
        fieldsRendered: false,
        firstRender: true,
        rows: null
    }

    buildDataAcompanhamentoOptions = () => {
        const today = moment()
        var dataAcompanhamento = today.subtract(15, 'days')

        var dataAcompanhamentoOptions = []
        var i = 0
        while(i < 30){
            dataAcompanhamentoOptions.push({
                value: dataAcompanhamento.format('YYYY-MM-DD'),
                description: dataAcompanhamento.format('DD/MM/YYYY')
            })
            dataAcompanhamento = dataAcompanhamento.add(1, 'days')
            i++
        }
        this.setState({dataAcompanhamentoOptions})
    }

    handleChangeDataAcompanhamento = (value) => {
        this.setState({dataAcompanhamento: value})
    }

    buildAcompanhamentoRows = (producaoAcompanhamento) => {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const rows = producaoAcompanhamento
        .filter(setor => {
            return (this.props.idSetor === setor.id && setor.dataInicial === this.state.dataAcompanhamento)
        })
        .map(setor => {
            return(
                setor.produtos.map(produto => {
                    return(
                        <React.Fragment key={produto.id}>
                            <Row type="flex" style={{padding: '0 10px 0 10px', alignItems: 'center'}}>
                                <Col span={8} style={{paddingLeft: 10}}>
                                    <h4>{produto.nome}</h4>
                                </Col>
                                <Col span={16} align="begining">
                                    {
                                        produto.subprodutos.map(subproduto => {
                                            return(
                                                <Row key={subproduto.id} type="flex" style={{alignItems: 'center'}}>
                                                    <Col span={12}><h4> - {subproduto.nome}</h4></Col>
                                                    <Col span={12}>
                                                        <Row type="flex" style={{alignItems: 'center'}}>
                                                            <Col span={12} align="middle">
                                                                <Form.Item key={subproduto.id} style={{width: '24%', marginBottom: 0}} onValuesChange={this.handleBlurRealizadoQuantidade}>
                                                                    {getFieldDecorator(`realizadoQuantidade[${subproduto.id_acompanhamento}]`)(
                                                                        <Input />
                                                                    )}
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={12} align="middle">
                                                                <h4>{subproduto.total_quantidade}</h4>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            )
                                        })
                                    }
                                </Col>
                            </Row>
                            <Divider style={{margin: '12px 0'}}/>
                        </React.Fragment>
                    )
                })
            )
        })
        console.log('fields rendered...')
        if(this.state.firstRender === true)
            this.setState({rows, fieldsRendered: true, firstRender: false})
    }

    componentWillMount(){
        if(this.state.firstRender)
            this.buildDataAcompanhamentoOptions()
    }

    componentWillReceiveProps(props){
        this.buildAcompanhamentoRows(props.producaoAcompanhamento)
    }

    componentDidUpdate(nextProps, nextState){
        console.log('componentWillUpdate... fieldsRendered', this.state.fieldsRendered)
        if(this.state.fieldsRendered === true){
            console.log('entrou...')
            /*
            var realizadoQuantidade = this.props.producaoAcompanhamento
            .filter(setor => {
                return (this.props.idSetor === setor.id && setor.dataInicial === this.state.dataAcompanhamento)
            })
            .map(setor => {
                return(
                    setor.produtos.map(produto => {
                        return(
                            produto.subprodutos.map(subproduto => {
                                return(
                                    subproduto.realizado_quantidade
                                )
                            })
                        )
                    })
                )
            })
            */
           /*
            var keys = []
            keys = [25]
            */

            var realizadoQuantidade = []
            var i = 0
            while(i < 90){
                realizadoQuantidade.push(44)
                i++
            }

            console.log('realizadoQuantidade', realizadoQuantidade)
            
            this.props.form.setFieldsValue({
                realizadoQuantidade
            })
            this.setState({fieldsRendered: false})
        }
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form

        return(
            <Form layout="inline">
                <Row>
                    <Col span={24}>
                        <Form.Item label="Data do acompanhamento" title="Data de acompanhamento">
                            {getFieldDecorator('dataAcompanhamento', {
                                initialValue: moment().format('YYYY-MM-DD')
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    onChange={this.handleChangeDataAcompanhamento}
                                >
                                    {
                                        this.state.dataAcompanhamentoOptions.map((item) => {
                                            return (<Select.Option key={item.value} value={item.value}>{item.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row style={{backgroundColor: '#cbd8ed', padding: '0 10px 0 10px', marginBottom: 12}}>
                    <Col span={8}>
                        <h3>Produtos</h3>
                    </Col>
                    <Col span={8}>
                        <h3>Conjuntos</h3>
                    </Col>
                    <Col span={8} align="middle">
                        <Row>
                            <Col span={12} align="middle">
                                <h3>Realizado</h3>
                            </Col>
                            <Col span={12} align="middle">
                                <h3>Total</h3>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {this.state.rows}
            </Form>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        producaoAcompanhamento: state.producaoAcompanhamento
	}
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(AcompanhamentoSetor)))