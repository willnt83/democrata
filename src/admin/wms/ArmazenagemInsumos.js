import React, { Component } from 'react'
import { Icon, Modal, Button, Row, Col, Form, Select, Input, Divider, InputNumber, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import cloneDeep from 'lodash/cloneDeep';

//import '../static/inputs.css';

let id = 0

class ArmazenagemInsumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Armazenagem de Insumos')
    }

    state = {
        showArmazenagemLancamentoModal: false,
        qtdeEntradaValues: [],
        qtdeArmazenadaValues: [],
        insumos: [],
        insumosOptions: [],
        pedidosOptions: [],
        almoxarifadosOptions: [],
        almoxarifadosPosicoes: [],
        dynamicFieldsRendered: false,
        almoxarifados: [],
        posicoes: [],
        quantidades: [],
        btnSalvarLoading: false,
        insumosArmazenados: [],
        addBtnDisabled: false,
        prevKeys: [],
        insumosTemp: [],
        controleLancamento: [],
        quantidadeRows: []
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

    getAlmoxarifados = () => {
        axios
        .get(this.props.backEndPoint + '/getAlmoxarifados?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    almoxarifadosOptions: res.data.payload,
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

    getPosicoesArmazem = (idAlmoxarifado, k) => {
        axios
        .get(this.props.backEndPoint + '/getPosicaoArmazens?id_almoxarifado='+idAlmoxarifado+'&ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    almoxarifadosPosicoes: res.data.payload.map(row => {
                        return({
                            almoxarifado: row.idAlmoxarifado,
                            posicoes: [{
                                id: row.id,
                                nome: row.posicao
                            }]
                        })
                    })
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

    getMultiplasPosicoeArmazens = (almoxarifados) => {
        almoxarifados.map(almoxarifado => {
            return({almoxarifado})
        })
        var request = {almoxarifados}
        axios.post(this.props.backEndPoint + '/getMultiplasPosicoeArmazens', request)
        .then(res => {
            var prevAlmoxarifado = null
            var almoxarifadosPosicoes = []
            res.data.payload.forEach((row, i) => {
                if(prevAlmoxarifado !== row.almoxarifado){
                    almoxarifadosPosicoes = [...almoxarifadosPosicoes, {
                        almoxarifado: row.almoxarifado,
                        posicoes: [row.posicao]
                    }]
                    prevAlmoxarifado = row.almoxarifado
                }
                else{
                    almoxarifadosPosicoes[almoxarifadosPosicoes.length-1].posicoes = [...almoxarifadosPosicoes[almoxarifadosPosicoes.length-1].posicoes, row.posicao]
                }
            })
            
            this.setState({almoxarifadosPosicoes})
        })
        .catch(error =>{
            console.log(error)
        })
    }

    requestGetPedidosArmazenarAvailables = () => {
        axios
        .get(this.props.backEndPoint + '/getPedidosCompraInsumosArmazenarAvailables')
        .then(res => {
            if(res.data.payload){
                var pedidosOptions = res.data.payload.map(pedido => {
                    return({
                        id: pedido.idPedido,
                        fornecedor: pedido.nomeFornecedor
                    })
                })
                this.setState({pedidosOptions})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetInsumosArmazenar = (idPedido, k) => {
        axios
        .get(this.props.backEndPoint + '/getInsumosArmazenar?id_pedido='+idPedido)
        .then(res => {
            if(res.data.payload){
                var insumosArmazenar = res.data.payload.map(insumo => {
                    return({
                        id: insumo.idEntradaInsumo,
                        ins: insumo.insumo.ins,
                        description: insumo.insumo.nome,
                        idPedido: insumo.idPedido
                    })
                })

                var insumosOptions = this.state.insumosOptions
                insumosOptions.splice(k, 1, insumosArmazenar)

                var insumos = []
                if(this.state.insumos.length === 0){
                    insumos = [{
                        idPedido,
                        insumos: res.data.payload
                    }]
                }
                else{
                    var existe = false
                    this.state.insumos.forEach(insumo => {
                        if(insumo.idPedido === idPedido)
                            existe = true
                    })
                    if(!existe){
                        insumos = [...this.state.insumos, {
                            idPedido,
                            insumos: res.data.payload
                        }]
                    }
                    else
                        insumos = this.state.insumos
                }
                this.setState({insumosOptions, insumos})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetInsumosArmazenados = (idArmazenagem) => {
        axios
        .get(this.props.backEndPoint + '/getInsumosArmazenados?id_armazenagem='+idArmazenagem)
        .then(res => {
            if(res.data.payload){
                this.props.form.setFieldsValue({
                    keys: res.data.payload.map((row, index) => {
                        return index
                    })
                })

                var pedidosOptions = this.state.pedidosOptions
                var hit = false
                res.data.payload.forEach(insumo => {
                    pedidosOptions.forEach(pedido => {
                        if(insumo.idPedido === pedido.id)
                            hit = true
                    })
                    if(!hit){
                        pedidosOptions.push({
                            id: insumo.idPedido,
                            fornecedor: insumo.nomeFornecedor
                        })
                    }
                })


                this.setState({insumosArmazenados: res.data.payload, pedidosOptions, dynamicFieldsRendered: true})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    showQuantidades = (idEntradaInsumo, k, controleLancamento) => {
        var quantidadeEntrada = 0
        var quantidadeArmazenar = 0

        controleLancamento.forEach(pedido => {
            pedido.insumos.forEach(insumo => {
                if(insumo.idEntradaInsumo === idEntradaInsumo){
                    quantidadeEntrada = insumo.insumo.quantidadeEntrada
                    quantidadeArmazenar = insumo.insumo.quantidadeArmazenar
                }
            })
        })
        
        const keys = this.props.form.getFieldValue('keys')
        keys.forEach(row => {
            if(this.props.form.getFieldValue(`insumo[${row}]`) === this.props.form.getFieldValue(`insumo[${k}]`)){
                let qtdeEntradaValues       = this.state.qtdeEntradaValues
                let qtdeArmazenadaValues    = this.state.qtdeArmazenadaValues
                qtdeEntradaValues[row]      = quantidadeEntrada
                qtdeArmazenadaValues[row]   = quantidadeArmazenar
                this.setState({qtdeEntradaValues, qtdeArmazenadaValues})
            }
        })
    }

    // Contabiliza quantidade de insumos que estão sendo armazenados no lançamento e atualiza controleLancamento
    contabilizaQuantidades = () => {
        const keys = this.props.form.getFieldValue('keys')

        // Monta variável de controle de lançamento a partir dos insumos a serem armazenados
        var controleLancamento = cloneDeep(this.state.insumos)

        // Atualizando quantidades em controleLancamento
        var quantidadeRow = 0
        var idEntradaInsumoRow = null
        keys.forEach(row => {
            quantidadeRow = this.props.form.getFieldValue(`quantidade[${row}]`) ? this.props.form.getFieldValue(`quantidade[${row}]`) : 0
            idEntradaInsumoRow = this.props.form.getFieldValue(`insumo[${row}]`)


            // Atualiza controleLancamento
            controleLancamento.forEach(pedido => {
                pedido.insumos.forEach((insumo, index) => {
                    if(insumo.idEntradaInsumo === idEntradaInsumoRow){
                        // Verifica se já existe quantidade armazenada do insumo (casos de edição de uma armazenagem já realizada)
                        // Verifica se é edicao
                        var quantidadeJaArmazenada = 0
                        if(this.props.idArmazenagem){
                            quantidadeJaArmazenada = 0
                            this.state.insumosArmazenados.forEach(insArma => {
                                if(insArma.idEntradaInsumo === idEntradaInsumoRow){
                                    console.log('row', row)
                                    console.log('insArma.idEntradaInsumo', insArma.idEntradaInsumo)
                                    console.log('idEntradaInsumoRow', idEntradaInsumoRow)
                                    quantidadeJaArmazenada += insArma.insumo.quantidade
                                    console.log('quantidadeJaArmazenada', quantidadeJaArmazenada)
                                }
                            })
                        }
                        //
                        pedido.insumos[index].insumo.quantidadeArmazenar -= (parseFloat(quantidadeRow) - parseFloat(quantidadeJaArmazenada))
                    }
                })
            })
        })
        return controleLancamento
    }

    handleQuantidadeValidator = (rule, value, callback) => {
        console.log('-------------')
        value = value ? value : 0

        // Recuperando o índice da linha cuja quantidade está sendo alterada
        let key = rule.fullField.replace(/quantidade|\[|\]/gi,'')
        key = key && !isNaN(key) ? parseInt(key) : null

        // Recupera o insumo selecionado
        let idEntradaInsumo = this.props.form.getFieldValue(`insumo[${key}]`)
        let idPedido = this.props.form.getFieldValue(`pedido[${key}]`)

        //Atualiza variável de estado de controle das quantidades
        var quantidadeRows = this.state.quantidadeRows
        console.log('this.state.controleLancamento', this.state.controleLancamento)
        console.log('idPedido', idPedido)

        this.state.controleLancamento.forEach(pedido => {
            if(pedido.idPedido === idPedido){
                pedido.insumos.forEach(insumo => {
                    // Busca idEntradaInsumo em insumosTemp
                    if(insumo.idEntradaInsumo === idEntradaInsumo){
                        console.log('insumo.insumo.quantidadeArmazenar', insumo.insumo.quantidadeArmazenar)
                        console.log('this.state.quantidadeRows[key]', this.state.quantidadeRows[key])
                        if(value > (insumo.insumo.quantidadeArmazenar+this.state.quantidadeRows[key]))
                            callback('Quantidade informada é superior à quantidade disponível na entrada')
                        else{
                            let controleLancamento = this.contabilizaQuantidades()
                            console.log('controleLancamento recalculado', controleLancamento)
                            this.showQuantidades(idEntradaInsumo, key, controleLancamento)
                            this.setState({controleLancamento})
                        }
                    }
                })
            }
        })

        quantidadeRows.splice(key, 1, value)
        this.setState({quantidadeRows})
        callback()
    }

    changePedido = (idPedido, k) => {
        var strObj = '{"insumo['+k+']": ""}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
        this.requestGetInsumosArmazenar(idPedido, k)
    }

    changeInsumo = (idEntradaInsumo, k) => {
        var controleLancamento = this.contabilizaQuantidades()
        this.setState({controleLancamento})
        this.showQuantidades(idEntradaInsumo, k, controleLancamento)
    }

    changeAlmoxarifado = (value, k) => {
        var strObj = '{"posicao['+k+']": ""}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
        if(value) this.getPosicoesArmazem(value, k)
    }

    handleFormSubmit = () => {
        this.setState({btnSalvarLoading: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var rows = values.almoxarifado.map((row, i) => {
                    return({
                        idEntradaInsumo: values.insumo[i],
                        idAlmoxarifado: values.almoxarifado[i],
                        idPosicao: values.posicao[i],
                        quantidade: parseFloat(values.quantidade[i])
                    })
                })
                .filter(row => {
                    return row !== null
                })

                var request = {
                    idArmazenagem: this.props.idArmazenagem,
                    lancamentos: rows,
                    idUsuario: this.props.session.usuario.id
                }
                this.createUpdateInsumosArmazenagem(request)
            }
            else{
                console.log('erro no formulário')
            }
            this.setState({btnSalvarLoading: false})
        })
    }

    createUpdateInsumosArmazenagem = (request) => {
        axios.post(this.props.backEndPoint + '/createUpdateArmazenagem', request)
        .then(res => {
            this.showNotification(res.data.msg, res.data.success)
            this.props.form.resetFields()
            this.setState({
                btnSalvarLoading: false,
                almoxarifadosOptions: [],
                almoxarifadosPosicoes: [],
                idPedidoInsumo: null,
                quantidadeArmazenar: null,
                insumos: [],
                qtdeEntradaValues: [],
                qtdeArmazenadaValues: [],
                insumosArmazenados: []
            })
            this.props.showArmazenagemModalF(false)
            this.props.requestGetArmazenagens()
        })
        .catch(error =>{
            console.log(error)
        })
    }

    addComposicaoRow = () => {
        const keys = this.props.form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)
        this.setState({prevKeys: nextKeys})
        this.props.form.setFieldsValue({
            keys: nextKeys
        })
    }

    removeComposicaoRow = (k) => {
        var keys = this.props.form.getFieldValue('keys')
        if(keys.length === 1){
            return
        }

        keys = this.props.form.getFieldValue('keys')
        this.props.form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })

        // Atualizando quantidade total
        const idPedidoInsumo = this.props.form.getFieldValue(`insumo[${k}]`)
        var controleLancamento = this.contabilizaQuantidades()
        this.showQuantidades(idPedidoInsumo, k, controleLancamento)
    }

    closeModal = () => {
        //Limpeza
        id = 0
        this.props.form.resetFields()
        this.setState({
            btnSalvarLoading: false,
            almoxarifadosOptions: [],
            almoxarifadosPosicoes: [],
            idPedidoInsumo: null,
            quantidadeArmazenar: null,
            insumos: [],
            qtdeEntradaValues: [],
            qtdeArmazenadaValues: [],
            insumosArmazenados: []
        })

        this.props.showArmazenagemModalF(false)
    }

    componentDidUpdate(prevProps, prevState){
        // Edição - Atribuindo valores aos campos
        //if(this.state.dynamicFieldsRendered && this.state.insumosOptions.length > 0 && this.state.almoxarifadosOptions.length > 0){
        if(this.state.dynamicFieldsRendered){
            id = this.state.insumosArmazenados.length
            // Pedido
            var strObj = '{'
            var comma = ''
            var insumosOptions = this.state.insumosOptions
            var content = []
            this.state.insumosArmazenados.forEach((insumo, index) => {
                comma = index === 0 ? '' : ', '
                strObj += comma+'"pedido['+index+']": '+insumo.idPedido+''

                // Montando insumosOptions temporário
                content.push({
                    id: insumo.idEntradaInsumo,
                    ins: insumo.insumo.ins,
                    description: insumo.insumo.nome,
                    idPedido: insumo.idPedido
                })

                insumosOptions.splice(index, 1, content)
                this.setState({insumosOptions})
            })
            strObj += '}'
            var obj  = JSON.parse(strObj)
            this.props.form.setFieldsValue(obj)

            // Insumo
            strObj = '{'
            comma = ''
            this.state.insumosArmazenados.forEach((insumo, index) => {
                comma = index === 0 ? '' : ', '
                strObj += comma+'"insumo['+index+']": '+insumo.idEntradaInsumo+''
            })
            strObj += '}'
            obj  = JSON.parse(strObj)
            this.props.form.setFieldsValue(obj)

            // Almoxarifado
            strObj = '{'
            comma = ''
            var almoxarifados = []
            this.state.insumosArmazenados.forEach((insumo, index) => {
                comma = index === 0 ? '' : ', '
                strObj += comma+'"almoxarifado['+index+']": '+insumo.insumo.idAlmoxarifado+''
                almoxarifados.push(insumo.insumo.idAlmoxarifado)
            })
            strObj += '}'
            obj  = JSON.parse(strObj)
            this.props.form.setFieldsValue(obj)
            this.getMultiplasPosicoeArmazens(almoxarifados)
            this.setState({dynamicFieldsRendered: false})

            // Quantidade
            strObj = '{'
            comma = ''
            this.state.insumosArmazenados.forEach((insumo, index) => {
                comma = index === 0 ? '' : ', '
                strObj += comma+'"quantidade['+index+']": '+insumo.insumo.quantidade+''
            })
            strObj += '}'
            obj  = JSON.parse(strObj)
            this.props.form.setFieldsValue(obj)

            // Construindo controleLancamento
            var controleLancamento = []
            this.state.insumosArmazenados.forEach((insumo, index) => {
                var pos = false
                controleLancamento.forEach((pedido, k) => {
                    if(insumo.idPedido === pedido.idPedido){
                        pos = k
                    }
                })
                // Se controleLancamento já possui idPedido
                if(pos !== false){
                    controleLancamento[pos].insumos.push({
                        idPedido: insumo.idPedido,
                        idEntradaInsumo: insumo.idEntradaInsumo,
                        insumo: insumo.insumo
                    })
                }
                // controleLancamento não possui idPedido
                else{
                    controleLancamento.push({
                        idPedido: insumo.idPedido,
                        insumos: [{
                            idPedido: insumo.idPedido,
                            idEntradaInsumo: insumo.idEntradaInsumo,
                            insumo: insumo.insumo
                        }]
                    })
                }

                this.setState({controleLancamento})
            })

            // Percorrendo para contabilizar quantidades
            var quantidadeRows = []
            this.state.insumosArmazenados.forEach((insumo, index) => {
                this.requestGetInsumosArmazenar(insumo.idPedido, index)
                quantidadeRows.push(insumo.insumo.quantidade)
                this.setState({quantidadeRows})
                this.showQuantidades(insumo.idEntradaInsumo, index, controleLancamento)
            })
        }

        if(prevState.almoxarifadosPosicoes.length === 0 && this.state.almoxarifadosPosicoes.length > 0){
            // Posicao
            strObj = '{'
            comma = ''
            this.state.insumosArmazenados.forEach((insumo, index) => {
                comma = index === 0 ? '' : ', '
                strObj += comma+'"posicao['+index+']": '+insumo.insumo.idPosicao+''
            })
            strObj += '}'
            obj  = JSON.parse(strObj)
            this.props.form.setFieldsValue(obj)
        }

        // Evento: Modal aberto
        if(!prevProps.showArmazenagemModal && this.props.showArmazenagemModal){
            // Edit
            if(this.props.idArmazenagem) this.requestGetInsumosArmazenados(this.props.idArmazenagem)

            this.requestGetPedidosArmazenarAvailables()
            this.getAlmoxarifados()
        }
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const porcionamentos = keys.map(k => (
            <React.Fragment key={k}>
                <Row gutter={5}>
                    <Col span={6} id="pedido" style={{position: 'relative'}}>
                        <Form.Item label="Pedido/Fornecedor" style={{marginBottom: 0}}>
                            {getFieldDecorator(`pedido[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe o pedido"
                                }],
                            })(
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    getPopupContainer={() => document.getElementById('colArmazenagem')}
                                    allowClear={true}
                                    onChange={(value) => this.changePedido(value, k)}
                                >
                                    {
                                        this.state.pedidosOptions.map((option) => {
                                            return (<Select.Option key={option.id} value={option.id}>{option.id} - {option.fornecedor}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={18} id="insumo" style={{position: 'relative'}}>
                        <Form.Item label="INS/Insumo"  style={{marginBottom: 0}}>
                            {getFieldDecorator(`insumo[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe o insumo"
                                }],
                            })(
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    getPopupContainer={() => document.getElementById('colArmazenagem')}
                                    allowClear={true}
                                    onChange={(value) => this.changeInsumo(value, k)}
                                >
                                    {
                                        this.state.insumosOptions.length > 0 && this.state.insumosOptions[k] ?
                                        this.state.insumosOptions[k].map((option) => {
                                            return (<Select.Option key={option.id} value={option.id}>{option.ins} - {option.description}</Select.Option>)
                                        })
                                        :null
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={6} id="almoxarifado" style={{position: 'relative'}}>
                        <Form.Item label="Almoxarifado" style={{marginBottom: 0}}>
                            {getFieldDecorator(`almoxarifado[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe o almoxarifado"
                                }],
                            })(
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    getPopupContainer={() => document.getElementById('colArmazenagem')}
                                    allowClear={true}
                                    onChange={(value) => this.changeAlmoxarifado(value, k)}
                                >
                                    {
                                        this.state.almoxarifadosOptions.map((option) => {
                                            return (<Select.Option key={option.id} value={option.id}>{option.nome}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={6} id="posicao" style={{position: 'relative'}}>
                        <Form.Item label="Posição" style={{marginBottom: 0}}>
                            {getFieldDecorator(`posicao[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe a posição para armazenagem"
                                }],
                            })(
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    getPopupContainer={() => document.getElementById('colArmazenagem')}
                                    allowClear={true}
                                >
                                    {
                                        this.state.almoxarifadosPosicoes.filter(posicao => {
                                            var selectedAlmoxarifado = this.props.form.getFieldValue(`almoxarifado[${k}]`)
                                            return(posicao.almoxarifado === selectedAlmoxarifado)
                                        })
                                        .map(option => {
                                            return(
                                                option.posicoes.map(pos => {
                                                    return (<Select.Option key={pos.id} value={pos.id}>{pos.nome}</Select.Option>)
                                                })
                                            )
                                            
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item label="Quantidade" style={{marginBottom: 0}}>
                            {getFieldDecorator(`quantidade[${k}]`, {
                                rules: [
                                    {
                                        required: true, message: "Informe a quantidade"
                                    },
                                    {
                                        validator: this.handleQuantidadeValidator
                                    }
                                ],
                            })(
                                <InputNumber
                                    style={{ width: '100%', marginRight: 8 }}
                                    placeholder="Qtd"
                                    min={0} 
                                    max={9999999}
                                    //onBlur={this.changeQuantidade}
                                />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="Quantidade Entrada" labelAlign="center" style={{marginBottom: 0}}>
                            <Input
                                placeholder="0"
                                value={this.state.qtdeEntradaValues[k]}
                                disabled={true}
                                className="circle-input-ligthgray"
                                style={{cursor: "auto"}}
                            />                            
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="Quantidade a ser Armazenada" labelAlign="center" style={{marginBottom: 0}}>
                            <Input
                                placeholder="0"
                                value={this.state.qtdeArmazenadaValues[k]}
                                disabled={true}
                                className="circle-input-ligthgray"
                                style={{cursor: "auto"}}
                            />                             
                        </Form.Item>
                    </Col>
                    <Col span={1}>
                        <Form.Item label="" style={{marginTop: 32, marginLeft: 15}}>
                            {keys.length > 1 ? (
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
                <Divider />
            </React.Fragment>
        ))

        return(
            <React.Fragment>
                <Modal
                    title="Armazenagem de Insumos"
                    visible={this.props.showArmazenagemModal}
                    onCancel={this.closeModal}
                    width={1300}
                    footer={[
                        <Button key="back" onClick={this.closeModal}><Icon type="close" /> Fechar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colArmazenagem" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                {porcionamentos}
                                <Row>
                                    <Col span={24}>
                                        <Button key="primary" title="Novo Porcionamento" onClick={this.addComposicaoRow} disabled={this.state.addBtnDisabled}><Icon type="plus" /></Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Modal>
            </React.Fragment>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazenagemInsumos))