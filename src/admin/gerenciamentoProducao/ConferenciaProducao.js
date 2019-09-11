import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Icon, Button, Divider, Table } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

class ConferenciaProducao extends Component{
    constructor(props){
        super(props)
        this.state = {
            mostrar: false,
            producoesOptions: [],
            setoresOptions: [],
            subprodutosOptions: [],
            idProducao: null,
            idSetor: null,
            idSubproduto: null,
            nomeProducao: null,
            tableData: [],
            barcodeReader: false
        }
        this.handleScanConferencia = this.handleScanConferencia.bind(this)
    }

    handleScanConferencia(data){
        if(this.state.idFuncionario !== null){
            var request = {
                idProducao: this.state.idProducao,
                barcode: data
            }
            this.requestConferenciaProducao(request)
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

    requestGetSetoresTitulo = () => {
        axios
        .get(this.props.backEndPoint + '/getSetoresTitulo')
        .then(res => {
            this.setState({
                setoresOptions: res.data.payload.map(setor => {
                    return({
                        value: setor.id,
                        description: setor.id+' - '+setor.nome
                    })
                })
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetCodigosDeBarrasProducao = (idProducao, idSetor, idSubproduto) => {
        axios
        .get(this.props.backEndPoint + '/getCodigosDeBarrasProducao?idProducao='+idProducao+'&idSetor='+idSetor+'&idSubproduto='+idSubproduto)
        .then(res => {
            this.setState({
                tableData: res.data.payload
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
                var tableData = this.state.tableData
                var i = null
                tableData.forEach((row, index) => {
                    if(parseInt(row.id) === parseInt(res.data.payload.id))
                        i = index
                })
                tableData[i].codigoDeBarras.conferido = 'Y'
                this.setState({tableData})

                this.props.showNotification(res.data.msg, res.data.success)
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
        this.setState({
            idProducao: value,
            nomeProducao: e.props.children
        })
    }

    setorChange = (value) => {
        console.log('setor', value)
        this.setState({
            idSetor: value
        })

        axios
        .get(this.props.backEndPoint + '/getSubprodutosPorProducaoSetor?idProducao='+this.state.idProducao+'&idSetor='+value)
        .then(res => {
            console.log('res.data.payload', res.data.payload)
            this.setState({
                subprodutosOptions: res.data.payload.map(subproduto => {
                    return({
                        value: subproduto.id,
                        description: subproduto.nome
                    })
                })
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    selecionada = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.setState({mostrar: true})
                this.requestGetCodigosDeBarrasProducao(values.producao, values.setor, values.subproduto)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    alterarProducao = () => {
        this.setState({
            mostrar: false,
            idProducao: null,
            nomeProducao: null,
            tableData: []
        })
    }

    closeModal = () => {
        this.setState({
            mostrar: false,
            barcodeReader: false,
            idProducao: null,
            nomeProducao: null,
            tableData: []
        })
        this.props.showModalConferenciaProducaoF(false)
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalConferenciaProducao && nextProps.showModalConferenciaProducao){
            this.requestGetProducoesTitulo()
            this.requestGetSetoresTitulo()
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
            title: 'Lançado',
            dataIndex: 'lancado',
            align: 'center',
            render: (text, record) => {
                return(
                    record.codigoDeBarras.lancado === 'Y' ?
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
                    record.codigoDeBarras.conferido === 'Y' ?
                    <Icon type="check" style={{color: '#13a54b'}} />
                    :
                    <Icon type="close" style={{color: '#ea2c2c'}} />
                )
            }
        }]

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
                        {
                            !this.state.mostrar ?
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
                                                    showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colConferenciaProducao')}
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
                                        <Form.Item label="Setor">
                                            {getFieldDecorator('setor', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione o setor',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colConferenciaProducao')}
                                                    allowClear={true}
                                                    onChange={this.setorChange}
                                                >
                                                    {
                                                        this.state.setoresOptions.map((option) => {
                                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item label="Subproduto">
                                            {getFieldDecorator('subproduto', {
                                                rules: [
                                                    {
                                                        required: true, message: 'Por favor selecione o subproduto',
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="Selecione"
                                                    getPopupContainer={() => document.getElementById('colConferenciaProducao')}
                                                    allowClear={true}
                                                >
                                                    {
                                                        this.state.subprodutosOptions.map((option) => {
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
                                        <Button className="buttonGreen" key="submit" onClick={() => this.selecionada()}><Icon type="check" /> Selecionar</Button>
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(ConferenciaProducao)))