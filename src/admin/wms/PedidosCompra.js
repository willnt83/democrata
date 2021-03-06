import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, Divider, DatePicker, TimePicker, notification } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
import _ from 'lodash';

import NumericInput from '../shared/NumericInput';

const { Content } = Layout

let id = 0

class PedidosCompra extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Pedidos de Compra')
    }

    state = {
        pedidoCompraId: null,
        tableData: [],
        showPedidosCompraModal: false,
        tableLoading: false,
        buttonSalvarPedidoCompra: false,
        insumosOptions: [],
        itemsValues: [],
        insValues: [],
        unidademedidaValues: [],
        qtdeConferidaValues: [],
        fornecedoresOptions: [],       
        insumosSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        fornecedoresSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },        
        dynamicFieldsRendered: false,
        insumos: []
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
            duration: 5
        }
        notification.open(args)
	}    

    requestGetPedidosCompra = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getPedidosCompra')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(pedidocompra => {
                    var data_pedido = moment(pedidocompra.data_pedido, 'YYYY-MM-DD')
                    var data_previsao = moment(pedidocompra.data_prevista, 'YYYY-MM-DD')
                    return({
                        key: pedidocompra.id,
                        data_pedido: data_pedido.format('DD/MM/YYYY'),
                        hora_pedido: pedidocompra.hora_pedido,
                        data_prevista: data_previsao.format('DD/MM/YYYY'),
                        fornecedorValue: pedidocompra.idFornecedor,
                        fornecedorDescription: pedidocompra.nomeFornecedor
                    })
                })
                this.setState({tableData})
            }
            else
                this.showNotification('Nenhum registro encontrado', false)
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    loadFornecedoresOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getFornecedores?ativo=Y')
        .then(res => {
            if(res.data){
                this.setState({
                    fornecedoresOptions: _.orderBy(res.data.payload.map(fornecedor => {
                        return({
                            value: fornecedor.id,
                            description: fornecedor.nome,
                        })
                    }),'description','asc'),
                    fornecedoresSelectStatus: {
                        placeholder: 'Selecione o fornecedor',
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

    loadInsumosOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getInsumos?ativo=Y')
        .then(res => {
            if(res.data){                
                this.setState({                  
                    insumosOptions: _.orderBy(res.data.payload.map(insumo => {
                        return({
                            value: insumo.id,
                            description: insumo.nome,
                            ins: insumo.ins,
                            textValue: insumo.ins + ' - ' + insumo.nome,
                            unidadeUnidademedida: insumo.unidadeUnidadeMedida,
                            unidademedida: insumo.unidadeUnidadeMedida
                        })
                    }),'description', 'asc'),
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

    requestCreateUpdatePedidoCompra = (request) => {
        this.setState({buttonSalvarPedidoCompra: true})
        axios.post(this.props.backEndPoint + '/createUpdatePedidoCompra', request)
        .then(res => {
            if(res.data.success){
                this.showPedidosCompraModal(false)
                this.requestGetPedidosCompra()
                this.setState({buttonSalvarPedidoCompra: false})
            } else {
                this.setState({buttonSalvarPedidoCompra: false})
                this.showNotification(res.data.msg, false)
            }
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarPedidoCompra: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    showPedidosCompraModal = (showPedidosCompraModal) => {
        // Se estiver fechando
        if(!showPedidosCompraModal){
            this.props.form.resetFields()
            this.setState({pedidoCompraId: null})
        }
        this.setState({showPedidosCompraModal})
    }

    loadPedidoCompraModal = (record) => {
        this.loadInsumosOptions()        
        this.loadFornecedoresOptions()      
        if(typeof(record) !== "undefined") {
            this.setState({pedidoCompraId: record.key})
            axios
            .get(this.props.backEndPoint + '/getPedidosCompraInsumos?id='+record.key)
            .then(res => {
                var pedidocompra = res.data.payload;
                if(pedidocompra && pedidocompra.length > 0){
                    var keys = pedidocompra[0].insumos.map((insumo, index) => {
                        return(index)
                    })

                    this.props.form.setFieldsValue({
                        fornecedor: pedidocompra[0].idFornecedor,
                        data_pedido: moment(pedidocompra[0].data_pedido, 'YYYY-MM-DD'),
                        hora_pedido: moment(pedidocompra[0].hora_pedido, 'HH:mm:ss'),
                        chave_nf: pedidocompra[0].chave_nf,
                        data_prevista: moment(pedidocompra[0].data_prevista, 'YYYY-MM-DD'),
                        keys
                    })
        
                    this.setState({
                        pedidoCompraId: pedidocompra[0].id,
                        dynamicFieldsRendered: true,
                        insumos: pedidocompra[0].insumos
                    })
                }
                else
                    console.log('Nenhum registro encontrado')
                this.setState({tableLoading: false})
            })
            .catch(error => {
                console.log(error)
                this.setState({tableLoading: false})
                this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
            })
        }
        else{
            this.props.form.setFieldsValue({
                data_pedido: moment(this.returnNowDate(), 'YYYY-MM-DD'),
                hora_pedido: moment(this.returnNowHour(), 'HH:mm:ss')
            })
            this.addComposicaoRow()
        }
        this.showPedidosCompraModal(true)
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){            
            var insumos = []
            var valor = []
            var quantidades = []            

            this.state.insumos.forEach(insumo => {
                insumos.push(insumo.id)
                valor.push(insumo.valor)
                quantidades.push(insumo.quantidade)                
                this.state.itemsValues.push(insumo.item)
                this.state.insValues.push(insumo.ins)
                this.state.unidademedidaValues.push(insumo.unidademedida)
                this.state.qtdeConferidaValues.push(insumo.quantidade_conferida)
            })

            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.insumos.length)

            this.props.form.setFieldsValue({
                insumos,
                valor,
                quantidades
            })

            this.setState({dynamicFieldsRendered: false})
        }
    }

    handleDeletePedidoCompra = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deletePedidoCompra?id='+id)
        .then(res => {
            if(typeof res.data.msg !== 'undefined' && res.data.msg)
                this.showNotification(res.data.msg, false)
            this.requestGetPedidosCompra()
        })
        .catch(error => {
            console.log(error)
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    handleOnChange = (value, event, index) => {
        this.insertColumnsValues({
            index: index,
            item: this.state.itemsValues[index],
            ins: event.props.ins,
            unidademedida: event.props.unidademedida,
            qtde: event.props.quantidade_conferida
        })
    }

    screenTitleDescription = () => {
        var titleDesciption = 'Cadastro de Pedido de Compra'
        if(this.state.pedidoCompraId) titleDesciption += ' #'+this.state.pedidoCompraId
        return titleDesciption;
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    insertColumnsValues = (object) => {
        let itemsValues = this.state.itemsValues
        let insValues = this.state.insValues
        let unidademedidaValues = this.state.unidademedidaValues
        let qtdeConferidaValues = this.state.qtdeConferidaValues

        if(typeof object.qtde === 'undefined' || !object.qtde)
            object.qtde = 0

        itemsValues[object.index] = object.item
        insValues[object.index] = object.ins
        unidademedidaValues[object.index] = object.unidademedida
        qtdeConferidaValues[object.index] = object.qtde

        this.setState({
            itemsValues,
            insValues,
            unidademedidaValues,
            qtdeConferidaValues
        })        
    }

    returnNowDate = () => {
        var date = new Date();
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
    }

    returnNowHour = () => {
        var date = new Date();
        return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    } 

    addComposicaoRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)

        form.setFieldsValue({
            keys: nextKeys,
        })

        this.insertColumnsValues({
            index: (id-1),
            item: null,
            ins: '',
            unidademedida: '',
            qtde: '0'
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

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var insumos = null
                var id = this.state.pedidoCompraId ? this.state.pedidoCompraId : null
                if(values.insumos){
                    insumos = values.insumos
                    .map((insumo, index) => {
                        return ({
                            item: this.state.itemsValues[index] ? parseInt(this.state.itemsValues[index]) : null,
                            idInsumo: insumo,
                            valor: parseFloat(values.valor[index]),
                            quantidade: parseFloat(values.quantidades[index])
                        })
                    })
                    .filter(insumo => {
                        return insumo !== null
                    })
                }

                var request = {
                    id: id,
                    data_pedido: values.data_pedido,
                    hora_pedido: values.hora_pedido,
                    data_prevista: values.data_prevista,
                    chave_nf: values.chave_nf,
                    idFornecedor: values.fornecedor,
                    insumos: insumos
                }

                this.requestCreateUpdatePedidoCompra(request)
            }
            else{
                console.log('erro no formulário')
                console.log(err);
            }
        })
    }

    componentWillMount(){
        this.requestGetPedidosCompra()
    }

    handleInsumoValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/insumos|\[|\]/gi,'')
        key     = key && !isNaN(key) ? parseInt(key) : null
        if(key != null && value && !isNaN(value)) {
            let idInsumo = parseInt(value)
            if(idInsumo > 0) {
                const keys  = this.props.form.getFieldValue('keys')
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

    handleQuantidadeValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/quantidades|\[|\]/gi,'');
        key = key && !isNaN(key) ? parseInt(key) : 0
        if(!isNaN(key)){
            value = value && !isNaN(value) ? parseFloat(value) : 0
            let conferido = this.state.qtdeConferidaValues[key]
            conferido = conferido && !isNaN(conferido) ? parseFloat(conferido) : 0
            if (conferido > 0 && value > 0 && value < conferido) {            
                callback('Qtde inválida!')
                this.showNotification('Quantidade inferior à conferida não permitida!', false)
            }
        }
        callback()
    }

    printPedidoCompra = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/printPedidoCompra?id='+id)
        .then(res => {
            window.open(this.props.backEndPoint + '/' + res.data.payload.url, '_blank');
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')
        const composicaoItems = keys.map((k, index) => (
            <Row key={k} style={{marginBottom: '15px'}}>                
                <Col span={24}>
                    <Col span={15} id="colInsumos" style={{position: 'relative'}}>
                        <Col span={24}>
                            <Form.Item label="INS/Insumos (Matérias-Primas)" style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`insumos[${k}]`, {
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
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}
                                        placeholder={this.state.insumosSelectStatus.placeholder}
                                        disabled={this.state.insumosSelectStatus.disabled}
                                        getPopupContainer={() => document.getElementById('colInsumos')}
                                        onSelect={(value, event) => this.handleOnChange(value, event, k)}
                                        allowClear={true}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {
                                            this.state.insumosOptions.map((option) => {
                                                return (<Select.Option key={option.value} value={option.value} ins={option.ins} unidademedida={option.unidademedida}>{option.textValue}</Select.Option>)
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        {
                            this.state.insValues[k] || this.state.unidademedidaValues[k] ? (
                                <Col span={24} style={{paddingLeft: '2px'}}>
                                    <Col span={7} id="colINS" style={{position: 'relative'}}>
                                        <div style={{fontSize: '12px'}}>
                                            <span><strong>INS:</strong>{this.state.insValues[k]}</span>
                                        </div>
                                    </Col>
                                    {
                                        this.state.unidademedidaValues[k] ? (
                                            <Col span={8} id="colUnidadeMedida" style={{position: 'relative'}}>
                                                <div style={{fontSize: '12px'}}>
                                                    <span><strong>Unidade de Medida:</strong>{this.state.unidademedidaValues[k]}</span>
                                                </div>
                                            </Col>    
                                        ) : null
                                    }                                    
                                </Col>
                            ) : null
                        }
                    </Col>
                    <Col span={4} id="colValor" style={{position: 'relative'}}>
                        <Form.Item label="Valor" style={{paddingBottom: '0px', marginBottom: '0px'}}>
                            {getFieldDecorator(`valor[${k}]`, {})(
                                <NumericInput 
                                    id="valor" 
                                    placeholder="Valor" 
                                    maxLength={25} 
                                />
                            )}                            
                        </Form.Item>
                    </Col>
                    <Col span={4} id="colQtde" style={{position: 'relative'}}>
                        <Col span={24}>
                            <Form.Item label="Quantidade" style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`quantidades[${k}]`, {
                                    rules: [
                                        {
                                            required: true, message: "Informe a quantidade"
                                        },
                                        {
                                            validator: this.handleQuantidadeValidator
                                        }                                        
                                    ]
                                })(
                                    <NumericInput
                                        id="quantidade"
                                        placeholder="Quantidade"
                                        maxLength={25}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24} style={{paddingLeft: '2px', fontSize: '12px'}}>
                            <span><strong>Conferido:</strong>{this.state.qtdeConferidaValues[k]}</span>
                        </Col>
                    </Col>
                    <Col span={1} id="colDelete" style={{position: 'relative'}}>
                        <Form.Item style={{paddingBottom: '0px', marginBottom: '0px', marginTop: '4px', textAlign: 'center'}}>
                            {keys.length > 1 && this.state.qtdeConferidaValues[k] <= 0 ? (
                                <Icon
                                    className="dynamic-delete-button"
                                    type="minus-circle-o"
                                    disabled={keys.length === 1}
                                    onClick={() => this.removeComposicaoRow(k)}
                                />
                            ) : null}
                        </Form.Item>
                    </Col>  
                </Col>             
            </Row>
        ))

        const columns = [{
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Data Pedido',
            dataIndex: 'data_pedido',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.data_pedido, b.data_pedido)
        },
        {
            title: 'Hora Pedido',
            dataIndex: 'hora_pedido',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.hora_pedido, b.hora_pedido)
        },        
        {
            title: 'Fornecedor',
            dataIndex: 'fornecedorDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.fornecedorDescription, b.fornecedorDescription)
        }, 
        {
            title: 'Previsão',
            dataIndex: 'data_prevista',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.data_prevista, b.data_prevista)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Alterar Pedido de Compra" onClick={() => this.loadPedidoCompraModal(record)} />
                        <Popconfirm title="Deseja imprimir o Pedido de Compra?" onConfirm={() => this.printPedidoCompra(record.key)}>
                            <Icon type="printer" title="Imprimir Pedido de Compra" style={{color: 'darkblue', marginLeft: 20}} />
                        </Popconfirm>
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeletePedidoCompra(record.key)}>
                            <a href="/admin/cadastros/pedidoscompra" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Novo Pedido de Compra" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadPedidoCompraModal()}><Icon type="plus" /> Novo Pedido de Compra</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />                
                <Modal
                    title={this.screenTitleDescription()}
                    visible={this.state.showPedidosCompraModal}
                    onCancel={() => this.showPedidosCompraModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showPedidosCompraModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarPedidoCompra} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                    width={1300}
                >
                    <Form layout="vertical">                        
                        <Row gutter={3}>
                            <Col span={14} id="colFornecedor" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Fornecedor"
                                >
                                    {getFieldDecorator('fornecedor', {
                                        rules: [{
                                            required: true, message: "Informe o fornecedor"
                                        }],
                                    })(
                                        <Select
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder={this.state.fornecedoresSelectStatus.placeholder}
                                            disabled={this.state.fornecedoresSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('fornecedor')}
                                            allowClear={true}
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {
                                                this.state.fornecedoresOptions.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5} id="colDataPedido" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Data do Pedido"
                                >
                                    {getFieldDecorator('data_pedido', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a data do pedido',
                                            }
                                        ]
                                    })(
                                        <DatePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione a data"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colDataPedido')}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5} id="colHoraPredido" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Hora do Pedido"
                                >
                                    {getFieldDecorator('hora_pedido', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a hora do pedido',
                                            }
                                        ]
                                    })(
                                        <TimePicker
                                            locale={ptBr}
                                            format="HH:mm:ss"
                                            placeholder="Selecione a hora"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colHoraPredido')}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={2}>
                            <Col span={14} id="colChaveNF" style={{position: 'relative'}}>                            
                                <Form.Item
                                    label="Chave da Nota Fiscal"
                                >
                                    {getFieldDecorator('chave_nf', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a chave da nota fiscal',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="chave_nf"
                                            placeholder="Digite a chave da nota fiscal"
                                        />
                                    )}
                                </Form.Item>                              
                            </Col>                        
                            <Col span={5} id="colDataEntrega" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Data Prevista de Entrega"
                                >
                                    {getFieldDecorator('data_prevista', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a data prevista de entrega',
                                            }
                                        ]
                                    })(
                                        <DatePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione a data"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colDataEntrega')}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider />
                        {composicaoItems}
                        <Row>
                            <Col span={24}>
                                <Button key="primary" title="Incluir insumo" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(PedidosCompra))