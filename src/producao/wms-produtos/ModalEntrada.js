import React, { Component } from 'react'
import { Row, Col, Form, Modal, Button, Divider, Table, Input } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

class ModalEntrada extends Component{
    constructor(props){
        super(props)
        this.state = {
            idEntrada: null,
            barcodeReader: false,
            lancamentoManual: false,
            tableData: []
        }
        this.handleScan = this.handleScan.bind(this)
    }


    handleScan = (data) => {
        var dataArr = data.split('-')
        
        if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6){
            this.props.showNotification('Código de barras inválido para produto finalizado', false)
        }
        else{
            var request = {
                idEntrada: this.state.idEntrada,
                idUsuario: this.props.session.usuario.id,
                barcode: data
            }
            this.requestLancamentoEntradaProdutos(request)
        }
    }

    handleError(err){
        console.error(err)
    }

    requestGetEntradaprodutos = (idEntrada) => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getEntradaProdutos?id_entrada_produtos='+idEntrada)
        .then(res => {
            this.setState({tableData: res.data.payload})
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetCodigoDeBarrasInfo = (codigo) => {
        axios.get(this.props.backEndPoint + '/getCodigoDeBarrasInfo?codigo='+codigo)
        .then(res => {
            this.updateTableData(res.data.payload)
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestLancamentoEntradaProdutos = (request) => {
        axios.post(this.props.backEndPoint + '/wms-produtos/lancamentoEntradaProdutos', request)
        .then(res => {
            if(res.data.success){
                this.props.showNotification(res.data.msg, res.data.success)
                this.setState({idEntrada: res.data.payload.idEntrada})
                this.requestGetCodigoDeBarrasInfo(request.barcode)
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    lancamentoManual = (bool) => {
        this.setState({lancamentoManual: bool})
    }

    lancarManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var dataArr = values.produtoBarcode.split('-')
        
                if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6){
                    this.props.showNotification('Código de barras inválido para produto finalizado', false)
                }
                else{
                    var request = {
                        idEntrada: this.state.idEntrada,
                        idUsuario: this.props.session.usuario.id,
                        barcode: values.produtoBarcode
                    }

                    this.props.form.setFieldsValue({produtoBarcode: null})
                    this.requestLancamentoEntradaProdutos(request)
                }
            }
        })
    }

    updateTableData = (data) => {
        var tableData = this.state.tableData
        tableData.push(data)
        this.setState({tableData})
    }

    closeModal = () => {
        this.setState({
            idEntrada: null,
            barcodeReader: false,
            lancamentoManual: false,
            tableData: []

        })
        this.props.showModalEntradaF(false)
    }

    componentWillReceiveProps(nextProps){
        // Modal aberto
        if(!this.props.showModalEntrada && nextProps.showModalEntrada){
            this.setState({idEntrada: this.props.idEntrada, barcodeReader: true})
        }

        if(this.props.idEntrada !== nextProps.idEntrada){
            if(nextProps.idEntrada)
                this.requestGetEntradaprodutos(nextProps.idEntrada)
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [
            {
                title: 'Produção',
                dataIndex: 'producao.nome',
                sorter: (a, b) => this.compareByAlph(a.producao.nome, b.producao.nome)
            },
            {
                title: 'Produto',
                dataIndex: 'produto.nome',
                sorter: (a, b) => this.compareByAlph(a.produto.nome, b.produto.nome)
            },
            {
                title: 'Cor',
                dataIndex: 'produto.cor',
                sorter: (a, b) => this.compareByAlph(a.produto.cor, b.produto.cor)
            }
        ]

        const inputLancamentoManual =
            <React.Fragment>
                <Form.Item label="Código de Barras do Produto">
                    {getFieldDecorator('produtoBarcode')(
                        <Input
                            id="produtoBarcode"
                        />
                    )}
                </Form.Item>
                <Button onClick={this.lancarManual}>Lançar Entrada do Produto</Button>
            </React.Fragment>

        return(
            <Modal
                title="Entrada de Produtos Finalizados"
                visible={this.props.showModalEntrada}
                onCancel={this.closeModal}
                maskClosable={false}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}> Fechar</Button>,
                ]}
            >
                <Row>
                    <Col span={24} id="colEntradaDeProdutosFinalizados" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScan}
                            />
                            :null
                        }

                        <Form layout="vertical">
                            <Row style={{marginBottom: 10}}>
                                {
                                    !this.state.lancamentoManual ?
                                    <Col span={24} onClick={() => this.lancamentoManual(true)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                                        Lançamento Manual
                                    </Col>
                                    :
                                    <Col span={24} onClick={() => this.lancamentoManual(false)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                                        Código de Barras
                                    </Col>
                                }
                            </Row>
                            <Row>
                                {
                                    !this.state.lancamentoManual ?
                                    <Col span={24}><span className="bold">Aguardando leitura do código de barras do produto...</span></Col>
                                    :
                                    <Col span={24}>
                                        {inputLancamentoManual}
                                    </Col>
                                }
                            </Row>
                        </Form>
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={24}>
                    {
                        this.state.tableData.length > 0 ?
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            rowKey='codigo'
                            pagination={false}
                        />
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
        producaoMainData: state.producaoMainData,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(ModalEntrada)))