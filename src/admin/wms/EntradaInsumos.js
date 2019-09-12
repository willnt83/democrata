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
        insumosEntrada: [],
        pedidosEntrada: [],
        insumosAvailables: [],
        pedidoCompraAvailables: [],
        insumosOptions: [],
        pedidoCompraOptions: [],
        itemsValues: [],
        disabledValues: [],
        nfValues: [],
        qtdValues: [],
        insumos: [],
        insumosAvailablesLoad: false,
        pedidoCompraAvailablesLoad: false,
        entradaLoad: false,
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

    setInitialData = () => {
        this.props.form.setFieldsValue({
            data_entrada: moment(this.returnNowDate(), 'YYYY-MM-DD'),
            hora_entrada: moment(this.returnNowHour(), 'HH:mm:ss'),
            usuario: this.props.session.usuario.id+' - '+this.props.session.usuario.nome
        }) 
    }

    getPedidosCompraAvailables = () => {
        axios
        .get(this.props.backEndPoint + '/getPedidosCompraAvailabes')
        .then(res => {
            if(res.data.payload){
                let pedidoCompraAvailables = res.data.payload.map(pedido => {
                    return {
                        ...pedido,
                        id: pedido.idPedido,
                        textValue: pedido.idPedido + ' - ' + pedido.nomeFornecedor
                    }
                })
                
                this.setState({
                    pedidoCompraAvailables: pedidoCompraAvailables,
                    pedidoCompraAvailablesLoad: true
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

    getInsumosAvailables = () => {
        axios
        .get(this.props.backEndPoint + '/getPedidosInsumosAvailabes')
        .then(res => {
            if(res.data.payload){
                let insumosAvailables = res.data.payload.map((insumo) => {
                    insumo.idInsumo            = insumo.id
                    insumo.insInsumo           = insumo.ins
                    insumo.nomeInsumo          = insumo.nome
                    insumo.quantidade          = 0
                    insumo.quantidadeConferida = 0
                    insumo.quantidadePedido    = 0
                    insumo.textValue           = insumo.ins + ' - ' + insumo.nome
                    return insumo
                })
                this.setState({
                    insumosAvailables: insumosAvailables,
                    insumosAvailablesLoad: true
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
        .get(this.props.backEndPoint + '/getPedidosCompraAvailabes?idInsumo='+idInsumo)
        .then(res => {
            if(res.data.payload){
                let pedidosInsumos = res.data.payload.map((pedido) => {
                    pedido.id = pedido.idPedido;
                    return pedido;
                });

                let pedidoCompraOptions = this.state.pedidoCompraOptions;
                pedidoCompraOptions[index] = pedidosInsumos.map(pedido => {
                    return {
                        ...pedido,
                        textValue: pedido.id + ' - ' + pedido.nomeFornecedor
                    }
                });
                this.setState({pedidoCompraOptions});

                // Verifica se o pedido de compra é válido
                let idPedidoCompra = this.props.form.getFieldValue(`pedidos[${index}]`)
                if(typeof idPedidoCompra !== 'undefined' && idPedidoCompra){
                    var valid = false;
                    pedidosInsumos.forEach(pedidoInsumo => {
                        if(parseInt(pedidoInsumo.idPedido) === parseInt(idPedidoCompra)){
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

    getInsumosPedidoCompra = (idPedido,index) => {
        axios
        .get(this.props.backEndPoint + '/getPedidosCompraInsumosAvailabes?idPedido='+idPedido)
        .then(res => {
            let pedidosInsumos = res.data.payload;
            if(pedidosInsumos){
                pedidosInsumos = pedidosInsumos.map(insumo => {
                    return {
                        ...insumo,
                        textValue: insumo.insInsumo + ' - ' + insumo.nomeInsumo
                    }
                }); 

                let insumosOptions = this.state.insumosOptions
                insumosOptions[index] = pedidosInsumos  
                this.setState({insumosOptions});

                // Verifica se o insumo é válido
                let idInsumo = this.props.form.getFieldValue(`insumos[${index}]`)
                if(typeof idInsumo !== 'undefined' && idInsumo){
                    var valid = false;
                    pedidosInsumos.forEach(pedidoInsumo => {
                        if(parseInt(pedidoInsumo.idInsumo) === parseInt(idInsumo)){
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

    requestGetEntrada = (idEntrada) => {
        axios
        .get(this.props.backEndPoint + '/getEntradaInsumos?id='+idEntrada)
        .then(res => {
            if(res.data.payload){
                let entrada = res.data.payload[0];

                // States
                let itemsValues            = []
                let nfValues               = []
                let qtdValues              = []
                let disabledValues         = []
                let insumosObjects         = []
                let pedidosCompraEntrada   = []
                let insumosEntrada         = []
                let pedidoCompraOptions    = this.state.pedidoCompraOptions
                let insumosOptions         = this.state.insumosOptions

                // Keys
                let keys = entrada.insumos.map((insumo, index) => {
                    return(index)
                })

                // Arrays
                entrada.insumos.forEach((insumo, index) =>{
                    // Pedido da EntradaInsumos
                    pedidosCompraEntrada = []
                    pedidosCompraEntrada.push({
                        id       : insumo.idPedido,
                        chave_nf : insumo.chaveNF,
                        textValue: insumo.idPedido + ' - ' + insumo.nomeFornecedor
                    })
                    
                    // Insumo da EntradaInsumos
                    insumosEntrada = []
                    insumosEntrada.push({
                        id                  : insumo.idInsumo,
                        idInsumo            : insumo.idInsumo,
                        insInsumo           : insumo.insInsumo,
                        nomeInsumo          : insumo.nomeInsumo,
                        quantidade          : insumo.quantidade,
                        quantidadeConferida : insumo.quantidadeConferida,
                        quantidadePedido    : insumo.quantidadePedido,
                        textValue           : insumo.insInsumo + ' - ' + insumo.nomeInsumo
                    })

                    itemsValues.push(insumo.id)
                    nfValues.push(insumo.chaveNF)
                    qtdValues.push(parseFloat(insumo.quantidadePedido - insumo.quantidadeConferida).toFixed(2))
                    disabledValues.push(true)
                    insumosObjects.push(insumo)
                    pedidoCompraOptions.push(pedidosCompraEntrada)
                    insumosOptions.push(insumosEntrada)
                })

                // State
                this.setState({
                    itemsValues,
                    nfValues,
                    qtdValues,         
                    pedidoCompraOptions,
                    insumosOptions,
                    disabledValues,
                    insumos: insumosObjects
                })

                // Header Fields and Keys
                this.props.form.setFieldsValue({
                    data_entrada: moment(entrada.data_entrada, 'YYYY-MM-DD'),
                    hora_entrada: moment(entrada.hora_entrada, 'HH:mm:ss'),
                    usuario: entrada.idUsuario + ' - ' + entrada.nomeUsuario,
                    keys
                })                

                // Auxiliar
                id = (entrada.insumos.length)
                
                // Start to rendering items
                this.setState({dynamicFieldsRendered: true})
            }
            else
                console.log('Nenhum registro encontrado')
        })
        .catch(error => {
            console.log(error)
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    loadInsumosFields = () => {
        // Default
        let pedidos     = [];
        let insumos     = [];
        let quantidades = [];

        // Fields
        this.state.insumos.forEach((insumo, index) =>{
            pedidos.push(insumo.idPedido)
            insumos.push(insumo.idInsumo)
            quantidades.push(insumo.quantidade)
        })

        // Set
        this.props.form.setFieldsValue({
            pedidos,
            insumos,
            quantidades
        })          
    }

    handleOnChangePedido = (value, event, index) => {
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
        if(this.props.idEntrada && typeof this.state.insumos[index] !== 'undefined' && this.state.insumos[index]){
            value           = parseFloat(value)
            let qtdValue    = parseFloat(this.state.qtdValues[index])
            let qtdeInsumo  = parseFloat(this.state.insumos[index].quantidade)
            let qtdeDisp    = parseFloat(this.state.insumos[index].quantidadePedido) - parseFloat(this.state.insumos[index].quantidadeConferida)
            if(value < qtdValue){
                let diff = parseFloat(qtdeInsumo - value).toFixed(2)
                this.insertQtyValues(qtdeDisp + diff, index)
            } else {
                let diff = parseFloat(value - qtdeInsumo).toFixed(2)
                if(qtdValue - diff >= 0){
                    this.insertQtyValues(qtdeDisp - diff, index) 
                }
            }
        }
    }

    insertQtyValues = (qtde, index) => {
        let qtdValues    = this.state.qtdValues
        qtdValues[index] = qtde >= 0 ? parseFloat(qtde).toFixed(2) : 0
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
        this.setState({btnSalvarLoading: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                if(values.keys){
                    let entradas = values.keys
                    .map((key, index) => {
                        return ({
                            id        : this.state.itemsValues[index] ? parseInt(this.state.itemsValues[index]): null,
                            idPedido  : parseInt(values.pedidos[index]),
                            idInsumo  : parseInt(values.insumos[index]),
                            quantidade: parseFloat(values.quantidades[index]).toFixed(2)
                        })
                    })
                    .filter(entrada => {
                        return entrada !== null
                    })
                    if(entradas && entradas.length > 0) {
                        this.requestCreateUpdateArmazemEntrada({
                            id          : (typeof this.props.idEntrada !== 'undefined' && this.props.idEntrada) ? this.props.idEntrada : null,
                            data_entrada: values.data_entrada,
                            hora_entrada: values.hora_entrada,
                            usuario     : this.props.session.usuario.id,
                            entradas    : entradas
                        })
                    } else {
                        this.setState({btnSalvarLoading: false})
                        this.showNotification('Não há entrada válida para inserir! Tente novamente', false);
                    }                
                } else {
                    this.setState({btnSalvarLoading: false})
                    this.showNotification('Não há entrada válida para inserir! Tente novamente', false);
                }
            }
            else{
                this.setState({btnSalvarLoading: false})
                console.log('erro no formulário')
                console.log(err);
            }
        })
    }

    requestCreateUpdateArmazemEntrada = (request) => {
        this.setState({btnSalvarLoading: true})
        axios.post(this.props.backEndPoint + '/createUpdateEntradaInsumos', request)
        .then(res => {
            if(res.data.success){
                this.showNotification(res.data.msg, res.data.success)
                this.hideModal()
                this.props.requestGetEntradaInsumosF()
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
            let qtdeEntrada            = parseFloat(value)
            let qtdeDisponivel         = parseFloat(this.state.qtdValues[key])
            if(this.props.idEntrada && typeof this.state.insumos[key] !== 'undefined' && this.state.insumos[key]){
                let qtdeOriginal           = parseFloat(this.state.insumos[key].quantidade)
                let qtdeDisponivelOriginal = parseFloat(this.state.insumos[key].quantidadePedido) - parseFloat(this.state.insumos[key].quantidadeConferida)
                if(qtdeEntrada > qtdeDisponivelOriginal + qtdeOriginal){
                    callback('Quantidade inválida')
                    this.showNotification('Não há mais insumos disponíveis', false)
                }
            } else {
                if(qtdeEntrada > qtdeDisponivel){
                    callback('Quantidade inválida')
                    this.showNotification('Não é permitida quantidade superior à Disponível', false)
                }
            }
        }
        callback()
    }

    componentDidUpdate(prevProps, prevState){
        // Open Modal
        if(!prevProps.showEntradaModal && this.props.showEntradaModal){
            this.getInsumosAvailables()
            this.getPedidosCompraAvailables()
            if(!this.props.idEntrada) {
                this.setInitialData();
                this.setState({entradaLoad: true})
            }
        }

        // Loading data from Entrada
        if(!this.state.entradaLoad && this.props.idEntrada && this.state.insumosAvailablesLoad && this.state.pedidoCompraAvailablesLoad){
            this.requestGetEntrada(this.props.idEntrada)
            this.setState({entradaLoad: true})
        }

        // Load items from Entrada (insumos)
        if(this.state.dynamicFieldsRendered && this.state.insumos.length > 0){
            this.loadInsumosFields()
            this.setState({dynamicFieldsRendered: false})
        }
    }

    addEntradaRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)

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

        // Set new Keys Field
        this.props.form.setFieldsValue({
            keys: nextKeys
        })        
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
        id = 0
        this.props.form.resetFields()
        this.setState({
            insumosAvailables: [],
            pedidoCompraAvailables: [],
            insumosOptions: [],
            pedidoCompraOptions: [],
            itemsValues: [],
            disabledValues: [],
            nfValues: [],
            qtdValues: [],
            insumos: [],
            entradaLoad: false,
            insumosAvailablesLoad: false,
            pedidoCompraAvailablesLoad: false,
            dynamicFieldsRendering: false,
            btnSalvarLoading: false
        })
        this.props.showEntradaModalF(false)
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
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder="Selecione o Pedido de Compra"
                                            getPopupContainer={() => document.getElementById('colPedidoCompra')}
                                            onChange={(value, event) => this.handleOnChangePedido(value, event, k)}
                                            allowClear={true}
                                            disabled={this.state.disabledValues[k]}
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {
                                                this.state.pedidoCompraOptions && this.state.pedidoCompraOptions[k] && this.state.pedidoCompraOptions[k].length > 0 ?
                                                (
                                                    this.state.pedidoCompraOptions[k].map((option) => {
                                                        return (<Select.Option key={option.id} value={option.id} chave_nf={option.chave_nf}>{option.textValue}</Select.Option>)
                                                    })
                                                ) : null
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            {
                                this.state.nfValues && this.state.nfValues[k] ? (
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
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder="Selecione o Insumo"
                                            getPopupContainer={() => document.getElementById('colPedidoCompra')}
                                            onChange={(value, event) => this.handleOnChangeInsumo(value, event, k)}
                                            allowClear={true}
                                            disabled={this.state.disabledValues[k]}
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {
                                                this.state.insumosOptions && this.state.insumosOptions.length > 0 ?
                                                (                                                
                                                    this.state.insumosOptions[k].map((option) => {
                                                        return (<Select.Option key={option.id} value={option.idInsumo} qtde={option.quantidade} conferida={option.quantidadeConferida}>{option.textValue}</Select.Option>)
                                                    })
                                                ) : null
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            {
                                this.state.qtdValues && typeof this.state.qtdValues[k] !== 'undefined' ? (   
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
                </Col>
            </Row>            
        ))
        
        return(
            <React.Fragment>
                <Modal
                    title="Entrada de Insumos"
                    visible={this.props.showEntradaModal}
                    onCancel={() => this.hideModal()}
                    width='90%'
                    style={{minWidth:'600px'}}
                    footer={[
                        <Button key="back" onClick={() => this.hideModal()}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    {
                        this.props.idEntrada && !this.state.entradaLoad ? 
                        (
                            <span>
                                <Icon type="loading" />&nbsp;Carregando os dados ... 
                            </span>
                        ) : 
                        (
                            <Form layout="vertical">
                                <Row>
                                    <Col span={5} id="colDataEntrada" style={{position: 'relative'}}>
                                        <Form.Item
                                            label="Data da Entrada"
                                        >
                                            {getFieldDecorator('data_entrada', {
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
                        )
                    }
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