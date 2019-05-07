import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Icon, notification, Button, Divider } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

const mesLancamentoOptions = [
    {value: '1', description: 'Janeiro'},
    {value: '2', description: 'Fevereiro'},
    {value: '3', description: 'Março'},
    {value: '4', description: 'Abril'},
    {value: '5', description: 'Maio'},
    {value: '6', description: 'Junho'},
    {value: '7', description: 'Julho'},
    {value: '8', description: 'Agosto'},
    {value: '9', description: 'Setembro'},
    {value: '10', description: 'Outubro'},
    {value: '11', description: 'Novembro'},
    {value: '12', description: 'Dezembro'}
]

class LancamentoProducao extends Component{
    constructor(props){
        super(props)
        this.state = {
            mesSelecionado: null,
            nomeMesSelecionado: null,
            idFuncionario: null,
            nomeFuncionario: null,
            barcodes: []
        }
        this.handleScan = this.handleScan.bind(this)
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

    handleScan(data){
        if(this.state.idFuncionario !== null){
            var request = {
                idFuncionario: this.state.idFuncionario,
                barcode: data
            }
            this.requestLancamentoProducao(request)
        }
        else{
            console.log('Selecione um funcionário!')
        }
    }

    handleError(err){
        console.error(err)
    }

    getCodigosDeBarrasLancados = (idFuncionario, dtInicial, dtFinal) => {
        axios
        .get(this.props.backEndPoint + '/getCodigosDeBarrasLancados?idFuncionario='+idFuncionario+'&dataInicial='+dtInicial+'&dataFinal='+dtFinal)
        .then(res => {
            this.setState({
                barcodes: res.data.payload.map(barcode => {
                    return(
                        barcode
                    )
                })
            })
           
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestLancamentoProducao = (request) => {
        axios
        .post(this.props.backEndPoint + '/lancamentoCodigoDeBarras', request)
        .then(res => {
            if(res.data.success){
                this.showNotification(res.data.msg, res.data.success)
                this.setState({
                    barcodes: [...this.state.barcodes, request.barcode]
                })
            }
            else{
                this.showNotification(res.data.msg, res.data.success)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    funcionarioSelecionado = (value, e) => {
        this.setState({nomeFuncionario: e.props.children})
    }

    mesSelecionado = (value, e) => {
        this.setState({nomeMesSelecionado: e.props.children})
    }

    getMonthDateRange = (year, month) => {
        var moment = require('moment');
    
        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment([year, month - 1]);
    
        // Clone the value before .endOf()
        var endDate = moment(startDate).endOf('month');
    
        // just for demonstration:
        console.log(startDate.toDate());
        console.log(endDate.toDate());
    
        // make sure to call toDate() for plain JavaScript date type
        return { start: startDate, end: endDate };
    }

    mesFuncionarioSelecionados = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var range = this.getMonthDateRange(2019, values.mesLancamento)
                this.setState({
                    mesSelecionado: values.mesLancamento,
                    idFuncionario: values.funcionario,
                })
                this.getCodigosDeBarrasLancados(values.funcionario, range.start.format('DD/MM/YYYY'), range.end.format('DD/MM/YYYY'))
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    alterarFuncionario = () => {
        this.setState({
            idFuncionario: null,
            nomeFuncionario: null,
            barcodes: []
        })
    }

    render(){
        const { getFieldDecorator } = this.props.form
        return(
            <Modal
                title="Lançamento de Produção"
                visible={this.props.showModalLancamentoProducao}
                onCancel={() => this.props.showModalLancamentoProducaoF(false)}
                footer={[
                    <Button type="primary" key="back" onClick={() => this.props.showModalLancamentoProducaoF(false)}><Icon type="close" /> Fechar</Button>,
                ]}
                width={900}
            >
                <Row>
                    <Col span={24} id="colLancamentoProducao" style={{position: 'relative'}}>
                        <BarcodeReader
                            onError={this.handleError}
                            onScan={this.handleScan}
                        />
                        {
                            this.state.idFuncionario === null ?
                            <Form layout="vertical">
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Form.Item label="Mês">
                                            {getFieldDecorator('mesLancamento', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione o mês',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colLancamentoProducao')}
                                                    allowClear={true}
                                                    onChange={this.mesSelecionado}
                                                >
                                                    {
                                                        mesLancamentoOptions.map((option) => {
                                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={18}>
                                        <Form.Item label="Funcionário">
                                            {getFieldDecorator('funcionario', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione o funcionário',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colLancamentoProducao')}
                                                    allowClear={true}
                                                    onChange={this.funcionarioSelecionado}
                                                >
                                                    {
                                                        this.props.funcionariosOptions.map((option) => {
                                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <Button className="buttonGreen" key="submit" onClick={() => this.mesFuncionarioSelecionados()}><Icon type="check" /> Selecionar</Button>
                                    </Col>
                                </Row>
                            </Form>
                            :
                            <Row>
                                <Col span={24}>
                                    <span className="bold">Mês: {this.state.nomeMesSelecionado}</span>
                                </Col>
                                <Col span={24}>
                                    <span className="bold">Funcionário: {this.state.nomeFuncionario}</span>
                                    <span className="bold" onClick={this.alterarFuncionario} style={{marginLeft: 10, cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Alterar</span>
                                </Col>
                            </Row>
                        }
                        <Divider />
                        {
                            this.state.barcodes.map(barcode => {
                                return(
                                    <Row key={barcode}>
                                        <Col span={24} align="left" className="bold">{barcode}</Col>
                                    </Row>
                                )
                            })
                        }
                    </Col>
                </Row>
            </Modal>
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
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(LancamentoProducao)))