import React, { Component } from 'react'
import { Icon, Modal, Button, Row, Col, Form, Select, Input, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import cloneDeep from 'lodash/cloneDeep';

let id = 0

class ArmazenagemInsumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Armazenagem de Insumos')
    }

    state = {
        showArmazenagemLancamentoModal: false,
        insumosInfo: [],
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
        prevKeys: []

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
                //console.log('res.data.payload', res.data.payload)
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

                this.setState({insumosOptions, insumos: res.data.payload})
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
        console.log('requestGetInsumosArmazenados')
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

    showQuantidades = (idEntradaInsumo, k, insumosTemp) => {
        /*
        console.log('---===showQuantidades===---')
        console.log('idEntradaInsumo', idEntradaInsumo)
        console.log('k', k)
        */

        var quantidadeEntrada = 0
        var quantidadeArmazenar = 0

        //console.log('insumosTemp', insumosTemp)
        insumosTemp.forEach(insumo => {
            if(insumo.idEntradaInsumo === idEntradaInsumo){
                quantidadeEntrada = insumo.insumo.quantidadeEntrada
                quantidadeArmazenar = insumo.insumo.quantidadeArmazenar
            }
        })
        
        const keys = this.props.form.getFieldValue('keys')
        //console.log('keys', keys)
        keys.forEach(row => {
            /*
            console.log('-')
            console.log('insumo row', this.props.form.getFieldValue(`insumo[${row}]`))
            console.log('insumo k', this.props.form.getFieldValue(`insumo[${k}]`))
            */

            if(this.props.form.getFieldValue(`insumo[${row}]`) === this.props.form.getFieldValue(`insumo[${k}]`)){
                var content = 'Quantidade entrada: '+quantidadeEntrada+' | Quantidade a ser armazenada: '+parseFloat(quantidadeArmazenar)
                //var content = 'Quantidade entrada: '+quantidadeEntrada
                var insumosInfo = this.state.insumosInfo
                insumosInfo.splice(row, 1, content)
                //console.log('insumosInfo', insumosInfo)
                this.setState({insumosInfo})
            }
        })
        this.setState({insumosTemp})
    }

    // Contabiliza quantidade de insumos que estão sendo armazenados no lançamento e atualiza insumosTemp
    contabilizaQuantidades = (idEntradaInsumo) => {
        console.log('---===contabilizaQuantidades===---')
        const keys = this.props.form.getFieldValue('keys')
        var somatoriaEntradas = 0
        var quantidadeJaArmazenada = 0

        console.log('keys', keys)
        console.log('idEntradaInsumo', idEntradaInsumo)

        // Calculando somatória informadas nos campos quantidades para o insumo em questão
        keys.forEach(row => {
            if(this.props.form.getFieldValue(`insumo[${row}]`) === idEntradaInsumo){
                //console.log('insumo encontrado na linha '+row)
                //Se houver valor de quantidade para a linha
                if(this.props.form.getFieldValue(`quantidade[${row}]`))
                    somatoriaEntradas += parseFloat(this.props.form.getFieldValue(`quantidade[${row}]`))
            }
        })
        console.log('somatoriaEntradas', somatoriaEntradas)

        // Verifica se o insumo em questão já foi armazenado e subtrai a quantidade
        //console.log('this.state.insumosArmazenados', this.state.insumosArmazenados)
        this.state.insumosArmazenados.forEach(insumo => {
            if(insumo.idEntradaInsumo === idEntradaInsumo)
                quantidadeJaArmazenada += parseFloat(insumo.insumo.quantidadeEntrada - insumo.insumo.quantidadeArmazenar)
        })
        //console.log('quantidadeJaArmazenada', quantidadeJaArmazenada)
        somatoriaEntradas -= quantidadeJaArmazenada

        console.log('somatoriaEntradas final', somatoriaEntradas)

        var insumosTemp = cloneDeep(this.state.insumos)
        console.log('insumosTemp antes', insumosTemp)

        insumosTemp.forEach((insumo, index) => {
            if(insumo.idEntradaInsumo === idEntradaInsumo){
                insumosTemp[index].insumo.quantidadeArmazenar -= parseFloat(somatoriaEntradas)
            }
        })
        console.log('insumosTemp depois', insumosTemp)
        return insumosTemp
    }

    changePedido = (idPedido, k) => {
        var strObj = '{"insumo['+k+']": ""}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
        this.requestGetInsumosArmazenar(idPedido, k)
    }

    changeInsumo = (idEntradaInsumo, k) => {
        var insumosTemp = this.contabilizaQuantidades(idEntradaInsumo)
        this.showQuantidades(idEntradaInsumo, k, insumosTemp)
    }

    changeAlmoxarifado = (value, k) => {
        var strObj = '{"posicao['+k+']": ""}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
        if(value) this.getPosicoesArmazem(value, k)
    }

    changeQuantidade = (e) => {
        var pos = e.target.id.replace('quantidade[', '').replace(']', '')

        if(e.target.value > 0){
            var idEntradaInsumo = this.props.form.getFieldValue(`insumo[${pos}]`)
            console.log('idEntradaInsumo', idEntradaInsumo)
            var insumosTemp = this.contabilizaQuantidades(idEntradaInsumo)
            var result = this.validacaoQuantidade(idEntradaInsumo, pos, insumosTemp)
            if(result === true){
                this.showQuantidades(idEntradaInsumo, pos, insumosTemp)
            }
            else{
                insumosTemp = this.contabilizaQuantidades(idEntradaInsumo)
                this.showQuantidades(idEntradaInsumo, pos, insumosTemp)
            }
        }
    }

    validacaoQuantidade(idPedidoInsumo, k, insumosTemp){
        var valid = true
        var quantidadeInformada = 0
        var quantidadePermitida = 0
        insumosTemp.forEach((insumo, index) => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                if(insumosTemp[index].insumo.quantidadeArmazenar < 0){
                    quantidadeInformada = this.props.form.getFieldValue(`quantidade[${k}]`)
                    quantidadePermitida = (parseFloat(quantidadeInformada) + parseFloat(insumosTemp[index].insumo.quantidadeArmazenar))

                    var strObj = '{"quantidade['+k+']": '+quantidadePermitida+'}'
                    var obj  = JSON.parse(strObj)
                    this.props.form.setFieldsValue(obj)
                    valid = false
                }
            }
        })
        if(valid) return true
        else return quantidadePermitida
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
                insumosInfo: [],
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

        // Atualizando quantidade total
        var insumosTemp = cloneDeep(this.state.insumos) // Clonando state.insumos sem referência

        const idPedidoInsumo = this.props.form.getFieldValue(`insumo[${k}]`)
        var quantidadeAtualizada = 0
        keys.forEach(row => {
            if(row !== k && this.props.form.getFieldValue(`insumo[${row}]`) === idPedidoInsumo)
                quantidadeAtualizada += parseFloat(this.props.form.getFieldValue(`quantidade[${row}]`))
        })

        insumosTemp.forEach((insumo, index) => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                insumosTemp[index].insumo.quantidadeArmazenar -= parseFloat(quantidadeAtualizada)
            }
        })
        this.showQuantidades(idPedidoInsumo, k, insumosTemp)

        this.props.form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
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
            insumosInfo: [],
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

            // Percorrendo para contabilizar quantidades
            this.state.insumosArmazenados.forEach((insumo, index) => {
                this.showQuantidades(insumo.idEntradaInsumo, index, this.state.insumosArmazenados)
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
            //this.requestGetInsumosArmazenar()
            this.getAlmoxarifados()
        }

        // Disable do botão +
       
        /*
        if(this.state.prevKeys.length !== prevState.prevKeys.length){
            
            const keys = this.props.form.getFieldValue('keys')
            if(keys.length > this.state.insumosTemp.length)
                this.setState({addBtnDisabled: true})
            else
                this.setState({addBtnDisabled: false})
        }
        */
    }

    render(){
        console.log('this.state.insumosOptions', this.state.insumosOptions)

        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const porcionamentos = keys.map(k => (
            <React.Fragment key={k}>
                <Row gutter={5}>
                    <Col span={4} id="pedido" style={{position: 'relative'}}>
                        <Form.Item style={{marginBottom: 0}}>
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
                    <Col span={6} id="insumo" style={{position: 'relative'}}>
                        <Form.Item style={{marginBottom: 0}}>
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
                                    onBlur={(value) => this.changeInsumo(value, k)}
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
                    <Col span={5} id="almoxarifado" style={{position: 'relative'}}>
                        <Form.Item style={{marginBottom: 0}}>
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
                    <Col span={5} id="posicao" style={{position: 'relative'}}>
                        <Form.Item style={{marginBottom: 0}}>
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
                    <Col span={4}>
                        <Form.Item style={{marginBottom: 0}}>
                            {getFieldDecorator(`quantidade[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe a quantidade"
                                }],
                            })(
                                <Input
                                    style={{ width: '75%', marginRight: 8 }}
                                    placeholder="Qtd"
                                    onBlur={this.changeQuantidade}

                                />
                            )}
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
                <Row gutter={5} style={{marginBottom: 25}}>
                    <Col span={10} className="bold">
                        {this.state.insumosInfo[k]}
                    </Col>
                </Row>
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
                                {
                                    porcionamentos.length > 0 ?
                                    <Row className="bold" style={{marginBottom: 10}}>
                                        <Col span={4}>Pedido - Fornecedor</Col>
                                        <Col span={6}>INS - Insumo</Col>
                                        <Col span={5}>Almoxarifado</Col>
                                        <Col span={5}>Posição</Col>
                                        <Col span={4}>Quantidade</Col>
                                    </Row>
                                    :null
                                }
                                
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