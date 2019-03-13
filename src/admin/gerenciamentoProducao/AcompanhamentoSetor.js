import React, { Component } from 'react'
import { Row, Col, Divider, Form, Input, Select, Button, Icon } from 'antd'
import { connect } from 'react-redux'
//import axios from "axios"
import { withRouter } from "react-router-dom"
import moment from 'moment'

class AcompanhamentoSetor extends Component {
    state = {
        dataAcompanhamentoOptions: [],
        dataAcompanhamento: moment().format('YYYY-MM-DD'),
        fieldsRendered: false,
        firstRender: true
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

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            console.log('values', values)
        })
    }

    buildAcompanhamentoRows = (producaoAcompanhamento) => {
        console.log('fields rendered...')
        if(this.state.firstRender === true)
            this.setState({fieldsRendered: true, firstRender: false})
    }

    componentWillMount(){
        if(this.state.firstRender)
            this.buildDataAcompanhamentoOptions()
    }

    componentWillReceiveProps(props){
        this.buildAcompanhamentoRows(props.producaoAcompanhamento)
    }

    componentWillUpdate(nextProps, nextState){
        if(this.state.fieldsRendered === true){
            console.log('componentWillUpdate... fieldsRendered')
            console.log('this.props.producaoAcompanhamento', this.props.producaoAcompanhamento)
            var aux = []
            var realizadoQuantidade = []
            var index = null
            this.props.producaoAcompanhamento
            .filter(setor => {
                return (this.props.idSetor === setor.id && setor.dataInicial === this.state.dataAcompanhamento)
            })
            .map(setor => {
                return(
                    setor.produtos.map(produto => {
                        return(
                            produto.subprodutos.map(subprodutos => {
                                aux.push({
                                    id: subprodutos.idAcompanhamento,
                                    realizadoQuantidade: subprodutos.realizadoQuantidade
                                })
                                return({
                                    id: subprodutos.idAcompanhamento,
                                    realizadoQuantidade: subprodutos.realizadoQuantidade
                                })
                            })
                        )
                    })
                )
            })

            aux.forEach(item => {
            })

            /* Funcionam
            this.props.form.setFieldsValue({'realizadoQuantidade["id_172"]' : 99})
            */

            var varName = 'realizadoQuantidade["id_172"]';

            this.props.form.setFieldsValue({'`${varName}`' : 99})
            this.setState({fieldsRendered: false})
        }
    }

    render(){
        
        //const { getFieldDecorator, getFieldValue } = this.props.form
        const { getFieldDecorator } = this.props.form
        const rows = this.props.producaoAcompanhamento
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
                                        produto.subprodutos.map((subproduto, index) => {
                                            return(
                                                <Row key={subproduto.id} type="flex" style={{alignItems: 'center'}}>
                                                    <Col span={12}><h4> - {subproduto.nome}</h4></Col>
                                                    <Col span={12}>
                                                        <Row type="flex" style={{alignItems: 'center'}}>
                                                            <Col span={12} align="middle">
                                                                <Form.Item key={subproduto.id} style={{width: '24%', marginBottom: 0}}>
                                                                    {getFieldDecorator(`realizadoQuantidade["id_${subproduto.idAcompanhamento}"]`)(
                                                                        <Input onChange={this.handleQuantidadeRealizadoChange} />
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

                <Row type="flex" style={{backgroundColor: '#cbd8ed', padding: '0 10px 0 10px', marginBottom: 12, alignItems: 'center'}}>
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
                {rows}
                <Row type="flex">
                    <Button key="submit" type="primary" onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                </Row>
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