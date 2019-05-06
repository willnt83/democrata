import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Icon, notification, Button } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

class LancamentoProducao extends Component{
    constructor(props){
        super(props)
        this.state = {
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
        console.log('scan', data)
        if(this.state.idFuncionario !== null){
            var request = {
                idFuncionario: this.state.idFuncionario,
                barcode: data
            }
            console.log('request', request)
            this.requestLancamentoProducao(request)
        }
        else{
            console.log('Selecione um funcionário!')
        }
    }

    handleError(err){
        console.error(err)
    }

    getCodigosDeBarrasLancados = (idFuncionario) => {
        axios
        .get(this.props.backEndPoint + '/getCodigosDeBarrasLancados?idFuncionario='+idFuncionario)
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
        this.setState({
            idFuncionario: value,
            nomeFuncionario: e.props.children
        })

        this.getCodigosDeBarrasLancados(value)
    }

    alterarFuncionario = () => {
        this.setState({
            idFuncionario: null,
            nomeFuncionario: null
        })
    }

    render(){
        console.log('this.state.barcodes', this.state.barcodes)
        const { getFieldDecorator } = this.props.form
        return(
            <Modal
                title="Lançamento de Produção"
                visible={this.props.showModalLancamentoProducao}
                onCancel={() => this.props.showModalLancamentoProducaoF(false)}
                footer={[
                    <Button key="back" onClick={() => this.props.showModalLancamentoProducaoF(false)}><Icon type="close" /> Cancelar</Button>,
                    <Button key="submit" type="primary" loading={this.state.buttonSalvarProducaoLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
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
                            </Form>
                            :
                            <Row>
                                <Col span={24}>
                                    <span className="bold">Funcionário: {this.state.nomeFuncionario}</span>
                                    <Button type="primary" style={{marginLeft: 10}} onClick={this.alterarFuncionario}>Alterar</Button>
                                </Col>
                            </Row>
                        }
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