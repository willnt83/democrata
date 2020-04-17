import React, { Component } from 'react'
import { Row, Col, Form, Modal, Button, Divider, Table, Input, Select, Icon, Popconfirm } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'
//import { throwStatement } from '@babel/types'

class ModalArmazenagem extends Component{
    constructor(props){
        super(props)
        this.state = {
            idArmazenagem: null,
            barcodeReader: false,
            lancamentoManual: false,
            tableData: [],
            almoxarifadoSelecionadoDesc: null,
            posicaoSelecionadaDesc: null,
            endereco: null,
            almoxarifadosOptions: [],
            posicoesOptions: [],
            buttonArmazenar: false,
            tempCodigo: null,
            processando: false
        }
        this.handleScan = this.handleScan.bind(this)
    }


    handleScan = (data) => {
        if(!this.state.processando){
            var dataArr = data.split('-')
            var hit = false
            this.state.tableData.forEach(reg => {
                if(reg.codigo === data)
                    hit = true
            })
            if(hit)
                this.props.showNotification('Produto já lançado', false)
            else if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6)
                this.props.showNotification('Código de barras inválido para produto finalizado', false)
            else{
                this.setState({tempCodigo: data, processando: true})
                this.requestGetCodigoDeBarrasInfo(data)
            }
        }
        else
            this.props.showNotification('Aguarde a finalização do lançamento anterior...', false)
    }

    handleError(err){
        console.error(err)
    }

    requestGetAlmoxarifados = () => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getAlmoxarifados')
        .then(res => {
            if(res.data.payload){
                this.setState({almoxarifadosOptions: res.data.payload})
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleChangeAlmoxarifado = (value, e) => {
        // Reset na posição
        this.setState({
            almoxarifadoSelecionadoDesc: e.props.children,
            posicoesOptions: []
        })
        this.props.form.setFieldsValue({posicao: null})
        this.requestGetPosicaoArmazem(value)
    }

    handleChangePosicao = (value, e) => {
        this.setState({
            posicaoSelecionadaDesc: e.props.children
        })
    }

    handleEnderecoSelecionado = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            this.setState({
                endereco: {
                    idAlmoxarifado: values.almoxarifado,
                    idPosicao: values.posicao
                }
            })
        })
    }

    alterarEndereco = () => {
        this.setState({
            almoxarifadoSelecionadoDesc: null,
            posicaoSelecionadaDesc: null,
            endereco: null
        })
    }

    requestGetPosicaoArmazem = (idAlmoxarifado) => {
        this.setState({tableLoading: true})
        axios.get(this.props.backEndPoint + '/wms-produtos/getPosicoes?id_almoxarifado='+idAlmoxarifado)
        .then(res => {
            if(res.data.payload){
                this.setState({posicoesOptions: res.data.payload})
            }
            else{
                console.log('Nenhum registro encontrado')
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
                var hit = false
                this.state.tableData.forEach(reg => {
                    if(reg.codigo === values.produtoBarcode)
                        hit = true
                })
                if(hit)
                    this.props.showNotification('Produto já lançado', false)
                else if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6)
                    this.props.showNotification('Código de barras inválido para produto finalizado', false)
                else{
                    this.setState({tempCodigo: values.produtoBarcode, buttonArmazenar: true})
                    this.requestGetCodigoDeBarrasInfo(values.produtoBarcode)
                }
            }
        })
    }

    requestGetArmazenagemProdutos = (idArmazenagem) => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getArmazenagemProdutos?id_armazenagem='+idArmazenagem)
        .then(res => {
            var tableData = res.data.payload.map(produto => {
                var estoque = produto.estoque === 'Y' ? 'Sim' : 'Não'
                return({
                    id: produto.id,
                    idArmazenagem: produto.idArmazenagem,
                    codigo: produto.codigo,
                    estoque: estoque,
                    produto: {
                        id: produto.produto.id,
                        nome: produto.produto.nome,
                        cor: produto.produto.cor
                    },
                    almoxarifado: {
                        id: produto.almoxarifado.id,
                        nome: produto.almoxarifado.nome
                    },
                    posicao: {
                        id: produto.posicao.id,
                        nome: produto.posicao.nome
                    }
                })
            })
            this.setState({tableData})
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetCodigoDeBarrasInfo = (codigo) => {
        axios.get(this.props.backEndPoint + '/getCodigoDeBarrasInfo?codigo='+codigo)
        .then(res => {
            this.buildRequest()
        })
        .catch(error => {
            console.log(error)
        })
    }

    buildRequest = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var codigoArr = this.state.tempCodigo.split('-')
                var idProduto = parseInt(codigoArr[1])
                var request = {
                    idArmazenagem: this.state.idArmazenagem,
                    idUsuario: this.props.session.usuario.id,
                    codigo: this.state.tempCodigo,
                    idProduto: idProduto,
                    idAlmoxarifado: this.state.endereco.idAlmoxarifado,
                    idPosicao: this.state.endereco.idPosicao
                }
                this.requestLancamentoArmazenagemProdutos(request)
            }
        })
    }

    requestLancamentoArmazenagemProdutos = (request) => {
        axios.post(this.props.backEndPoint + '/wms-produtos/lancamentoArmazenagemProdutos', request)
        .then(res => {
            if(res.data.success){
                this.props.showNotification(res.data.msg, res.data.success)
                this.setState({idArmazenagem: res.data.payload.idArmazenagem, buttonArmazenar: false, tempCodigo: null, processando: false})
                this.props.form.setFieldsValue({produtoBarcode: null})
                this.requestGetArmazenagemProdutos(res.data.payload.idArmazenagem)
            }
            else{
                this.props.showNotification(res.data.msg, res.data.success)
                this.setState({buttonArmazenar: false, processando: false})
            }
        })
        .catch(error => {
            this.setState({buttonArmazenar: false})
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
            idArmazenagem: null,
            barcodeReader: false,
            lancamentoManual: false,
            tableData: [],
            endereco: null

        })
        this.props.showModalArmazenagemF(false)
    }

    estornarArmazenagemProduto = (idArmazenagemProduto) => {
        var request = {
            idUsuario: this.props.session.usuario.id,
            idArmazenagemProduto: idArmazenagemProduto
        }

        axios.post(this.props.backEndPoint + '/wms-produtos/estornarArmazenagemProduto', request)
        .then(res => {
            this.props.showNotification(res.data.msg, res.data.success)
            this.requestGetArmazenagemProdutos(this.props.idArmazenagem)

        })
        .catch(error => {
            console.log(error)
        })
    }

    componentWillReceiveProps(nextProps){
        // Modal aberto
        if(!this.props.showModalArmazenagem && nextProps.showModalArmazenagem){
            this.setState({idArmazenagem: this.props.idArmazenagem, barcodeReader: true})
        }

        if(this.props.idArmazenagem !== nextProps.idArmazenagem){
            if(nextProps.idArmazenagem){
                this.setState({idArmazenagem: nextProps.idArmazenagem})
                this.requestGetArmazenagemProdutos(nextProps.idArmazenagem)
            }
        }
    }

    componentDidMount(){
        this.requestGetAlmoxarifados()
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const columns = [
            {
                title: 'Produto',
                dataIndex: 'produto.nome',
                sorter: (a, b) => this.compareByAlph(a.produto.nome, b.produto.nome)
            },
            {
                title: 'Almoxarifado',
                dataIndex: 'almoxarifado.nome',
                sorter: (a, b) => this.compareByAlph(a.almoxarifado.nome, b.almoxarifado.nome)
            },
            {
                title: 'Posicão',
                dataIndex: 'posicao.nome',
                sorter: (a, b) => this.compareByAlph(a.posicao.nome, b.posicao.nome)
            },
            {
                title: 'Estoque',
                dataIndex: 'estoque',
                align: 'center',
                sorter: (a, b) => this.compareByAlph(a.estoque, b.estoque)
            },
            {
                colSpan: 2,
                dataIndex: 'operacao',
                align: 'center',
                width: 150,
                render: (text, record) => {
                    return(
                        <Popconfirm title="Realmente deseja estornar a armazenagem deste produto?" onConfirm={() => this.estornarArmazenagemProduto(record.id)}>
                            <Icon type="undo" style={{color: 'red'}} />
                        </Popconfirm>
                    )
                }
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
                <Button onClick={this.lancarManual} loading={this.state.buttonArmazenar}>Armazenar</Button>
            </React.Fragment>
        return(
            <Modal
                title="Armazenagem de Produtos Finalizados"
                visible={this.props.showModalArmazenagem}
                onCancel={this.closeModal}
                maskClosable={false}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}><Icon type="close" /> Fechar</Button>
                ]}
            >
                <Row>
                    <Col span={24} id="colArmazenagemDeProdutosFinalizados" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScan}
                            />
                            :null
                        }

                        <Form layout="vertical">
                            {
                                this.state.endereco === null ?
                                <React.Fragment>
                                    <Form.Item label="Almoxarifado">
                                        {getFieldDecorator('almoxarifado', {
                                            rules: [
                                                {
                                                    required: true, message: 'Por favor selecione o almoxarifado',
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                                style={{ width: '100%' }}
                                                placeholder="Selecione"
                                                getPopupContainer={() => document.getElementById('colArmazenagemDeProdutosFinalizados')}
                                                allowClear={true}
                                                onChange={(value, e) => this.handleChangeAlmoxarifado(value, e)}
                                            >
                                                {
                                                    this.state.almoxarifadosOptions.map((option) => {
                                                        return (<Select.Option key={option.id} value={option.id}>{option.nome}</Select.Option>)
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>

                                    <Form.Item label="Posição">
                                        {getFieldDecorator('posicao', {
                                            rules: [
                                                {
                                                    required: true, message: 'Por favor selecione a posição',
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                                style={{ width: '100%' }}
                                                placeholder="Selecione"
                                                getPopupContainer={() => document.getElementById('colArmazenagemDeProdutosFinalizados')}
                                                allowClear={true}
                                                onChange={this.handleChangePosicao}
                                            >
                                                {
                                                    this.state.posicoesOptions.map((option) => {
                                                        return (<Select.Option key={option.id} value={option.id}>{option.posicao}</Select.Option>)
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>

                                    <Button className="buttonGreen" onClick={this.handleEnderecoSelecionado}><Icon type="check" /> Selecionar</Button>
                                </React.Fragment>
                                :
                                <React.Fragment>
                                    <Row style={{marginBottom: 30}}>
                                        <Col span={18}>
                                            <Row>
                                                <Col span={24}><span className="bold">Almoxarifado:</span> {this.state.almoxarifadoSelecionadoDesc}</Col>
                                                <Col span={24}><span className="bold">Posição:</span> {this.state.posicaoSelecionadaDesc}</Col>
                                            </Row>
                                        </Col>
                                        <Col onClick={this.alterarEndereco} span={6} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                                            Alterar endereço
                                        </Col>
                                    </Row>
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
                                    {/*
                                    <Button className="buttonGreen" loading={this.state.buttonArmazenar} onClick={this.buildRequest}><Icon type="check" /> Armazenar</Button>
                                    <Button className="buttonRed" onClick={this.alterarProduto} style={{marginLeft: 20}}><Icon type="undo" /> Alterar Produto</Button>
                                    */}
                                </React.Fragment>
                            }
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(ModalArmazenagem)))