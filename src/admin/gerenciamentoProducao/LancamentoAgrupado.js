import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Button, Divider, Table, Input } from 'antd'
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

class LancamentoAgrupado extends Component{
    constructor(props){
        super(props)
        this.state = {
            mesSelecionado: {
                id: null,
                descricao: null
            },
            funcionarioSelecionado: {
                id: null,
                descricao: null
            },
            lancamentoManualFuncionario: false,
            lancamentoManualProducao: false,
            tableData: [],
            barcodeReaderFuncionario: false,
            barcodeReaderLancamento: false
        }
        this.handleScanFuncionario = this.handleScanFuncionario.bind(this)
    }

    handleScanFuncionario(data){
        var dataArr = data.split('-')
        var idFuncionario = dataArr[1]
        this.requestGetFuncionarios(idFuncionario)
        
    }

    handleScanLancamento = (data) => {
        var request = {
            idFuncionario: this.state.funcionarioSelecionado.id,
            barcode: data
        }
        this.requestLancamentoProducao(request)
    }

    handleError(err){
        console.error(err)
    }

    requestGetFuncionarios = (idFuncionario) => {
        axios
        .get(this.props.backEndPoint + '/getFuncionarios?id='+idFuncionario)
        .then(res => {
            this.setState({
                funcionarioSelecionado: {
                    id: res.data.payload[0].id,
                    descricao: res.data.payload[0].nome
                }
            })
            this.mesFuncionarioSelecionados()
        })
        .catch(error => {
            console.log('error', error)
        })
    }

    requestGetCodigoDeBarrasInfo = (codigo) => {
        axios
        .get(this.props.backEndPoint + '/getCodigoDeBarrasInfo?codigo='+codigo)
        .then(res => {
            var tableData = this.state.tableData
            tableData.push(res.data.payload)
            this.setState({
                tableData,
                barcodeReaderFuncionario: false,
                barcodeReaderLancamento: false,
                funcionarioSelecionado: {
                    id: null,
                    descricao: null
                }
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
                this.props.showNotification(res.data.msg, res.data.success)
                this.requestGetCodigoDeBarrasInfo(request.barcode)
                this.setState({
                    funcionarioSelecionado: {
                        id: null,
                        descricao: null
                    },
                    lancamentoManualFuncionario: false,
                    lancamentoManualProducao: false,
                    barcodeReaderFuncionario: false,
                    barcodeReaderLancamento: false
                })
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    mesSelecionado = (value, e) => {
        this.setState({
            mesSelecionado: {
                id: value,
                descricao: e.props.children
            },
            barcodeReaderFuncionario: true
        })
    }

    alterarMes = () => {
        this.setState({
            mesSelecionado: {
                id: null,
                descricao: null
            }
        })
    }

    alterarFuncionario = () => {
        this.setState({
            barcodeReaderFuncionario: true,
            barcodeReaderLancamento: false,
            funcionarioSelecionado: {
                id: null,
                descricao: null
            }
        })
    }

    lancamentoManualFuncionario = (bool) => {
        this.setState({lancamentoManualFuncionario: bool})
    }

    selecionarFuncionarioManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var funcionarioBarcodeArr = values.funcionarioBarcode.split('-')
                this.requestGetFuncionarios(funcionarioBarcodeArr[1])
            }
        })
    }

    lancamentoManualProducao = (bool) => {
        this.setState({lancamentoManualProducao: bool})
    }

    lancarProducaoManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var request = {
                    idFuncionario: this.state.funcionarioSelecionado.id,
                    barcode: values.producaoBarcode
                }
                this.requestLancamentoProducao(request)
            }
        })
    }

    mesFuncionarioSelecionados = () => {
        this.setState({
            barcodeReaderFuncionario: false,
            barcodeReaderLancamento: true
        })
    }

    closeModal = () => {
        this.setState({
            barcodeReader: false,
            mesSelecionado: {
                id: null,
                descricao: null
            },

            idFuncionario: null,
            nomeFuncionario: null,
            tableData: [],
            lancamentoManual: false
        })
        this.props.showModalLancamentoAgrupadoF(false)
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalLancamentoProducao && nextProps.showModalLancamentoProducao){
            this.requestGetFuncionarios()
            this.setState({barcodeReader: true})
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [
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
                title: 'Funcionário',
                dataIndex: 'nomeFuncionario',
                sorter: (a, b) => this.compareByAlph(a.nomeFuncionario, b.nomeFuncionario)
            }
        ]

        const inputFuncionario =
            <React.Fragment>
                <Form.Item label="Código de Barras do Funcionário">
                    {getFieldDecorator('funcionarioBarcode')(
                        <Input
                            id="funcionarioBarcode"
                        />
                    )}
                </Form.Item>
                <Button onClick={this.selecionarFuncionarioManual}>Selecionar Funcionário</Button>
            </React.Fragment>

        const inputLancamentoProducao =
            <React.Fragment>
                <Form.Item label="Código de Barras do Subproduto">
                    {getFieldDecorator('producaoBarcode')(
                        <Input
                            id="producaoBarcode"
                        />
                    )}
                </Form.Item>
                <Button onClick={this.lancarProducaoManual}>Lançar Produção</Button>
            </React.Fragment>

        return(
            <Modal
                title="Lançamento Agrupado"
                visible={this.props.showModalLancamentoAgrupado}
                onCancel={this.closeModal}
                maskClosable={false}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}> Fechar</Button>,
                ]}
                width={1200}
            >
                <Row>
                    <Col span={24} id="colLancamentoAgrupado" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReaderFuncionario ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanFuncionario}
                            />
                            :null
                        }
                        {
                            this.state.barcodeReaderLancamento ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanLancamento}
                            />
                            :null
                        }

                        {
                            <Form layout="vertical">
                                <Row>
                                {
                                    this.state.mesSelecionado.id === null ?
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
                                                        showSearch
                                                        optionFilterProp="children"
                                                        style={{ width: '100%' }}
                                                        placeholder="Selecione"
                                                        getPopupContainer={() => document.getElementById('colLancamentoAgrupado')}
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
                                        :
                                        <React.Fragment>
                                            <Col span={24}><span className="bold">Mes:</span> {this.state.mesSelecionado.descricao}<span onClick={this.alterarMes} style={{marginLeft: 10, cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Alterar</span></Col>
                                            {
                                                this.state.funcionarioSelecionado.id === null ?
                                                <React.Fragment>
                                                    {
                                                        this.state.lancamentoManualFuncionario === false ?
                                                        <Col span={24}><span className="bold">Aguardando leitura do código de barras do funcionário...</span><span onClick={this.lancamentoManualFuncionario} style={{marginLeft: 10, cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Lançamento Manual</span></Col>
                                                        :
                                                        <Col span={6} style={{marginTop: 10}}>
                                                            {inputFuncionario}
                                                        </Col>
                                                    }
                                                </React.Fragment>
                                                :
                                                <React.Fragment>
                                                    <Col span={24}>
                                                        <span className="bold">Funcionário:</span> {this.state.funcionarioSelecionado.descricao}<span onClick={this.alterarFuncionario} style={{marginLeft: 10, cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Alterar</span>
                                                    </Col>
                                                    {
                                                        this.state.lancamentoManualProducao === false ?
                                                        <Col span={24}><span className="bold">Aguardando leitura do código de barras do lançamento...</span><span onClick={() => this.lancamentoManualProducao(true)} style={{marginLeft: 10, cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Lançamento Manual</span></Col>
                                                        :
                                                        <Col span={6} style={{marginTop: 10}}>
                                                            {inputLancamentoProducao}
                                                        </Col>
                                                    }
                                                    
                                                </React.Fragment>
                                            }
                                        </React.Fragment>
                                    }
                                </Row>
                            </Form>
                        }
                        <Divider />
                        {
                            this.state.tableData.length > 0 ?
                            <Table
                                columns={columns}
                                dataSource={this.state.tableData}
                                rowKey='nomeSubproduto'
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(LancamentoAgrupado)))