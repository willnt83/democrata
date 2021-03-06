import React, { Component } from 'react'
import { Row, Col, Form, Modal, Input, Icon, Button, Divider, Table } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

class ConferenciaProducao extends Component{
    constructor(props){
        super(props)
        this.state = {
            tableData: [],
            barcodeReader: true,
            lancamentoManual: false,
            btnLancarLoading: false
        }
        this.handleScanConferencia = this.handleScanConferencia.bind(this)
    }

    lancamentoManual = (bool) => {
        this.setState({lancamentoManual: bool, barcodeReader: !bool})
    }

    handleScanConferencia(data){
        var codigoArr = data.split('-')
        var request = {
            idProducao: codigoArr[0],
            barcode: data
        }
        this.requestConferenciaProducao(request)
    }

    handleError(err){
        console.error(err)
    }

    handleLancamento = () => {
        this.setState({btnLancarLoading: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var codigoArr = values.codigoDeBarras.split('-')
                var request = {
                    idProducao: codigoArr[0],
                    barcode: values.codigoDeBarras
                }
                this.requestConferenciaProducao(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    requestGetCodigoDeBarrasInfo = (codigo) => {
        axios
        .get(this.props.backEndPoint + '/getCodigoDeBarrasInfo?codigo='+codigo)
        .then(res => {
            var tableData = this.state.tableData
            tableData.push(res.data.payload)
            this.setState({
                tableData
            })
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
                this.requestGetCodigoDeBarrasInfo(request.barcode)
                this.props.form.setFieldsValue({codigoDeBarras: ''})
            }
            this.props.showNotification(res.data.msg, res.data.success)
            this.setState({btnLancarLoading: false})
        })
        .catch(error => {
            this.setState({btnLancarLoading: false})
            console.log(error)
        })
    }

    closeModal = () => {
        this.setState({
            barcodeReader: false,
            idProducao: null,
            tableData: []
        })
        this.props.showModalConferenciaProducaoF(false)
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [{
            title: 'Código',
            dataIndex: 'codigo',
            sorter: (a, b) => a.codigo - b.codigo,
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

        const inputLancamentoManual =
            <React.Fragment>
                <Form.Item label="Código de Barras" style={{marginBottom: '0px'}}>
                    {getFieldDecorator('codigoDeBarras', {
                        rules: [
                            {
                                required: true, message: 'Por favor informe o código de barras',
                            }
                        ]
                    })(
                        <Input
                            id="codigoDeBarras"
                            placeholder="Digite o código de barras"
                        />
                    )}
                </Form.Item>
                <Button key="submit" type="primary" onClick={this.handleLancamento} loading={this.state.btnLancarLoading}><Icon type="save" /> Lançar</Button>
            </React.Fragment>

        return(
            <Modal
                title="Conferência de Produção"
                visible={this.props.showModalConferenciaProducao}
                onCancel={this.closeModal}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}><Icon type="close" /> Fechar</Button>,
                ]}
                width={1200}
            >
                <Row style={{marginBottom: 10}}>
                    {
                        !this.state.lancamentoManual ?
                        <Col span={24} onClick={() => this.lancamentoManual(true)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                            <span className="bold" onClick={this.habilitarLancamentoManual} style={{cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Lançamento Manual</span>
                        </Col>
                        :
                        <Col span={24} onClick={() => this.lancamentoManual(false)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                            <span className="bold" onClick={this.habilitarLancamentoManual} style={{cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Código de Barras</span>
                        </Col>
                    }
                </Row>
                <Row>
                    <Col span={24} id="colConferenciaProducao" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanConferencia}
                            />
                            :null
                        }

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

                        <Divider />
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
        producaoAcompanhamento: state.producaoAcompanhamento,
        producaoMainData: state.producaoMainData
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(ConferenciaProducao)))