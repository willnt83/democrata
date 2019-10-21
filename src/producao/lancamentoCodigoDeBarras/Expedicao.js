import React, { Component } from 'react'
import { Row, Col, Form, Modal, Icon, Button, Divider, Table, Input, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'
import moment from 'moment'

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

class Expedicao extends Component{
    constructor(props){
        super(props)
        this.state = {
            tableData: [],
            barcodeReader: false,
            lancamentoManual: false
        }
        this.handleScanExpedicao = this.handleScanExpedicao.bind(this)
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

    handleScanExpedicao(data){
        const idProducaoArr = data.split('-')
        if(idProducaoArr.length !== 6){
            this.showNotification('Código de barras inválido', false)
        }
        else{
            const idProducao = idProducaoArr[0]
            var request = {
                idProducao: idProducao,
                barcode: data
            }
            this.requestConferenciaProducao(request)
        }
    }

    getCodigoDeBarrasInfo(barcode){
        axios
        .get(this.props.backEndPoint + '/getCodigoDeBarrasInfo?codigo='+barcode)
        .then(res => {
            var tableData = this.state.tableData
            tableData.push(res.data.payload)
            this.setState({tableData})
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestConferenciaProducao = (request) => {
        axios
        .post(this.props.backEndPoint + '/conferenciaCodigoDeBarras', request)
        .then(res => {
            if(res.data.success){
                this.showNotification(res.data.msg, res.data.success)
                this.getCodigoDeBarrasInfo(request.barcode)
            }
            else{
                this.showNotification(res.data.msg, res.data.success)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    closeModal = () => {
        this.setState({
            barcodeReader: false,
            //mesSelecionado: null,
            //nomeMesSelecionado: null,
            //idFuncionario: null,
            //nomeFuncionario: null,
            tableData: []
        })
        this.props.showModalExpedicaoF(false)
    }

    habilitarLancamentoManual = () => {
        var bool = this.state.lancamentoManual ? false : true
        this.setState({lancamentoManual: bool})
    }

    lancamentoManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                const idProducaoArr = values.codigoDeBarras.split('-')
                if(idProducaoArr.length !== 6){
                    this.showNotification('Código de barras inválido', false)
                }
                else{
                    const idProducao = idProducaoArr[0]
                    var request = {
                        idProducao: idProducao,
                        barcode: values.codigoDeBarras
                    }
                    this.requestConferenciaProducao(request)
                }
            }
        })
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalExpedicao && nextProps.showModalExpedicao){
            this.setState({barcodeReader: true})
        }
    }

    render(){
        const todayDT = moment();
        const { getFieldDecorator } = this.props.form

        const columns = [{
            title: 'ID',
            dataIndex: 'idProducao',
            sorter: (a, b) => a.idProducao - b.idProducao,
        },
        {
            title: 'Produção',
            dataIndex: 'nomeProducao',
            sorter: (a, b) => this.compareByAlph(a.nomeProducao, b.nomeProducao)
        },
        {
            title: 'Produto',
            dataIndex: 'nomeProduto',
            sorter: (a, b) => this.compareByAlph(a.nomeProduto, b.nomeProduto)
        },
        {
            title: 'Cor',
            dataIndex: 'corProduto',
            sorter: (a, b) => this.compareByAlph(a.corProduto, b.corProduto)
        },
        {
            title: 'Conjunto',
            dataIndex: 'nomeConjunto',
            sorter: (a, b) => this.compareByAlph(a.nomeConjunto, b.nomeConjunto)
        },
        {
            title: 'Setor',
            dataIndex: 'nomeSetor',
            sorter: (a, b) => this.compareByAlph(a.nomeSetor, b.nomeSetor)
        },
        {
            title: 'Subproduto',
            dataIndex: 'nomeSubproduto',
            sorter: (a, b) => this.compareByAlph(a.nomeSubproduto, b.nomeSubproduto)
        },
        {
            title: 'Lançado',
            dataIndex: 'lancado',
            align: 'center',
            render: (text, record) => {
                return(
                    record.lancado === 'Y' ?
                    <Icon type="check" style={{color: '#13a54b'}} />
                    :
                    <Icon type="close" style={{color: '#ea2c2c'}} />
                )
            }
        },
        {
            title: 'Conferido',
            dataIndex: 'conferido',
            align: 'center',
            render: (text, record) => {
                return(
                    record.conferido === 'Y' ?
                    <Icon type="check" style={{color: '#13a54b'}} />
                    :
                    <Icon type="close" style={{color: '#ea2c2c'}} />
                )
            }
        }]

        return(
            <Modal
                title="Conferência de Produtos"
                visible={this.props.showModalExpedicao}
                onCancel={this.closeModal}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}> Fechar</Button>,
                ]}
                width={1200}
                maskClosable={false}
            >
                <Row>
                    <Col span={24} id="colLancamentoProducao" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanExpedicao}
                            />
                            :null
                        }

                        <Row>
                            <Col span={24}>
                                <span className="bold">Mês: {mesLancamentoOptions[parseInt(todayDT.format('M'))-1].description}</span>
                            </Col>
                            <Col span={24}>
                                <span className="bold">Funcionário: {this.props.session.usuario.id} - {this.props.session.usuario.nome}</span>
                            </Col>

                            <Col span={24}>
                                <span className="bold" onClick={this.habilitarLancamentoManual} style={{cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Lançamento Manual</span>
                            </Col>
                            {
                                this.state.lancamentoManual ?
                                <Col span={24} style={{marginTop: 20}}>
                                    <Form layout="vertical">
                                        <Form.Item
                                            label="Código de Barras"
                                        >
                                            {getFieldDecorator('codigoDeBarras', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor informe o código de barras',
                                                    }
                                                ]
                                            })(
                                                <Input
                                                    id="nome"
                                                    placeholder="Digite o código de barras"
                                                />
                                            )}
                                        </Form.Item>
                                        <Button key="submit" type="primary" onClick={this.lancamentoManual}><Icon type="save" /> Lançar</Button>
                                    </Form>
                                </Col>
                                : null
                            }
                        </Row>

                        <Divider />
                        {
                            this.state.tableData.length > 0 ?
                            <Row style={{overflowX: 'scroll'}}>
                                <Col span={24}>
                                    <Table
                                        columns={columns}
                                        dataSource={this.state.tableData}
                                        rowKey='id'
                                        pagination={false}
                                    />
                                </Col>
                            </Row>
                            : null
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
        producaoMainData: state.producaoMainData,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(Expedicao)))