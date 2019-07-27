import React, { Component } from 'react'
import { Icon, Modal, Button, Row, Col, Form, Select, Input, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import cloneDeep from 'lodash/cloneDeep';
//import moment from 'moment'

let id = 0

class ArmazenagemInsumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Armazenagem de Insumos')
    }

    state = {
        tableLoading: false,
        showArmazenagemLancamentoModal: false,
        insumosTemp: [],
        insumosInfo: [],
        nomeInsumo: null,
        insumos: [],
        insumosOptions: [],
        almoxarifadosOptions: [],
        almoxarifadosPosicoes: [],
        dynamicFieldsRendered: false,
        almoxarifados: [],
        posicoes: [],
        quantidades: [],
        btnSalvarLoading: false

    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
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

    requestGetInsumosArmazenar = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getInsumosArmazenar')
        .then(res => {
            if(res.data.payload){
                var insumosOptions = res.data.payload.map(insumo => {
                    return({
                        id: insumo.idPedidoInsumo,
                        description: insumo.insumo.nome
                    })
                })
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

    getAlmoxarifados = () => {
        axios
        .get(this.props.backEndPoint + '/getAlmoxarifados?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    almoxarifadosOptions: res.data.payload
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
                else almoxarifadosPosicoes[i-1].posicoes = [...almoxarifadosPosicoes[i-1].posicoes, row.posicao]
            })
            this.setState({almoxarifadosPosicoes})
        })
        .catch(error =>{
            console.log(error)
        })
    }

    createUpdateInsumosArmazenagem = (request) => {
        axios.post(this.props.backEndPoint + '/createUpdateInsumosArmazenagem', request)
        .then(res => {
            this.showNotification(res.data.msg, res.data.success)
            this.props.form.resetFields()
            this.setState({
                btnSalvarLoading: false,
                almoxarifadosOptions: [],
                almoxarifadosPosicoes: [],
                idPedidoInsumo: null,
                nomeInsumo: null,
                quantidadeArmazenar: null
            })
            this.props.showArmazenagemLancamentoModalF(false)
        })
        .catch(error =>{
            console.log(error)
        })
    }

    showQuantidades = (idPedidoInsumo, k, insumosTemp) => {
        console.log('---=== showQuantidades ===---')
        console.log('idPedidoInsumo', idPedidoInsumo)
        console.log('k', k)
        console.log('insumosTemp', insumosTemp)
        var quantidadeEntrada = 0
        var quantidadeArmazenar = 0

        insumosTemp.forEach(insumo => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                quantidadeEntrada = insumo.insumo.quantidadeEntrada
                quantidadeArmazenar = insumo.insumo.quantidadeArmazenar
            }
        })
        
        const keys = this.props.form.getFieldValue('keys')
        keys.forEach(row => {
            if(this.props.form.getFieldValue(`insumo[${row}]`) === this.props.form.getFieldValue(`insumo[${k}]`)){
                console.log('linha', row)
                console.log('Atualizando insumo', idPedidoInsumo)
                var content = 'Quantidade entrada: '+quantidadeEntrada+' | Quantidade armazenar: '+quantidadeArmazenar
                var insumosInfo = this.state.insumosInfo

                insumosInfo.splice(row, 1, content)
                console.log('insumosInfo', insumosInfo)
                this.setState({insumosInfo})
            }
        })
        this.setState({insumosTemp})
    }

    // Contabiliza quantidade de insumos que estão sendo armazenados no lançamento e atualiza insumosTemp
    contabilizaQuantidades = (idPedidoInsumo) => {
        const keys = this.props.form.getFieldValue('keys')
        var somatoriaEntradas = 0
        keys.forEach(row => {
            if(this.props.form.getFieldValue(`insumo[${row}]`) === idPedidoInsumo)
                somatoriaEntradas += parseInt(this.props.form.getFieldValue(`quantidade[${row}]`))
        })
        var insumosTemp = cloneDeep(this.state.insumos)
        insumosTemp.forEach((insumo, index) => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                insumosTemp[index].insumo.quantidadeArmazenar -= somatoriaEntradas
            }
        })
        return insumosTemp
    }

    changeInsumo = (idPedidoInsumo, k) => {
        var insumosTemp = this.contabilizaQuantidades(idPedidoInsumo)
        this.showQuantidades(idPedidoInsumo, k, insumosTemp)
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
            var idPedidoInsumo = this.props.form.getFieldValue(`insumo[${pos}]`)
            var insumosTemp = this.contabilizaQuantidades(idPedidoInsumo)
            this.showQuantidades(idPedidoInsumo, pos, insumosTemp)
        }


        /*
        if(e.target.value > 0){
            const keys = this.props.form.getFieldValue('keys')
            var quantidadeArmazenar = this.state.quantidadeEntrada
            
            var valorEntradaInicial = parseInt(this.props.form.getFieldValue(e.target.id))
            var somatoriaEntradas = 0
            var valorExcedente = 0
            var valorMaximoPermitido = 0

            keys.forEach(row => {
                somatoriaEntradas += parseInt(this.props.form.getFieldValue(`quantidade[${row}]`))
            })

            if(somatoriaEntradas > quantidadeArmazenar){
                valorExcedente = somatoriaEntradas - quantidadeArmazenar
                valorMaximoPermitido = valorEntradaInicial - valorExcedente
                var strObj = '{"'+e.target.id+'": '+valorMaximoPermitido+'}'
                var obj  = JSON.parse(strObj)
                this.props.form.setFieldsValue(obj)
                this.setState({quantidadeArmazenar: 0})
            }
            else
                this.setState({quantidadeArmazenar: (quantidadeArmazenar - somatoriaEntradas)})
        }
        */
    }

    handleFormSubmit = () => {
        this.setState({btnSalvarLoading: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var rows = values.almoxarifado.map((row, i) => {
                    return({
                        idAlmoxarifado: values.almoxarifado[i],
                        idPosicao: values.posicao[i],
                        quantidade: parseInt(values.quantidade[i])
                    })
                })
                .filter(row => {
                    return row !== null
                })

                var request = {
                    idPedidoInsumo: this.state.idPedidoInsumo,
                    lancamentos: rows
                }
                this.createUpdateInsumosArmazenagem(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    addComposicaoRow = () => {
        const keys = this.props.form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)
        this.props.form.setFieldsValue({
            keys: nextKeys
        })
    }

    removeComposicaoRow = (k) => {
        console.log('removeComposicaoRow', k)
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
                quantidadeAtualizada += parseInt(this.props.form.getFieldValue(`quantidade[${row}]`))
        })

        console.log('quantidadeAtualizada', quantidadeAtualizada)
        insumosTemp.forEach((insumo, index) => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                insumosTemp[index].insumo.quantidadeArmazenar -= quantidadeAtualizada
            }
        })
        this.showQuantidades(idPedidoInsumo, k, insumosTemp)

        this.props.form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.dynamicFieldsRendered && this.state.almoxarifadosPosicoes.length > 0){
            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.almoxarifados.length)
            this.props.form.setFieldsValue({
                almoxarifado: this.state.almoxarifados,
                posicao: this.state.posicoes,
                quantidade: this.state.quantidades
            })
            this.setState({dynamicFieldsRendered: false})
        }

        // Evento: Modal aberto
        if(!prevProps.showArmazenagemModal && this.props.showArmazenagemModal){
            this.requestGetInsumosArmazenar()
            this.getAlmoxarifados()
            //this.setState({idPedidoInsumo: this.props.insumoInfo.idPedidoInsumo, nomeInsumo: this.props.insumoInfo.nome, quantidadeEntrada: this.props.insumoInfo.quantidadeEntrada})    
            //this.getInsumosArmazenagem(this.props.insumoInfo.idPedidoInsumo)
        }
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const porcionamentos = keys.map(k => (
            <React.Fragment key={k}>
                <Row gutter={5}>
                    <Col span={10} id="insumo" style={{position: 'relative'}}>
                        <Form.Item style={{marginBottom: 0}}>
                            {getFieldDecorator(`insumo[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe o insumo"
                                }],
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    getPopupContainer={() => document.getElementById('colArmazenagem')}
                                    allowClear={true}
                                    onChange={(value) => this.changeInsumo(value, k)}
                                >
                                    {
                                        this.state.insumosOptions.map((option) => {
                                            return (<Select.Option key={option.id} value={option.id}>{option.description}</Select.Option>)
                                        })
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
                    onCancel={() => this.props.showArmazenagemModalF(false)}
                    width={1300}
                    footer={[
                        <Button key="back" onClick={() => this.props.showArmazenagemModalF(false)}><Icon type="close" /> Fechar</Button>,
                    ]}
                >
                    <Row>
                        <Col span={24} id="colArmazenagem" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                {/*
                                <Row style={{marginBottom: 10}}>
                                    <Col span={24}>
                                        Insumo: <span className="bold" >{this.state.nomeInsumo}</span>
                                    </Col>
                                    <Col span={24}>
                                        Quantidade entrada: <span className="bold" >{this.state.quantidadeEntrada}</span>
                                    </Col>
                                    <Col span={24}>
                                        Quantidade a ser armazenada: <span className="bold" >{this.state.quantidadeArmazenar}</span>
                                    </Col>
                                </Row>
                                */}
                                {
                                    porcionamentos.length > 0 ?
                                    <Row className="bold" style={{marginBottom: 10}}>
                                        <Col span={10}>Insumo</Col>
                                        <Col span={5}>Almoxarifado</Col>
                                        <Col span={5}>Posição</Col>
                                        <Col span={4}>Quantidade</Col>
                                    </Row>
                                    :null
                                }
                                
                                {porcionamentos}
                                <Row>
                                    <Col span={24}>
                                        <Button key="primary" title="Novo Porcionamento" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
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
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazenagemInsumos))