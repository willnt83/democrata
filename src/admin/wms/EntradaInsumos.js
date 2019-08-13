import React, { Component } from 'react'
import { Divider, Icon, Modal, Button, Row, Col, Form, Select, Input, InputNumber, DatePicker, TimePicker, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'

let id = 0

class EntradaInsumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Entrada de Insumos')
    }

    state = {
        entradaIdIn: null,
        insumosAvailables: [],
        pedidoCompraAvailables: [],
        insumosOptions: [],
        pedidoCompraOptions: [],
        itemsValues: [],
        disabledValues: [],
        nfValues: [],
        qtdValues: [],
        insumos: [],
        tableLoading: false,
        dynamicFieldsRendering: false,
        btnSalvarLoading: false
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

    returnNowDate = () => {
        var date = new Date();
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
    }

    returnNowHour = () => {
        var date = new Date();
        return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    } 

    getPedidosCompraAvailables = () => {
        axios
        .get(this.props.backEndPoint + '/getPedidosCompra?status=A')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    pedidoCompraAvailables: res.data.payload
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

    getPedidosCompraInsumo = (idInsumo,index) => {
        axios
        .get(this.props.backEndPoint + '/getPedidosInsumos?statusPedido=A&idInsumo='+idInsumo+'&fullPedido=S')
        .then(res => {
            if(res.data.payload){
                let pedidosInsumos = res.data.payload.map((pedido) => {
                    pedido.id = pedido.idPedido;
                    return pedido;
                });

                let pedidoCompraOptions = this.state.pedidoCompraOptions;
                pedidoCompraOptions[index] = pedidosInsumos;
                this.setState({pedidoCompraOptions});
                
                // Verifica se o pedido de compra é válido
                let idPedidoCompra = this.props.form.getFieldValue(`pedidos[${index}]`)
                if(typeof idPedidoCompra !== 'undefined' && idPedidoCompra){
                    var valid = false;
                    pedidosInsumos.forEach(pedidoInsumo => {
                        if(parseInt(pedidoInsumo.idPedido) === idPedidoCompra){
                            valid = true;
                            return;
                        }
                    })
                    if(!valid) {
                        this.props.form.resetFields([`pedidos[${index}]`])
                        this.insertNfValue('', index)
                    }
                }
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    getInsumosAvailables = () => {
        axios
        .get(this.props.backEndPoint + '/getInsumosAvailabesToEnter')
        .then(res => {
            if(res.data.payload){
                let insumosAvailables = res.data.payload.map((insumo) => {
                    insumo.idInsumo            = insumo.id
                    insumo.insInsumo           = insumo.ins
                    insumo.nomeInsumo          = insumo.nome
                    insumo.quantidade          = 0
                    insumo.quantidadeConferida = 0
                    return insumo
                })
                this.setState({insumosAvailables})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    getInsumosPedidoCompra = (idPedido,index) => {
        axios
        .get(this.props.backEndPoint + '/getPedidosInsumos?status=S,E&idPedido='+idPedido)
        .then(res => {
            let pedidosInsumos = res.data.payload;
            if(pedidosInsumos){
                let insumosOptions = this.state.insumosOptions;
                insumosOptions[index] = pedidosInsumos;
                this.setState({insumosOptions});
                
                // Verifica se o insumo é válido
                let idInsumo = this.props.form.getFieldValue(`insumos[${index}]`)
                if(typeof idInsumo !== 'undefined' && idInsumo){
                    var valid = false;
                    pedidosInsumos.forEach(pedidoInsumo => {
                        if(parseInt(pedidoInsumo.idInsumo) === idInsumo){
                            valid = true;
                            this.insertQtyValues(pedidoInsumo.quantidade - pedidoInsumo.quantidadeConferida,index)
                            return;
                        }
                    })
                    if(!valid) {
                        this.props.form.resetFields([`insumos[${index}]`])
                        this.insertQtyValues(0, index)
                    }
                }
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    returnStatusDescription = (status, object) => {
        var returnStatus = '';
        if(object){
            object.forEach(objStatus => {
                if(objStatus.value === status) {
                    returnStatus = objStatus.description
                }
            });
        }
        return returnStatus;
    }

    loadEntradaModal = (idEntrada) => {
        axios
        .get(this.props.backEndPoint + '/getEntradaInsumos?id='+idEntrada)
        .then(res => {
            if(res.data.payload){
                let entrada = res.data.payload[0];
                let keys = entrada.insumos.map((insumo, index) => {
                    return(index)
                })

                // Default
                let pedidos     = [];
                let insumos     = [];
                let quantidades = [];

                let itemsValues         = []
                let nfValues            = []
                let qtdValues           = []
                let pedidoCompraOptions = []
                let insumosOptions      = []
                let disabledValues      = []
                let insumosObjects      = []

                entrada.insumos.forEach((insumo, index) =>{
                    // Fields
                    pedidos.push(insumo.idPedido)
                    insumos.push(insumo.idInsumo)
                    quantidades.push(insumo.quantidade)

                    // State
                    itemsValues.push(insumo.id)
                    nfValues.push(insumo.chaveNF)
                    qtdValues.push(insumo.quantidade + insumo.quantidadeConferida)
                    pedidoCompraOptions.push(this.state.pedidoCompraAvailables)
                    insumosOptions.push(this.state.insumosAvailables)
                    disabledValues.push(true)
                    insumosObjects.push(insumo)
                })

                this.setState({
                    entradaId: entrada.id,
                    itemsValues,
                    nfValues,
                    qtdValues,         
                    pedidoCompraOptions,
                    insumosOptions,
                    disabledValues,
                    insumos: insumosObjects
                })

                this.props.form.setFieldsValue({
                    data_entrada: moment(entrada.data_entrada, 'YYYY-MM-DD'),
                    hora_entrada: moment(entrada.hora_entrada, 'HH:mm:ss'),
                    usuario: entrada.idUsuario + ' - ' + entrada.nomeUsuario,
                    pedidos,
                    insumos,
                    quantidades,
                    keys
                })

                // Atualizando id, que é a variável que controla o add e remove de campos
                id = (this.state.insumos.length)
            }
            else
                console.log('Nenhum registro encontrado')
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    showEntradaModal = (showEntradaModal) => {
        this.props.showEntradaModalF(false)
    }

    handleOnChangePedido = (value, event, index) => {
        console.log('PEDIDO')
        if(typeof value !== 'undefined' && value) {
            this.getInsumosPedidoCompra(value,index)
            this.insertNfValue(event.props.chave_nf, index)
        } else {
            let insumosOptions      = this.state.insumosOptions
            insumosOptions[index]   = this.state.insumosAvailables
            this.setState({insumosOptions})
            this.insertNfValue('', index)
            this.insertQtyValues(0, index)
        }
        this.props.form.resetFields([`quantidades[${index}]`])
    }

    handleOnChangeInsumo = (value, event, index) => {
        console.log('INSUMO')
        if(typeof value !== 'undefined' && value) {
            this.getPedidosCompraInsumo(value,index)
            this.insertQtyValues(event.props.qtde - event.props.conferida, index)         
        } else {
            let pedidoCompraOptions     = this.state.pedidoCompraOptions
            pedidoCompraOptions[index]  = this.state.pedidoCompraAvailables
            this.setState({pedidoCompraOptions})
            this.insertQtyValues(0, index)
        }
        this.props.form.resetFields([`quantidades[${index}]`])
    }

    handleOnChangeQuantidade = (value, event, index) => {
        console.log('QUANTIDADE')
        // this.insertQtyValues(0, index);
    }

    insertQtyValues = (qtde, index) => {
        let qtdValues    = this.state.qtdValues
        qtdValues[index] = qtde
        this.setState({qtdValues})
    }

    insertNfValue = (nf, index) => {
        let nfValues    = this.state.nfValues
        nfValues[index] = nf
        this.setState({nfValues})
    }
    
    insertDisableValue = (disable, index) => {
        let disabledValues    = this.state.disabledValues
        disabledValues[index] = disable
        this.setState({disabledValues})       
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                if(values.keys){
                    let entradas = values.keys
                    .map((key, index) => {
                        return ({
                            id        : this.state.itemsValues[index] ? parseInt(this.state.itemsValues[index]): null,
                            idPedido  : parseInt(values.pedidos[index]),
                            idInsumo  : parseInt(values.insumos[index]),
                            quantidade: parseInt(values.quantidades[index])
                        })
                    })
                    .filter(entrada => {
                        return entrada !== null
                    })
                    if(entradas && entradas.length > 0) {
                        this.requestCreateUpdateArmazemEntrada({
                            id          : this.state.entradaId,
                            data_entrada: values.data_entrada,
                            hora_entrada: values.hora_entrada,
                            usuario     : this.props.session.usuario.id,
                            entradas    : entradas
                        })
                    } else {
                        this.showNotification('Não há entrada válida para inserir! Tente novamente', false);
                    }                
                } else {
                    this.showNotification('Não há entrada válida para inserir! Tente novamente', false);
                }
            }
            else{
                console.log('erro no formulário')
                console.log(err);
            }
        })
    }

    requestCreateUpdateArmazemEntrada = (request) => {
        this.setState({btnSalvarLoading: true})
        console.log(request);
        this.setState({btnSalvarLoading: false})
        axios.post(this.props.backEndPoint + '/createUpdateEntradaInsumos', request)
        .then(res => {
            if(res.data.success){
                this.showEntradaModal(false)
                this.setState({btnSalvarLoading: false})
                this.hideModal()
            } else {
                this.setState({btnSalvarLoading: false})
                this.showNotification(res.data.msg, false)
            }
        })
        .catch(error =>{
            console.log(error)
            this.setState({btnSalvarLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    handlePedidoValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/pedidos|\[|\]/gi,'')
        key     = key && !isNaN(key) ? parseInt(key) : null
        if(key != null && value && !isNaN(value)) {
            let idPedido = parseInt(value)
            let idInsumo = this.props.form.getFieldValue(`insumos[${key}]`)
            idInsumo     = idInsumo && !isNaN(idInsumo) ? parseInt(idInsumo) : 0
            if(idPedido > 0 && idInsumo > 0) {
                const keys  = this.props.form.getFieldValue('keys')
                keys.forEach(row => {
                    let idPedidoRow = this.props.form.getFieldValue(`pedidos[${row}]`)
                    let idInsumoRow = this.props.form.getFieldValue(`insumos[${row}]`)
                    if(row !== key && idPedidoRow === idPedido && idInsumoRow === idInsumo) {
                        callback('Pedido e Insumo já selecionado');
                    }
                })
            }
        }
        callback()
    }

    handleInsumoValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/insumos|\[|\]/gi,'')
        key     = key && !isNaN(key) ? parseInt(key) : null
        if(key != null && value && !isNaN(value)) {
            let idInsumo = parseInt(value)
            let idPedido = this.props.form.getFieldValue(`pedidos[${key}]`)
            idPedido     = idPedido && !isNaN(idPedido) ? parseInt(idPedido) : 0
            if(idPedido > 0 && idInsumo > 0) {
                const keys  = this.props.form.getFieldValue('keys')
                keys.forEach(row => {
                    let idPedidoRow = this.props.form.getFieldValue(`pedidos[${row}]`)
                    let idInsumoRow = this.props.form.getFieldValue(`insumos[${row}]`)
                    if(row !== key && idPedidoRow === idPedido && idInsumoRow === idInsumo) {
                        callback('Pedido e Insumo já selecionado');
                    }
                })
            }
        }
        callback()
    }

    handleQuantidadeValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/quantidades|\[|\]/gi,'')
        key     = key && !isNaN(key) ? parseInt(key) : null
        if(key != null && value && !isNaN(value)) {
            let qtdEntrada      = parseFloat(value)
            let qtdeDisponivel  = parseFloat(this.state.qtdValues[key])
            if(qtdEntrada > qtdeDisponivel) {
                callback('Quantidade inválida')
                this.showNotification('Não é permitida quantidade superior à Disponível', false)
            }
        }
        callback()
    }

    componentDidUpdate(prevProps, prevState){
        if(!prevProps.showEntradaModal && this.props.showEntradaModal){
            this.getInsumosAvailables()
            this.getPedidosCompraAvailables()
            this.setState({dynamicFieldsRendering: true })
        }
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendering && this.props.entradaIdIn && this.state.entradaId !== this.props.entradaIdIn){            
            this.setState({entradaId: this.props.entradaIdIn, dynamicFieldsRendering: false })
            this.loadEntradaModal(this.props.entradaIdIn)
        }
    }

    addEntradaRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)
        this.props.form.setFieldsValue({
            keys: nextKeys
        })

        // Default item 
        let itemsValues      = this.state.itemsValues;
        itemsValues[(id-1)]  = this.state.insumosAvailables
        this.setState({itemsValues})

        // Default Values
        this.insertNfValue('', (id-1))
        this.insertQtyValues(0, (id-1))
        this.insertDisableValue(false,(id-1))

        // Default Selects
        let pedidoCompraOptions     = this.state.pedidoCompraOptions;
        let insumosOptions          = this.state.insumosOptions;
        pedidoCompraOptions[(id-1)] = this.state.pedidoCompraAvailables
        insumosOptions[(id-1)]      = this.state.insumosAvailables
        this.setState({pedidoCompraOptions, insumosOptions})
    }

    removeEntradaRow = (k) => {
        const keys = this.props.form.getFieldValue('keys')
        if(keys.length === 1){
            return
        }
        this.props.form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }  

    hideModal = () => {
        window.location.href = ''
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const entradaRow = keys.map(k => (
            <Row key={k} style={{marginBottom: '15px'}}>
                <Col span={24}>
                    <Row gutter={5}>
                        <Col span={10} id="colPedidoCompra" style={{position: 'relative'}}>
                            <Col span={24}>
                                <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                    {getFieldDecorator(`pedidos[${k}]`, {
                                        rules: [
                                            {
                                                required: true, message: "Informe o Pedido"
                                            },
                                            {
                                                validator: this.handlePedidoValidator
                                            }
                                        ],
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder="Selecione o Pedido de Compra"
                                            getPopupContainer={() => document.getElementById('colPedidoCompra')}
                                            onChange={(value, event) => this.handleOnChangePedido(value, event, k)}
                                            allowClear={true}
                                            disabled={this.state.disabledValues[k]}
                                        >
                                            {
                                                this.state.pedidoCompraOptions[k].map((option) => {
                                                    return (<Select.Option key={option.id} value={option.id} chave_nf={option.chave_nf} data_pedido={option.data_pedido} hora_pedido={option.hora_pedido}>{option.id} - {option.nomeFornecedor}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            {
                                this.state.nfValues[k] ? (
                                    <Col span={24}>
                                        <Col span={20} id="colChaveNF" style={{position: 'relative'}}>
                                            <Col style={{fontSize: '12px'}}>
                                                <span><strong>Chave NF:</strong>{this.state.nfValues[k]}</span>
                                            </Col>
                                        </Col>
                                        <Col span={4} id="colDetalhes" style={{position: 'relative'}}>
                                            {/* <Button type="link">(Ver Detalhes)</Button> */}
                                        </Col>
                                    </Col>
                                ) : null
                            }
                        </Col>
                        <Col span={10} id="colInsumos" style={{position: 'relative'}}>
                            <Col span={24}>
                                <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                    {getFieldDecorator(`insumos[${k}]`, {
                                        rules: [
                                            {
                                                required: true, message: "Informe o Insumo"
                                            },
                                            {
                                                validator: this.handleInsumoValidator
                                            }
                                        ],
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder="Selecione o Insumo"
                                            getPopupContainer={() => document.getElementById('colPedidoCompra')}
                                            onChange={(value, event) => this.handleOnChangeInsumo(value, event, k)}
                                            allowClear={true}
                                            disabled={this.state.disabledValues[k]}
                                        >
                                            {
                                                this.state.insumosOptions[k].map((option) => {
                                                    return (<Select.Option key={option.id} value={option.idInsumo} qtde={option.quantidade} conferida={option.quantidadeConferida}>{option.insInsumo} - {option.nomeInsumo}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            {
                                this.state.qtdValues[k] ? (   
                                    <Col span={24} style={{fontSize: '12px', textAlign: 'right'}}>
                                        <span><strong>Qtd. Disponível:</strong>{this.state.qtdValues[k]}</span>
                                    </Col>
                                ) : null
                            }                            
                        </Col>
                        <Col span={3} id="colQuantidade" style={{position: 'relative'}}>
                            <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                                {getFieldDecorator(`quantidades[${k}]`, {
                                    initialValue: '0',
                                    rules: [
                                        {
                                            required: true, message: 'Informe a quantidade',
                                        },
                                        {
                                            validator: this.handleQuantidadeValidator
                                        }
                                    ]
                                })(
                                    <InputNumber
                                        id="quantidade"
                                        placeholder="Quantidade"
                                        min={0} 
                                        max={9999999}
                                        onChange={(value, event) => this.handleOnChangeQuantidade(value, event, k)}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={1} id="colDelete" style={{position: 'relative'}}>
                        <Form.Item style={{paddingBottom: '0px', marginBottom: '0px', marginTop: '4px', textAlign: 'center'}}>
                            {keys.length > 1 ? (
                                <Icon
                                    className="dynamic-delete-button"
                                    type="minus-circle-o"
                                    disabled={keys.length === 1}
                                    onClick={() => this.removeEntradaRow(k)}
                                />
                            ) : null}
                        </Form.Item>
                    </Col>                  
                    </Row>
                    <Row gutter={3} style={{marginLeft: '1px'}}>
                        <Col span={10} id="colQuantidadeDetalhe" style={{position: 'relative'}}>

                        </Col>
                    </Row>
                </Col>
            </Row>            
        ))

        
        return(
            <React.Fragment>
                <Modal
                    title="Entrada de Insumos"
                    visible={this.props.showEntradaModal}
                    onCancel={() => this.showEntradaModal(false)}
                    width='90%'
                    style={{minWidth:'600px'}}
                    footer={[
                        <Button key="back" onClick={() => this.showEntradaModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Row>
                            <Col span={5} id="colDataEntrada" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Data da Entrada"
                                >
                                    {getFieldDecorator('data_entrada', {
                                        initialValue: moment(this.returnNowDate(), 'YYYY-MM-DD'),
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a data',
                                            }
                                        ]
                                    })(
                                        <DatePicker
                                            locale={ptBr}
                                            format="DD/MM/YYYY"
                                            placeholder="Selecione a data"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colDataEntrada')}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5} id="colHoraEntrada" style={{position: 'relative', marginLeft: '5px'}}>
                                <Form.Item
                                    label="Hora da Entrada"
                                >
                                    {getFieldDecorator('hora_entrada', {
                                        initialValue: moment(this.returnNowHour(), 'HH:mm:ss'),
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe a hora',
                                            }
                                        ]
                                    })(
                                        <TimePicker
                                            locale={ptBr}
                                            format="HH:mm:ss"
                                            placeholder="Selecione a hora"
                                            style={ {width: '100%'} }
                                            getCalendarContainer={() => document.getElementById('colHoraEntrada')}
                                        />
                                    )}
                                </Form.Item>
                            </Col> 
                            <Col span={10} id="colUsuario" style={{position: 'relative', marginLeft: '5px'}}>
                                <Form.Item
                                    label="Usuário"
                                >
                                    {getFieldDecorator('usuario', {
                                        initialValue: this.props.session.usuario.id+' - '+this.props.session.usuario.nome,
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o usuario',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="usuario"
                                            placeholder="Usuário"
                                            disabled
                                        />
                                    )}
                                </Form.Item>
                            </Col>                                                       
                        </Row>

                        <Divider style={{marginTop: '0px'}} />

                        <Row>
                            <Col span={24} id="colEntradas" style={{position: 'relative'}}>
                                <Row className="bold" style={{marginBottom: 10}}>
                                    <Col span={10}>Pedido de Compra / Fornecedor</Col>
                                    <Col span={10}>INS / Insumo</Col>
                                    <Col span={3}>Quantidade</Col>
                                </Row>
                            </Col>
                        </Row>

                        {entradaRow} 

                        <Row>
                            <Col span={24}>
                                <Button key="primary" title="Nova Entrada" onClick={this.addEntradaRow}><Icon type="plus" /></Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </React.Fragment>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        session: state.session,
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(EntradaInsumos))