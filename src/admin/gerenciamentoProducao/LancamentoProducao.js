import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Icon, Button, Divider, Table, Input } from 'antd'
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
            tableData: [],
            funcionariosOptions: [],
            barcodeReader: false,
            lancamentoManual: false
        }
        this.handleScanLancamento = this.handleScanLancamento.bind(this)
    }

    handleScanLancamento(data){
        if(this.state.idFuncionario !== null){
            var request = {
                idFuncionario: this.state.idFuncionario,
                barcode: data
            }
            this.requestLancamentoProducao(request)
        }
        else{
            this.props.showNotification('Selecione um funcionário', false)
        }
    }

    handleError(err){
        console.error(err)
    }

    requestGetFuncionarios = () => {
        axios
        .get(this.props.backEndPoint + '/getFuncionarios')
        .then(res => {
            this.setState({
                funcionariosOptions: res.data.payload.map(funcionario => {
                    return({
                        value: funcionario.id,
                        description: funcionario.nome
                    })
                })
            })
        })
        .catch(error => {
            console.log('error', error)
        })
    }

    getCodigosDeBarrasLancados = (idFuncionario, dtInicial, dtFinal) => {
        axios
        .get(this.props.backEndPoint + '/getCodigosDeBarrasLancados?idFuncionario='+idFuncionario+'&dataInicial='+dtInicial+'&dataFinal='+dtFinal)
        .then(res => {
            this.setState({
                tableData: res.data.payload
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
                var range = this.getMonthDateRange(2019, this.state.mesSelecionado)
                this.getCodigosDeBarrasLancados(this.state.idFuncionario, range.start.format('DD/MM/YYYY'), range.end.format('DD/MM/YYYY'))
                if(this.state.lancamentoManual){
                    this.props.form.setFieldsValue({
                        codigoDeBarras: ''
                    })
                }
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
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
        var startDate = moment([year, month - 1]);
        var endDate = moment(startDate).endOf('month');
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
            mesSelecionado: null,
            nomeMesSelecionado: null,
            idFuncionario: null,
            nomeFuncionario: null,
            tableData: []
        })
    }

    closeModal = () => {
        this.setState({
            barcodeReader: false,
            mesSelecionado: null,
            nomeMesSelecionado: null,
            idFuncionario: null,
            nomeFuncionario: null,
            tableData: [],
            lancamentoManual: false
        })
        this.props.showModalLancamentoProducaoF(false)
    }

    habilitarLancamentoManual = () => {
        var bool = this.state.lancamentoManual ? false : true
        this.setState({lancamentoManual: bool})
    }

    lancamentoManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var request = {
                    idFuncionario: this.state.idFuncionario,
                    barcode: values.codigoDeBarras
                }
                this.requestLancamentoProducao(request)
            }
        })
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalLancamentoProducao && nextProps.showModalLancamentoProducao){
            this.requestGetFuncionarios()
            this.setState({barcodeReader: true})
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.key - b.key,
        },
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
        },
        {
            title: 'Conjunto',
            dataIndex: 'conjunto.nome',
            sorter: (a, b) => this.compareByAlph(a.conjunto.nome, b.conjunto.nome)
        },
        {
            title: 'Setor',
            dataIndex: 'setor.nome',
            sorter: (a, b) => this.compareByAlph(a.setor.nome, b.setor.nome)
        },
        {
            title: 'Subproduto',
            dataIndex: 'subproduto.nome',
            sorter: (a, b) => this.compareByAlph(a.subproduto.nome, b.subproduto.nome)
        }]

        return(
            <Modal
                title="Lançamento de Produção"
                visible={this.props.showModalLancamentoProducao}
                onCancel={this.closeModal}
                maskClosable={false}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}> Fechar</Button>,
                ]}
                width={1200}
            >
                <Row>
                    <Col span={24} id="colLancamentoProducao" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanLancamento}
                            />
                            :null
                        }
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
                                                    showSearch
                                                    optionFilterProp="children"
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
                                                    showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colLancamentoProducao')}
                                                    allowClear={true}
                                                    onChange={this.funcionarioSelecionado}
                                                >
                                                    {
                                                        this.state.funcionariosOptions.map((option) => {
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
                        }
                        <Divider />
                        {
                            this.state.tableData.length > 0 ?
                            <Table
                                columns={columns}
                                dataSource={this.state.tableData}
                                rowKey='id'
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(LancamentoProducao)))