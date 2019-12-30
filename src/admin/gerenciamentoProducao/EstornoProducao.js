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
            mostrar: false,
            idProducao: null,
            idSetor: null,
            idSubproduto: null,
            nomeProducao: null,
            producoesOptions: [],
            setoresOptions: [],
            subprodutosOptions: [],
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

    requestGetCodigosDeBarrasEstornados = (idProducao, idSetor, idSubproduto) => {
        axios
        .get(this.props.backEndPoint + '/getCodigosDeBarrasEstornados?idProducao='+idProducao+'&idSetor='+idSetor+'&idSubproduto='+idSubproduto)
        .then(res => {
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
                this.requestGetCodigosDeBarrasEstornados(this.state.idProducao, this.state.idSetor, this.state.idSubproduto)
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
                this.requestGetCodigosDeBarrasEstornados(values.producao, values.setor, values.subproduto)
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
        this.props.showModalEstornoProducaoF(false)
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.showModalEstornoProducao && nextProps.showModalEstornoProducao){
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
                                                    getPopupContainer={() => document.getElementById('colEstornoProducao')}
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
                                                    getPopupContainer={() => document.getElementById('colEstornoProducao')}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(EstornoProducao)))