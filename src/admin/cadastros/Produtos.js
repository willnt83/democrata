import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, Divider } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

let id = 0

class Produtos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Produtos')
    }

    state = {
        produtoId: null,
        tableData: [],
        showProdutosModal: false,
        tableLoading: false,
        buttonSalvarProduto: false,
        coresOptions: [],
        linhasDeProducaoOptions: [],
        coresSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        linhasDeProducaoSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        dynamicFieldsRendered: false,
        setores: [],
        conjuntos: [],
        setoresFields: 'none',
        nomeLinhaDeProducao: null,
        conjuntosOptions: []
    }

    requestGetProdutosFull = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getProdutosFull')
        .then(res => {
            if(res.data){
                var tableData = res.data.payload.map(produto => {
                    var ativo = produto.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: produto.id,
                        nome: produto.nome,
                        ativoDescription: ativo,
                        ativoValue: produto.ativo,
                        cor: produto.cor,
                        linhaDeProducao: produto.linhaDeProducao,
                        setores: produto.setores
                    })
                })
                this.setState({tableData})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    requestCreateUpdateProduto = (request) => {
        this.setState({buttonSalvarProduto: true})
        axios.post(this.props.backEndPoint + '/createUpdateProduto', request)
        .then(res => {
            if(res.data.success){
                this.showProdutosModal(false)
                this.requestGetProdutosFull()
                this.setState({buttonSalvarProduto: false})
            }
            else
                console.log('Não foi possível cadastrar / atualizar o produto')
            
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarProduto: false})
        })
    }
    
    requestGetSetoresPorLinhaDeProducao = (id) => {
        axios
        .get(this.props.backEndPoint + '/getSetoresPorLinhaDeProducao?id='+id)
        .then(res => {
            if(res.data){
                var setoresPorLinhadeProducao = res.data.payload
                var keys = setoresPorLinhadeProducao.setores.map((setor, index) => {
                    return(index)
                })

                this.props.form.setFieldsValue({
                    keys
                })

                this.setState({
                    nomeLinhaDeProducao: setoresPorLinhadeProducao.nome,
                    setores: setoresPorLinhadeProducao.setores,
                    dynamicFieldsRendered: true
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    loadCoresOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getCores?ativo=Y')
        .then(res => {
            if(res.data){
                var coresOptions = res.data.payload.map(cor => {
                    return({
                        value: cor.id,
                        description: cor.nome,
                    })
                })
                this.setState({
                    coresOptions,
                    coresSelectStatus: {
                        placeholder: 'Selecione a cor',
                        disabled: false
                    }
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    loadLinhasDeProducaoOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getLinhasDeProducao?ativo=Y')
        .then(res => {
            if(res.data){
                var linhasDeProducaoOptions = res.data.payload.map(linhaDeProducao => {
                    return({
                        value: linhaDeProducao.id,
                        description: linhaDeProducao.nome,
                    })
                })
                this.setState({
                    linhasDeProducaoOptions,
                    linhasDeProducaoSelectStatus: {
                        placeholder: 'Selecione a linha de produção',
                        disabled: false
                    }
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    loadConjuntosOptions = () => {
        axios
        .get(this.props.backEndPoint + '/getConjuntos?ativo=Y')
        .then(res => {
            console.log('response conjunto', res.data.payload)
            this.setState({
                conjuntosOptions: res.data.payload.map(conjunto => {
                    console.log('conjunto...', conjunto)
                    return({
                        value: conjunto.id,
                        description: conjunto.nome,
                        idSetor: conjunto.idSetor,
                        nomeSetor: conjunto.nomeSetor
                    })
                })
            })
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    showProdutosModal = (showProdutosModal) => {
        // Se estiver fechando
        if(!showProdutosModal){
            this.props.form.resetFields()
            this.setState({
                produtoId: null,
                setoresFields: 'none'
            })
            id = 0
            this.props.form.setFieldsValue({
                keys: []
            })
        }
        this.setState({showProdutosModal})
    }

    loadProdutosModal = (record) => {
        this.loadCoresOptions()
        this.loadLinhasDeProducaoOptions()
        this.loadConjuntosOptions()

        if(typeof(record) !== "undefined") {
            var keys = record.setores.map((subproduto, index) => {
                return(index)
            })

            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue,
                cor: record.cor.id,
                linhaDeProducao: record.linhaDeProducao.id,
                keys
            })

            var conjuntos = record.setores.map(setor => {
                return({
                    id: setor.conjunto.id,
                    nome: setor.conjunto.nome
                })
            })

            this.setState({
                produtoId: record.key,
                dynamicFieldsRendered: true,
                setores: record.setores,
                conjuntos
            })
        }

        this.showProdutosModal(true)
    }
    
    handleDeleteProduto = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteProduto?id='+id)
        .then(res => {
            this.requestGetProdutosFull()
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.produtoId ? this.state.produtoId : null
                var request = {
                    id: id,
                    nome: values.nome,
                    cor: values.cor,
                    ativo: values.ativo,
                    idLinhaDeProducao: values.linhaDeProducao,
                    setoresConjuntos: this.state.setores.map((setor, index) => {
                        return({
                            id: setor.id,
                            nome: setor.nome,
                            ordem: setor.ordem,
                            idConjunto: values.conjuntos[index]
                        })
                    })
                }
                console.log('request', request)

                this.requestCreateUpdateProduto(request)

            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    handleLinhaDeProducaoChange = (value) => {
        this.requestGetSetoresPorLinhaDeProducao(value)
        this.setState({setoresFields: 'block'})
    }

    addComposicaoRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)

        form.setFieldsValue({
            keys: nextKeys,
        })
    }

    removeComposicaoRow = (k) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        // We need at least one passenger
        if (keys.length === 1){
            return
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    componentWillMount(){
        this.requestGetProdutosFull()
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){
            var conjuntos = this.state.conjuntos.map(conjunto => {
                return(conjunto.id)
            })

            console.log('conjuntos', conjuntos)
            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.conjuntos.length)

            this.props.form.setFieldsValue({
                conjuntos
            })

            this.setState({
                setoresFields: 'block',
                dynamicFieldsRendered: false
            })
        }
    }

    render(){
        console.log('this.state.conjuntoOptions', this.state.conjuntoOptions)
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        if(this.state.setores.length > 0){
            var composicaoItems = keys.map((k, index) => (
                <Row key={k} gutter={5}>
                    <Col span={4} align="middle">
                        {this.state.setores[index].ordem}
                    </Col>
                    <Col span={8}>
                        {this.state.setores[index].nome}
                    </Col>
                    <Col span={12}>
                        <Form.Item>
                            {getFieldDecorator(`conjuntos[${k}]`)(
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Informe o conjunto"
                                >
                                    {
                                        this.state.conjuntosOptions
                                        .filter(option => {
                                            return (option.idSetor === this.state.setores[index].id)
                                        })
                                        .map((option) => {
                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                </Row>
            ))
        }

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Descrição',
            dataIndex: 'nome',
            sorter: (a, b) => this.compareByAlph(a.nome, b.nome)
        },
        {
            title: 'Cor',
            dataIndex: 'cor.nome',
            sorter: (a, b) => this.compareByAlph(a.cor.nome, b.cor.nome)
        },
        {
            title: 'Linha de Produção',
            dataIndex: 'linhaDeProducao.nome',
            sorter: (a, b) => this.compareByAlph(a.linhaDeProducao.nome, b.linhaDeProducao.nome)
        },
        {
            title: 'Ativo',
            dataIndex: 'ativoDescription',
            align: 'center',
            width: 150,
            filters: [{
                text: 'Ativo',
                value: 'Ativo',
            }, {
                text: 'Inativo',
                value: 'Inativo',
            }],
            filterMultiple: false,
            onFilter: (value, record) => record.ativoDescription.indexOf(value) === 0
        },
        {
            title: 'Operação',
            colSpan: 2,
            dataIndex: 'operacao',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadProdutosModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteProduto(record.key)}>
                            <a href="/admin/cadastros/produtos" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                        </Popconfirm>
                    </React.Fragment>
                )
            }
        }]

        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >

                <Row style={{ marginBottom: 16 }}>
                    <Col span={24} align="end">
                        <Tooltip title="Cadastrar um novo produto?" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadProdutosModal()}><Icon type="plus" /> Novo Produto</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Produtos"
                    visible={this.state.showProdutosModal}
                    onCancel={() => this.showProdutosModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showProdutosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarProduto} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Form.Item label="Nome">
                            {getFieldDecorator('nome', {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o nome do produto',
                                    }
                                ]
                            })(
                                <Input
                                    id="nome"
                                    placeholder="Digite o nome do produto"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="Cor">
                            {getFieldDecorator('cor', {
                                rules: [{
                                    required: true, message: "Informe a cor"
                                }],
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder={this.state.coresSelectStatus.placeholder}
                                    disabled={this.state.coresSelectStatus.disabled}
                                >
                                    {
                                        this.state.coresOptions.map((option) => {
                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="Ativo">
                            {getFieldDecorator('ativo', {
                                rules: [{
                                    required: true, message: "Campo obrigatório"
                                }],
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Selecione"
                                >
                                    {
                                        ativoOptions.map((option) => {
                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="Linha de Produção">
                            {getFieldDecorator('linhaDeProducao', {
                                rules: [
                                    {
                                        required: true, message: 'Informe a linha de produção',
                                    }
                                ]
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder={this.state.linhasDeProducaoSelectStatus.placeholder}
                                    disabled={this.state.linhasDeProducaoSelectStatus.disabled}
                                    onChange={this.handleLinhaDeProducaoChange}
                                >
                                    {
                                        this.state.linhasDeProducaoOptions.map((option) => {
                                            return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Row style={{display: this.state.setoresFields}}>
                            <Col span={24}>
                                <Divider />
                                <h4>Linha de Produção</h4>
                                <Row gutter={5} className="gridTitle">
                                    <Col span={4} align="middle">Ordem</Col>
                                    <Col span={8}>Setor</Col>
                                    <Col span={12}>Conjunto</Col>
                                </Row>
                                {composicaoItems}
                            </Col>
                        </Row>
                    </Form>
                </Modal>
          </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)((Form.create()(Produtos)))