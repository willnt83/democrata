import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Icon, Button, Divider, Table } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

class EstornoProducao extends Component{
    constructor(props){
        super(props)
        this.state = {
            idProducao: null,
            nomeProducao: null,
            producoesOptions: [],
            tableData: [],
            barcodeReader: false
        }
        this.handleScanEstorno = this.handleScanEstorno.bind(this)
    }

    handleScanEstorno(data){
        if(this.state.idProducao !== null){
            var request = {
                idProducao: this.state.idProducao,
                barcode: data
            }
            this.requestEstornoProducao(request)
        }
        else{
            this.props.showNotification('Selecione uma produção', false)
        }
    }

    handleError(err){
        console.error(err)
    }

    requestGetProducoesTitulo = () => {
        axios
        .get(this.props.backEndPoint + '/getProducoesTitulo')
        .then(res => {
            this.setState({
                producoesOptions: res.data.payload.map(producao => {
                    return({
                        value: producao.id,
                        description: producao.id+' - '+producao.nome
                    })
                })
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetCodigosDeBarrasEstornados = (idProducao) => {
        axios
        .get(this.props.backEndPoint + '/getCodigosDeBarrasEstornados?idProducao='+idProducao)
        .then(res => {
            console.log('response', res.data.payload)
            this.setState({
                tableData: res.data.payload
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestEstornoProducao = (request) => {
        axios
        .post(this.props.backEndPoint + '/estornoCodigoDeBarras', request)
        .then(res => {
            if(res.data.success){
                this.props.showNotification(res.data.msg, res.data.success)
                this.requestGetCodigosDeBarrasEstornados(this.state.idProducao)
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    producaoChange = (value, e) => {
        console.log('-producaoChange-')
        this.setState({
            nomeProducao: e.props.children
        })
    }

    producaoSelecionada = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.setState({idProducao: values.producao})
                this.requestGetCodigosDeBarrasEstornados(values.producao)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    alterarProducao = () => {
        this.setState({
            idProducao: null,
            nomeProducao: null,
            tableData: []
        })
    }

    closeModal = () => {
        this.setState({
            barcodeReader: false,
            idProducao: null,
            nomeProducao: null,
            tableData: []
        })
        this.props.showModalEstornoProducaoF(false)
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalEstornoProducao && nextProps.showModalEstornoProducao){
            this.requestGetProducoesTitulo()
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
        },
        {
            title: 'Funcionário',
            dataIndex: 'funcionario.nome',
            sorter: (a, b) => this.compareByAlph(a.funcionario.nome, b.funcionario.nome)
        }]

        return(
            <Modal
                title="Estorno de Produção"
                visible={this.props.showModalEstornoProducao}
                onCancel={this.closeModal}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}><Icon type="close" /> Fechar</Button>,
                ]}
                width={1200}
            >
                <Row>
                    <Col span={24} id="colEstornoProducao" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScanEstorno}
                            />
                            :null
                        }
                        {
                            this.state.idProducao === null ?
                            <Form layout="vertical">
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Form.Item label="Produção">
                                            {getFieldDecorator('producao', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione a produção',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colEstornoProducao')}
                                                    allowClear={true}
                                                    onChange={this.producaoChange}
                                                >
                                                    {
                                                        this.state.producoesOptions.map((option) => {
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
                                        <Button className="buttonGreen" key="submit" onClick={() => this.producaoSelecionada()}><Icon type="check" /> Selecionar</Button>
                                    </Col>
                                </Row>
                            </Form>
                            :
                            <Row>
                                <Col span={24}>
                                    <span className="bold">Produção: {this.state.nomeProducao}</span>
                                    <span className="bold" onClick={this.alterarProducao} style={{marginLeft: 10, cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>Alterar</span>
                                </Col>
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(EstornoProducao)))