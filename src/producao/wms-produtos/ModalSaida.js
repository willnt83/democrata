import React, { Component } from 'react'
import { Row, Col, Form, Modal, Button, Divider, Table, Input } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

class ModalSaida extends Component{
    constructor(props){
        super(props)
        this.state = {
            idSaida: null,
            idSaidaProduto: null,
            barcodeReader: false,
            barcode: null,
            lancamentoManual: false,
            tableData: []
        }
        this.handleScan = this.handleScan.bind(this)
    }

    handleScan = (data) => {
        this.readingBarcode(data);
    }

    lancamentoManual = (bool) => {
        this.setState({lancamentoManual: bool})
    }

    lancarManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.readingBarcode(values.produtoBarcode)
            } else {
                console.log(err)
                this.props.showNotification('Código de barras inválido para produto finalizado', false)
            }
        })
    }

    readingBarcode = (barcode = null) => {
        var request = {
            idSaida: this.state.idSaida,
            idUsuario: this.props.session.usuario.id,
            barcode: barcode
        }
        this.requestLancamentoSaidaProdutos(request)
    }

    handleError(err){
        console.error(err)
    }

    requestGetSaidaProdutos = (idSaida) => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getSaidaProdutos?id_saida='+idSaida)
        .then(res => {
            if(res.data.success)
                this.setState({tableData: res.data.payload});
            else
                this.props.showNotification(res.data.msg, false)
        })
        .catch(error => {
            console.log(error);
            this.props.showNotification('Erro ao buscar informações.', false)
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


    requestLancamentoSaidaProdutos = (request) => {
        axios.post(this.props.backEndPoint + '/wms-produtos/lancamentoSaidaProdutos', request)
        .then(res => {
            if(res.data.success){
                this.props.showNotification(res.data.msg, res.data.success)
                this.setState({idSaida: res.data.payload.idSaida, idSaidaProduto: res.data.payload.idSaidaProduto})
                this.requestGetSaidaProdutos(res.data.payload.idSaida, res.data.payload.idSaidaProduto)
                this.props.form.setFieldsValue({produtoBarcode: null})
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    updateTableData = (data) => {
        var tableData = this.state.tableData
        tableData.push(data)
        this.setState({tableData})
    }

    closeModal = () => {
        this.setState({
            idSaida: null,
            idSaidaProduto: null,
            barcodeReader: false,
            barcode: null,
            lancamentoManual: false,
            tableData: []
        })
        this.props.showModalSaidaF(false)
    }

    componentWillReceiveProps(nextProps){
        // Modal aberto
        if(!this.props.showModalSaida && nextProps.showModalSaida){
            this.setState({idSaida: this.props.idSaida, barcodeReader: true})
        }

        if(this.props.idSaida !== nextProps.idSaida){
            if(nextProps.idSaida){
                this.setState({idSaida: nextProps.idSaida})
                this.requestGetSaidaProdutos(nextProps.idSaida, null);
            }
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [
            {
                title: 'SKU',
                dataIndex: 'produto.sku',
                sorter: (a, b) => this.compareByAlph(a.produto.sku, b.produto.sku)
            },
            {
                title: 'Produto',
                dataIndex: 'produto.nome',
                sorter: (a, b) => this.compareByAlph(a.produto.nome, b.produto.nome)
            },
            {
                title: 'Cor',
                dataIndex: 'produto.cor',
                sorter: (a, b) => this.compareByAlph(a.cor.descricao, b.cor.descricao)
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
                <Button key="submit" onClick={this.lancarManual}>Lançar Saida do Produto</Button>
            </React.Fragment>

        return(
            <Modal
                title="Saida de Produtos Finalizados"
                visible={this.props.showModalSaida}
                onCancel={this.closeModal}
                maskClosable={false}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}> Fechar</Button>,
                ]}
            >
                <Row>
                    <Col span={24} id="colSaidaDeProdutosFinalizados" style={{position: 'relative'}}>
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(ModalSaida)))