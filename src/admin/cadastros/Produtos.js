import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, notification, Tabs } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import _ from 'lodash';

import NumericInput from '../shared/NumericInput';

import "../static/form.css"
import "../static/divTable.css"

const { Content } = Layout

const { TabPane } = Tabs;

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class Produtos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Produtos')
    }

    state = {
        produtoId: null,
        tableData: [],
        tabId: "1",
        showProdutosModal: false,
        tableLoading: false,
        buttonSalvarProduto: false,
        coresOptions: [],
        linhasDeProducaoOptions: [],
        insumosOptions: [],
        medidaValues: [],
        qtdeValues: [],        
        coresSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        linhasDeProducaoSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        insumosSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },        
        dynamicFieldsConjuntosRendered: false,
        dynamicFieldsInsumos: {
            loading: true,
            rendered: true
        },
        setores: [],
        conjuntos: [],
        insumos: [],
        setoresFields: 'none',
        nomeLinhaDeProducao: null,
        conjuntosOptions: []        
    }
    
    showNotification = (msg, success) => {
        var type = null
        var style = null
        if(success){
            type = 'check-circle'
            style = {color: '#4ac955', fontWeight: '800'}
        }
        else {
            type = 'exclamation-circle'
            style = {color: '#f5222d', fontWeight: '800'}
        }
        const args = {
            message: msg,
            icon:  <Icon type={type} style={style} />,
            duration: 3
        }
        notification.open(args)
    }

    changeTab = (key) => {
        this.setState({tabId: key})
    }

    insertInsumoValues = (index, object) => {
        let insumos = this.state.insumos
        if(typeof object.qtd === 'undefined' || !object.qtd) {
            object.qtd = 0
        }
        insumos[index] = object
        this.setState({
            insumos
        })        
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
                        codigo: produto.codigo,
                        sku: produto.sku,
                        ativoDescription: ativo,
                        ativoValue: produto.ativo,
                        cor: produto.cor,
                        maoDeObra: produto.maoDeObra,
                        materiaPrima: produto.materiaPrima,
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
            }
            this.showNotification(res.data.msg, res.data.success)
            this.setState({buttonSalvarProduto: false})
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
                    dynamicFieldsConjuntosRendered: true
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
            this.setState({
                conjuntosOptions: res.data.payload.map(conjunto => {
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

    loadInsumosOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getInsumos?ativo=Y')
        .then(res => {
            if(res.data){
                let insumosOptions = _.orderBy(res.data.payload.map(insumo => {
                    return({
                        id: insumo.id,
                        name: insumo.ins + ' | ' + insumo.nome,
                        medida: insumo.unidadeUnidadeMedida
                    })
                }),'name', 'asc')
                .reduce((finalObj, insumo, index) => {                    
                    finalObj[insumo.id] = insumo
                    return finalObj
                }, [])
                this.setState({                  
                    insumosOptions: insumosOptions,
                    insumosSelectStatus: {
                        placeholder: 'Selecione o insumo',
                        disabled: false
                    }
                })
            }
            else{
                this.showNotification('Nenhum registro encontrado', false)
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })        
    }

    loadInsumosProduto = (produtoId) => {
        this.setState({
            dynamicFieldsInsumos: {
                loading: false,
                rendered: true
            }
        })
        axios
        .get(this.props.backEndPoint + '/getProdutoInsumos?id_produto='+produtoId)
        .then(res => {
            if(res.data.payload && res.data.payload.length > 0) {
                var insumos = res.data.payload.map((insumo, index) => {
                    return {
                        id: insumo.id,
                        qtd: insumo.qtd,
                        medida: insumo.unidade.medida
                    }
                })
                var keysInsumos = insumos.map((insumo, index) => {
                    return(index)
                })
                this.props.form.setFieldsValue({
                    keysInsumos
                })
                this.setState({
                    insumos: insumos
                })
            } else {
                this.setState({
                    insumos: []
                })
            }
        })
        .catch(error => {
            this.setState({insumos: []})
        })
        .finally(()=>{
            this.setState({
                dynamicFieldsInsumos: {
                    loading: true,
                    rendered: false
                }
            })
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
            this.props.form.setFieldsValue({
                keys: [],
                keysInsumos: []
            })
        } else {
            this.changeTab("1")
        }
        this.setState({showProdutosModal})
    }    

    loadProdutosModal = (record) => {
        this.loadCoresOptions()
        this.loadLinhasDeProducaoOptions()
        this.loadConjuntosOptions()
        this.loadInsumosOptions()
        
        if(typeof(record) !== "undefined") {
            this.loadInsumosProduto(record.key)

            var keys = record.setores.map((subproduto, index) => {
                return(index)
            })

            // Edit
            this.props.form.setFieldsValue({
                nome: record.nome,
                codigo: record.codigo,
                sku: record.sku,
                ativo: record.ativoValue,
                cor: record.cor.id,
                maoDeObra: record.maoDeObra,
                materiaPrima: record.materiaPrima,
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
                dynamicFieldsConjuntosRendered: true,
                setores: record.setores,
                conjuntos
            })
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
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

    handleOnChangeInsumo = (value, event, index) => {
        let qtd = this.props.form.getFieldValue( `quantidades[${index}]`)
        this.insertInsumoValues(index, {
            id: index,
            qtd: !qtd || qtd === '' || typeof qtd === 'undefined' ? 0 : qtd,
            medida: this.state.insumosOptions[value].medida                      
        })        
    }

    handleInsumoValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/insumos|\[|\]/gi,'')
        key     = key && !isNaN(key) ? parseInt(key) : null
        if(key != null && value && !isNaN(value) && typeof value !== 'undefined' ) {
            let idInsumo = parseInt(value)
            if(idInsumo > 0) {
                const keys  = this.props.form.getFieldValue('keysInsumos')
                keys.forEach(row => {
                    let idInsumoRow = this.props.form.getFieldValue(`insumos[${row}]`)
                    if(row !== key && idInsumoRow === idInsumo) {
                        callback('Insumo já selecionado');
                    }
                })
            }
        }
        callback()
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {            
            if (!err){
                let id = this.state.produtoId ? this.state.produtoId : null
                let request = {
                    id: id,
                    nome: values.nome,
                    codigo: values.codigo,
                    sku: values.sku,
                    cor: values.cor,
                    maoDeObra: values.maoDeObra,
                    materiaPrima: values.materiaPrima,
                    ativo: values.ativo,
                    idLinhaDeProducao: values.linhaDeProducao,
                    setoresConjuntos: this.state.setores.map((setor, index) => {
                        return({
                            id: setor.id,
                            nome: setor.nome,
                            ordem: setor.ordem,
                            idConjunto: values.conjuntos[index]
                        })
                    }),
                    insumos: values.insumos.map((insumo, index) => {
                        return {
                            id: insumo,
                            qtd: values.quantidades[index]
                        }
                    })
                }
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
        const keys = form.getFieldValue('keysInsumos')
        let maxInsumo = this.state.insumos.length - 1;
        let keysInsumos = keys.concat((maxInsumo + 1))
        form.setFieldsValue({
            keysInsumos
        })
        this.insertInsumoValues((maxInsumo + 1), {
            id: 0,
            qtd: 0,
            medida: ''                        
        })
    }

    removeComposicaoRow = (k) => {
        const { form } = this.props
        const keys = form.getFieldValue('keysInsumos')
        let keysInsumos = keys.filter(key => key !== k)
        form.setFieldsValue({
            keysInsumos
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
        if(this.state.dynamicFieldsConjuntosRendered){
            var conjuntos = this.state.conjuntos.map(conjunto => {
                return(conjunto.id)
            })

            this.props.form.setFieldsValue({
                conjuntos,
            })

            this.setState({
                setoresFields: 'block',
                dynamicFieldsConjuntosRendered: false
            })
        }

        if(this.state.dynamicFieldsInsumos.loading && !this.state.dynamicFieldsInsumos.rendered){
            let initialObj = { insumos: [], quantidades: [] }
            let objInsumos = this.state.insumos.reduce((finalObj, insumo, index) => {                
                let thisObj = finalObj ? finalObj : initialObj
                thisObj.insumos.push(insumo.id) 
                thisObj.quantidades.push(insumo.qtd)
                return {
                    insumos: thisObj.insumos,
                    quantidades: thisObj.quantidades
                }
            }, initialObj)

            let insumos = objInsumos && objInsumos.insumos ? objInsumos.insumos : []
            let quantidades = objInsumos && objInsumos.quantidades ? objInsumos.quantidades : []
            this.props.form.setFieldsValue({
                insumos,
                quantidades
            })

            this.setState({
                dynamicFieldsInsumos: {
                    loading: true,
                    rendered: true
                }
            })
        }
    }
    
    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form

        // Linhas de Produção
        let linhasItens = null
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')
        if(this.state.setores.length > 0){
            linhasItens = keys.map((key, index) => (
                <Row key={`key_${key}`} className="div-table-body">
                    <Col span={3} id={`colInsumo_${key}`} className="div-table-body-cell">                        
                        {this.state.setores[index].ordem}
                    </Col>
                    <Col span={5} className="div-table-body-cell">
                        {this.state.setores[index].nome}
                    </Col>
                    <Col span={16} id={`conjunto_${key}`} className="div-table-body-cell">
                        <Form.Item style={{margin: '0px'}}>
                            {getFieldDecorator(`conjuntos[${key}]`, {
                                rules: [
                                    {
                                        required: true, message: 'Por favor informe o conjunto',
                                    }
                                ]
                            })(
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    placeholder="Informe o conjunto"
                                    getPopupContainer={() => document.getElementById(`colInsumo_${key}`)}
                                    allowClear={true}
                                >
                                    {
                                        this.state.conjuntosOptions
                                        .filter(option => {
                                            return (option.idSetor === parseInt(this.state.setores[key].id))
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

        // Insumos
        getFieldDecorator('keysInsumos', { initialValue: [] })
        const keysInsumos = getFieldValue('keysInsumos')
        let insumosItens = keysInsumos.map((key, index) => (
            <Row key={`keyInsumos_${key}`} className="div-table-body">
                <Col span={16} id={`colInsumo_${key}`} className="div-table-body-cell">                        
                    <Form.Item style={{margin: '0px'}}>
                        {getFieldDecorator(`insumos[${key}]`, {
                            rules: [
                                {
                                    required: true, message: "Informe o insumo"
                                },
                                {
                                    validator: this.handleInsumoValidator
                                }
                            ],
                        })(
                            <Select
                                showSearch                                                    
                                style={{ width: '100%' }}
                                optionFilterProp="children"
                                placeholder={this.state.insumosSelectStatus.placeholder}
                                disabled={this.state.insumosSelectStatus.disabled}
                                getPopupContainer={() => document.getElementById(`colInsumo_${key}`)}
                                onSelect={(value, event) => this.handleOnChangeInsumo(value, event, key)}
                                allowClear={true}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }                                                                                               
                            >        
                                {
                                    this.state.insumosOptions.map((option) => {
                                        return (
                                            <Select.Option key={option.id} value={option.id}>
                                                {option.name}
                                            </Select.Option>
                                        )
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={4} className="div-table-body-cell">
                    {getFieldDecorator(`quantidades[${key}]`, {
                        rules: [
                            {
                                required: true, message: "Informe a quantidade"
                            }                                       
                        ]
                    })(
                        <NumericInput
                            id="quantidade"
                            placeholder="Quantidade"
                            maxLength={10}
                        />
                    )}
                </Col>            
                <Col span={3} className="div-table-body-cell">
                    <Col span={24}>
                    {
                        this.state.insumos && this.state.insumos.length > 0 && this.state.insumos[key]
                        ? this.state.insumos[key].medida
                        : null
                    }
                    </Col>
                </Col>
                <Col span={1} id={`colDelete_${key}`} className="div-table-body-cell">
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        title="Deseja excluir o insumo?"
                        disabled={keys.length === 1}
                        onClick={() => this.removeComposicaoRow(key)}
                    />
                </Col>                     
            </Row>
        ))

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            sorter: (a, b) => a.sku - b.sku,
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
            title: 'Mão de Obra',
            dataIndex: 'maoDeObra',
            sorter: (a, b) => this.compareByAlph(a.maoDeObra, b.maoDeObra)
        },
        {
            title: 'Matéria Prima',
            dataIndex: 'materiaPrima',
            sorter: (a, b) => this.compareByAlph(a.materiaPrima, b.materiaPrima)
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
                    maskClosable={false}
                    footer={[
                        <Button key="back" onClick={() => this.showProdutosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarProduto} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                    width={900}
                >
                    <Form layout="vertical">
                        <Tabs defaultActiveKey="1" onChange={this.changeTab} activeKey={this.state.tabId} type="card">
                            <TabPane tab="Dados Produtos" key="1">
                                <div style={{minHeight: '380px'}}>
                                    <Row>
                                        <Col span={16} id="colNomeProduto" style={{position: 'relative', paddingRight: '5px'}}>
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
                                        </Col>
                                        <Col span={4} id="colVolume" style={{position: 'relative', paddingRight: '5px'}}>
                                            <Form.Item label="Volume">
                                                {getFieldDecorator('volume')(
                                                    <NumericInput
                                                        justInteger="true"
                                                        id="volume"
                                                        placeholder="Volume"
                                                        maxLength={25}
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>                                        
                                        <Col span={4} id="colAtivoProduto" style={{position: 'relative'}}>
                                            <Form.Item label="Ativo">
                                                {getFieldDecorator('ativo', {
                                                    rules: [{
                                                        required: true, message: "Campo obrigatório"
                                                    }],
                                                })(
                                                    <Select
                                                        showSearch
                                                        optionFilterProp="children"
                                                        style={{ width: '100%' }}
                                                        placeholder="Selecione"
                                                        getPopupContainer={() => document.getElementById('colAtivoProduto')}
                                                        allowClear={true}
                                                    >
                                                        {
                                                            ativoOptions.map((option) => {
                                                                return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                            })
                                                        }
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>                                    
                                    </Row>
                                    <Row>
                                        <Col span={12} id="colCodigoProduto" style={{position: 'relative', paddingRight: '5px'}}>
                                            <Form.Item label="Código">
                                                {getFieldDecorator('codigo', {
                                                    rules: [
                                                        {
                                                            required: true, message: 'Por favor informe o código do produto',
                                                        }
                                                    ]
                                                })(
                                                    <Input
                                                        id="codigo"
                                                        placeholder="Digite o código do produto"
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} id="colSkuProduto" style={{position: 'relative'}}>
                                            <Form.Item label="SKU">
                                                {getFieldDecorator('sku', {
                                                    rules: [
                                                        {
                                                            required: true, message: 'Por favor informe o SKU do produto',
                                                        }
                                                    ]
                                                })(
                                                    <Input
                                                        id="codigo"
                                                        placeholder="Digite o SKU do produto"
                                                    />
                                                )}
                                            </Form.Item>                                    
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12} id="colCustoProduto" style={{position: 'relative', paddingRight: '5px'}}>
                                            <Form.Item label="Custo da Mão de Obra">
                                                {getFieldDecorator('maoDeObra')(
                                                    <Input
                                                        id="nome"
                                                        placeholder="Digite o custo da mão de obra"
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} id="colCustoMateriaPrimaProduto" style={{position: 'relative'}}>
                                            <Form.Item label="Custo da Matéria Prima">
                                                {getFieldDecorator('materiaPrima')(
                                                    <Input
                                                        id="nome"
                                                        placeholder="Digite o custo da matéria prima"
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12} id="colCorProduto" style={{position: 'relative', paddingRight: '5px'}}>
                                            <Form.Item label="Cor">
                                                {getFieldDecorator('cor', {
                                                    rules: [{
                                                        required: true, message: "Informe a cor"
                                                    }],
                                                })(
                                                    <Select
                                                        showSearch
                                                        optionFilterProp="children"
                                                        style={{ width: '100%' }}
                                                        placeholder={this.state.coresSelectStatus.placeholder}
                                                        disabled={this.state.coresSelectStatus.disabled}
                                                        getPopupContainer={() => document.getElementById('colCorProduto')}
                                                        allowClear={true}
                                                    >
                                                        {
                                                            this.state.coresOptions.map((option) => {
                                                                return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                            })
                                                        }
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>                                
                                        <Col span={12} id="colLinhaProducaoProduto" style={{position: 'relative'}}>
                                            <Form.Item label="Linha de Produção">
                                                {getFieldDecorator('linhaDeProducao', {
                                                    rules: [
                                                        {
                                                            required: true, message: 'Informe a linha de produção',
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        showSearch
                                                        optionFilterProp="children"
                                                        style={{ width: '100%' }}
                                                        placeholder={this.state.linhasDeProducaoSelectStatus.placeholder}
                                                        disabled={this.state.linhasDeProducaoSelectStatus.disabled}
                                                        onChange={this.handleLinhaDeProducaoChange}
                                                        getPopupContainer={() => document.getElementById('colLinhaProducaoProduto')}
                                                        allowClear={true}
                                                    >
                                                        {
                                                            this.state.linhasDeProducaoOptions.map((option) => {
                                                                return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                            })
                                                        }
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            </TabPane>
                            {
                                (this.state.setores.length > 0) ?(
                                    <TabPane tab="Linha de Produção" key="2">
                                    {
                                        (this.state.dynamicFieldsConjuntosRendered)
                                        ? (
                                            <Row style={{marginTop: '10px'}}>
                                                <Col span={24} style={{textAlign: 'center'}}>
                                                    Carregando os dados ...
                                                </Col>
                                            </Row> 
                                        )
                                        : (
                                            <div className="div-table">
                                                <Row className="div-table-header">
                                                    <Col span={3} className="div-table-header-cell">Ordem</Col>                                                        
                                                    <Col span={5} className="div-table-header-cell">Setor</Col>
                                                    <Col span={16} className="div-table-header-cell">Conjunto</Col>
                                                </Row>
                                                {linhasItens}
                                            </div>
                                        )
                                    }
                                    </TabPane>
                                ) : null
                            }
                            <TabPane tab="Insumos" key="3">
                                {
                                    <div style={{minHeight: '380px'}}>
                                    {
                                        (!this.state.dynamicFieldsInsumos.loading || !this.state.dynamicFieldsInsumos.rendered)
                                        ? (
                                            <Row style={{marginTop: '10px'}}>
                                                <Col span={24} style={{textAlign: 'center'}}>
                                                    Carregando os dados ...
                                                </Col>
                                            </Row> 
                                        )
                                        : (
                                            <div>
                                                <div className="div-table">
                                                    <Row className="div-table-header">
                                                        <Col span={16} className="div-table-header-cell">INS | Insumos</Col>                                                        
                                                        <Col span={4} className="div-table-header-cell">Quantidade</Col>
                                                        <Col span={3} className="div-table-header-cell">Medida</Col>
                                                        <Col span={1} className="div-table-header-cell">#</Col>
                                                    </Row>
                                                    {insumosItens}
                                                </div>
                                                <Row style={{marginTop: '10px'}}>
                                                    <Col span={24} style={{textAlign: 'center'}}>
                                                        <Button key="primary" title="Incluir insumo" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
                                                    </Col>
                                                </Row>
                                            </div>
                                        )
                                    }
                                    </div>
                                }
                            </TabPane>
                        </Tabs>
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