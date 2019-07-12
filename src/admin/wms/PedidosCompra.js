import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, Divider, DatePicker, TimePicker, notification } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'

const { Content } = Layout

let id = 0

const statusInsumoOption = [
    {value: 'S', description: 'Solicitado'},
    {value: 'E', description: 'Entregue'},
    {value: 'C', description: 'Conferido'}
]

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
                console.log('res.data.payload', res.data.payload)
                var tableData = res.data.payload.map(pedidocompra => {
                    var data_pedido = moment(pedidocompra.data_pedido, 'YYYY-MM-DD')
                    var data_previsao = moment(pedidocompra.data_prevista, 'YYYY-MM-DD')                                   
                    return({
                        key: pedidocompra.id,
                        data_pedido: data_pedido.format('DD/MM/YYYY'),
                        hora_pedido: pedidocompra.hora_pedido,
                        data_prevista: data_previsao.format('DD/MM/YYYY'),
                        fornecedorValue: pedidocompra.idFornecedor,
                        fornecedorDescription: pedidocompra.nomeFornecedor,
                        insumos: pedidocompra.insumos
                    })
                })
                console.log(tableData);
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
                    fornecedoresOptions: res.data.payload.map(fornecedor => {
                        return({
                            value: fornecedor.id,
                            description: fornecedor.nome,
                        })
                    }),
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
                    insumosOptions: res.data.payload.map(insumo => {
                        return({
                            value: insumo.id,
                            description: insumo.nome,
                            ins: insumo.ins,
                            unidademedida: insumo.nomeUnidadeMedida
                        })
                    }),
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
            var quantidades = []
            var statusInsumos = []

            this.state.insumos.forEach(insumo => {
                insumos.push(insumo.id)
                quantidades.push(insumo.quantidade)
                statusInsumos.push(insumo.statusInsumo)
                this.state.itemsValues.push(insumo.item)
                this.state.insValues.push(insumo.ins)
                this.state.unidademedidaValues.push(insumo.unidademedida)
                this.state.qtdeConferidaValues.push(insumo.quantidade_conferida)
            })

            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.insumos.length)

            this.props.form.setFieldsValue({
                insumos,
                quantidades,
                statusInsumos
            })

            this.setState({dynamicFieldsRendered: false})
        }
    }

    handleDeletePedidoCompra = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteConjunto?id='+id)
        .then(res => {
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

    returnStatusDescription = (status, object) => {
        if(object){
            object.forEach(objStatus => {
                if(objStatus.value === status) {
                    return objStatus.description
                }
            });
        }
        return ''
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
        console.log(object);
        let itemsValues = this.state.itemsValues
        let insValues = this.state.insValues
        let unidademedidaValues = this.state.unidademedidaValues
        let qtdeConferidaValues = this.state.qtdeConferidaValues

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
                var id = this.state.pedidoCompraId ? this.state.pedidoCompraId : null

                var insumos = null
                if(values.insumos){
                    insumos = values.insumos
                    .map((insumo, index) => {
                        return ({
                            item: this.state.itemsValues[index] ? parseInt(this.state.itemsValues[index]) : null,
                            idInsumo: insumo,
                            quantidade: parseInt(values.quantidades[index]),
                            statusInsumo: values.statusInsumos[index]
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
                console.log(request);
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

    handleQuantidadeValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/quantidades|\[|\]/gi,'');
        key = key && !isNaN(key) ? parseInt(key) : 0
        if(key && !isNaN(key)){
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

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')
        const composicaoItems = keys.map((k, index) => (
            <Row key={k} style={{marginBottom: '15px'}}>                
                <Col span={24}>
                    <Row gutter={3}>
                        <Col span={15} id="colInsumos" style={{position: 'relative'}}>
                            <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`insumos[${k}]`, {
                                    rules: [{
                                        required: true, message: "Informe o insumo"
                                    }],
                                })(
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder={this.state.insumosSelectStatus.placeholder}
                                        disabled={this.state.insumosSelectStatus.disabled}
                                        getPopupContainer={() => document.getElementById('colInsumos')}
                                        onSelect={(value, event) => this.handleOnChange(value, event, k)}
                                        allowClear={true}
                                    >
                                        {
                                            this.state.insumosOptions.map((option) => {
                                                return (<Select.Option key={option.value} value={option.value} ins={option.ins} unidademedida={option.unidademedida}>{option.description}</Select.Option>)
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={3} id="colQtde" style={{position: 'relative'}}>
                            <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`quantidades[${k}]`, {
                                    rules: [
                                        {
                                            required: true, message: 'Informe a quantidade',
                                        },
                                        {
                                            validator: this.handleQuantidadeValidator
                                        }
                                    ]
                                })(
                                    <Input
                                        id="quantidade"
                                        placeholder="Quantidade"
                                    />
                                )}
                            </Form.Item>
                        </Col> 
                        <Col span={5} id="colStatus" style={{position: 'relative'}}>
                            <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`statusInsumos[${k}]`, {
                                    initialValue: 'S',
                                    rules: [{
                                        required: true, message: "Informe o status"
                                    }],
                                })(
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Selecione"
                                        getPopupContainer={() => document.getElementById('colStatus')}
                                        allowClear={true}
                                        disabled
                                    >
                                        {
                                            statusInsumoOption.map((option) => {
                                                return (<Select.Option key={option.value} value={option.value} ins={option.ins} unidademedida={option.unidademedida}>{option.description}</Select.Option>)
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
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
                    </Row>
                    <Row gutter={3} style={{marginLeft: '1px'}}>
                        <Col span={7} id="colINS" style={{position: 'relative'}}>
                            <div style={{fontSize: '12px'}} dangerouslySetInnerHTML={{__html: '<span><strong>INS:</strong> '+this.state.insValues[k]+'</span>'}}></div>
                        </Col>
                        <Col span={8} id="colUnidadeMedida" style={{position: 'relative'}}>
                            <div style={{fontSize: '12px'}} dangerouslySetInnerHTML={{__html: '<span><strong>Unidade de Medida:</strong> '+this.state.unidademedidaValues[k]+'</span>'}}></div>
                        </Col>
                        <Col span={9} id="colQuantidadeConferida" style={{position: 'relative'}}>
                            <div style={{fontSize: '12px'}} dangerouslySetInnerHTML={{__html: '<span><strong>Conferido:</strong> '+this.state.qtdeConferidaValues[k]+'</span>'}}></div>
                        </Col>                        
                    </Row>
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
            title: 'Insumos',
            dataIndex: 'insumos',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.insumos, b.insumos)
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
                            <a href="/admin/cadastros/pedidoscompra" style={{marginLeft: 20}}><Icon type="printer" title="Imprimir Pedido de Compra" style={{color: 'darkblue'}} /></a>
                        </Popconfirm>                        
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteConjunto(record.key)}>
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
                            <Button className="buttonGreen" onClick={() => this.loadPedidoCompraModal()}><Icon type="plus" /> Novo Pedido Compra</Button>
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
                    width={900}
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
                                            style={{ width: '100%' }}
                                            placeholder={this.state.fornecedoresSelectStatus.placeholder}
                                            disabled={this.state.fornecedoresSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('fornecedor')}
                                            allowClear={true}
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
                                            disabled
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
                                            disabled
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
                        <h4>Insumos (Matérias-Primas)</h4>  
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