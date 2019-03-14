import React, { Component } from 'react'
import { Row, Col, Divider, Form, Input, Select, Icon, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import moment from 'moment'

class AcompanhamentoSetor extends Component {
    state = {
        dataAcompanhamentoOptions: [],
        dataAcompanhamento: moment().format('YYYY-MM-DD'),
        //dataAcompanhamento: '2019-03-14',
        tryToSetValues: true,
        firstRender: true
    }

    requestUpdateRealizadoQuantidade = (request) => {
        axios
        .post(this.props.backEndPoint + '/updateRealizadoQuantidade', request)
        .then(res => {
            if(res.data.success){
                var id = this.props.producaoMainData ? this.props.producaoMainData.key : null
                this.props.requestGetProducaoAcompanhamento(id)
                this.showNotification(res.data.msg, true)
            }
            else{
                this.showNotification(res.data.msg, false)
            }
        })
        .catch(error => {
            console.log(error)
        })
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
        this.setState({dataAcompanhamento: value, tryToSetValues: true})
    }

    handleQuantidadeRealizadoBlur = (element) => {
        var idAcompanhamento = element.target.id.replace('realizadoQuantidade_', '')

        var request = {
            idAcompanhamento: parseInt(idAcompanhamento),
            realizadoQuantidade: parseInt(element.target.value)
        }

        this.requestUpdateRealizadoQuantidade(request)
    }

    setRealizadoQuantidadeValues = () => {
        var aux = []
        this.props.producaoAcompanhamento
        .filter(setor => {
            return (parseInt(this.props.idSetor) === setor.id)
        })
        .map(setor => {
            return(
                setor.producoes.filter(producao => {
                    return(producao.dataInicial === this.state.dataAcompanhamento)
                })
                .map(producao => {
                    return(
                        producao.produtos.map(produto => {
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
            )
        })

        var strObj = '{'
        var comma = ''
        aux.forEach((item, index) => {
            comma = index === 0 ? '' : ', '
            strObj += comma+'"realizadoQuantidade_'+item.id+'": "'+item.realizadoQuantidade+'"'
        })
        strObj += '}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
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
            duration: 1
        }
        notification.open(args)
    }

    componentWillMount(){
        if(this.state.firstRender)
            this.buildDataAcompanhamentoOptions()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.idSetor !== prevProps.idSetor && this.state.tryToSetValues === false){
            this.setState({tryToSetValues: true})
        }

        if((prevState.tryToSetValues === false && this.state.tryToSetValues === true) || this.state.firstRender === true){
            this.setRealizadoQuantidadeValues()
            this.setState({tryToSetValues: false, firstRender: false})
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form
        const rows = this.props.producaoAcompanhamento
        .filter(setor => {
            return (parseInt(this.props.idSetor) === setor.id)
        })
        .map(setor => {
            return(
                setor.producoes.filter(producao => {
                    return(producao.dataInicial === this.state.dataAcompanhamento)
                })
                .map(producao => {
                    return(
                        <React.Fragment key={producao.id}>
                            <Row type="flex" style={{padding: '0 10px 0 10px', alignItems: 'center'}}>
                                <Col span={6} style={{paddingLeft: 10}}>
                                    <h4>{producao.nome}</h4>
                                </Col>
                                <Col span={18}>
                                {
                                producao.produtos.map(produto => {
                                    return(
                                        <Row key={produto.id} type="flex" style={{padding: '0 10px 0 10px', alignItems: 'center'}}>
                                            <Col span={8} style={{paddingLeft: 10}}>
                                                <h4>{produto.nome} ({produto.cor.nome})</h4>
                                            </Col>
                                            <Col span={16} align="begining">
                                                {
                                                    produto.subprodutos.map((subproduto, index) => {
                                                        return(
                                                            <Row key={subproduto.id} type="flex" style={{alignItems: 'center'}}>
                                                                <Col span={12} style={{borderWidth: 1}}>
                                                                    <h4> - {subproduto.nome}</h4>
                                                                </Col>
                                                                <Col span={12}>
                                                                    <Row type="flex" style={{alignItems: 'center'}}>
                                                                        <Col span={12} align="middle">
                                                                            <Form.Item key={subproduto.id} style={{width: '24%', marginBottom: 0}}>
                                                                                {getFieldDecorator(`realizadoQuantidade_${subproduto.idAcompanhamento}`)(
                                                                                    <Input onBlur={this.handleQuantidadeRealizadoBlur} />
                                                                                )}
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col span={12} align="middle">
                                                                            <h4>{subproduto.totalQuantidade}</h4>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        )
                                                    })
                                                }
                                            </Col>
                                        </Row>
                                    )
                                })
                                }
                                </Col>
                            </Row>
                            <Divider style={{margin: '12px 0'}} />
                        </React.Fragment>
                    )
                })
            )
        })
        return(
            <Form layout="inline">
                <Row>
                    <Col span={24}>
                        <h3>Produção {this.props.nomeSetor}</h3>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item label="Data do acompanhamento" title="Data de acompanhamento">
                            {getFieldDecorator('dataAcompanhamento', {
                                initialValue: moment().format('YYYY-MM-DD')
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    onChange={this.handleChangeDataAcompanhamento}
                                    getPopupContainer={() => document.getElementById('contentAcompanhamento')}
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

                <Row type="flex" style={{backgroundColor: '#cbd8ed', padding: '0 10px 0 10px', marginBottom: 12, alignItems: 'center'}} gutter={8}>
                    <Col span={6}>
                        <h3>Produções</h3>
                    </Col>
                    <Col span={6}>
                        <h3>Produtos</h3>
                    </Col>
                    <Col span={6}>
                        <h3>Conjuntos</h3>
                    </Col>
                    <Col span={6} align="middle">
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
            </Form>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        producaoAcompanhamento: state.producaoAcompanhamento,
        producaoMainData: state.producaoMainData
	}
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(AcompanhamentoSetor)))