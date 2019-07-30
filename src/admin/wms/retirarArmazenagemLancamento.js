import React, { Component } from 'react'
import { Icon, Modal, Input, Button, Row, Col, Form, Select, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"

let id = 0
class ArmazenagemLancamento extends Component {
    state = {
        almoxarifadosOptions: [],
        idPedidoInsumo: null,
        nomeInsumo: null,
        quantidadeEntrada: null,
        quantidadeArmazenar: null,
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

    getInsumosArmazenagem = (idPedidoInsumo) => {
        axios
        .get(this.props.backEndPoint + '/getInsumosArmazenagem?id_pedido_insumo='+idPedidoInsumo)
        .then(res => {
            if(res.data.payload.length > 0){
                var keys = []
                var quantidadeArmazenar = this.state.quantidadeEntrada
                var almoxarifados = res.data.payload.map((row, index) => {
                    quantidadeArmazenar -= row.quantidade
                    keys.push(index)
                    return(row.id_almoxarifado)
                })
                // Buscando posições para cada almoxarifado
                this.getMultiplasPosicoeArmazens(almoxarifados)
                this.props.form.setFieldsValue({keys})

                this.setState({
                    dynamicFieldsRendered: true,
                    quantidadeArmazenar,
                    almoxarifados: res.data.payload.map(row => {
                        return(row.id_almoxarifado)
                    }),
                    posicoes: res.data.payload.map(row => {
                        return(row.id_posicao)
                    }),
                    quantidades: res.data.payload.map(row => {
                        return(row.quantidade)
                    })
                })
            }
        })
        .catch(error => {
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

    changeAlmoxarifado = (value, k) => {
        var strObj = '{"posicao['+k+']": ""}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
        if(value) this.getPosicoesArmazem(value, k)
    }

    changeQuantidade = (e) => {
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
            keys: nextKeys,
        })
    }

    removeComposicaoRow = (k) => {
        const keys = this.props.form.getFieldValue('keys')
        if(keys.length === 1){
            return
        }

        // Atualizando quantidade total
        if(parseInt(this.props.form.getFieldValue(`quantidade[${k}]`)) >= 0){
            var quantidadeArmazenar = parseInt(this.state.quantidadeArmazenar) + parseInt(this.props.form.getFieldValue(`quantidade[${k}]`))
            this.setState({quantidadeArmazenar})
        }

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
        if(!prevProps.showArmazenagemLancamentoModal && this.props.showArmazenagemLancamentoModal){
            this.setState({idPedidoInsumo: this.props.insumoInfo.idPedidoInsumo, nomeInsumo: this.props.insumoInfo.nome, quantidadeEntrada: this.props.insumoInfo.quantidadeEntrada})    
            this.getAlmoxarifados()
            this.getInsumosArmazenagem(this.props.insumoInfo.idPedidoInsumo)
        }
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const porcionamentos = keys.map(k => (
            <Row key={k} gutter={5}>
                <Col span={10} id="almoxarifado" style={{position: 'relative'}}>
                    <Form.Item>
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
                <Col span={10} id="posicao" style={{position: 'relative'}}>
                    <Form.Item>
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
                    <Form.Item>
                        {getFieldDecorator(`quantidade[${k}]`, {
                            rules: [{
                                required: true, message: "Informe a quantidade"
                            }],
                        })(
                            <Input
                                style={{ width: '75%', marginRight: 8 }}
                                placeholder="Qtd"
                                onKeyUp={this.changeQuantidade}
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
        ))


        return(
            <Modal
                title="Armazenamento de Insumos"
                visible={this.props.showArmazenagemLancamentoModal}
                onCancel={() => this.props.showArmazenagemLancamentoModalF(false)}
                width={900}
                footer={[
                    <Button key="back" onClick={() => this.props.showArmazenagemLancamentoModal(false)}><Icon type="close" /> Cancelar</Button>,
                    <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                ]}
            >
                <Row>
                    <Col span={24} id="colArmazenagem" style={{position: 'relative'}}>
                        <Form layout="vertical">
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
                            {
                                porcionamentos.length > 0 ?
                                <Row className="bold" style={{marginBottom: 10}}>
                                    <Col span={10}>Almoxarifado</Col>
                                    <Col span={10}>Posição</Col>
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazenagemLancamento))