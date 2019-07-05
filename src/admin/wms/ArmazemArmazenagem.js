import React, { Component } from 'react'
import { Layout, Table, Icon, Modal, Input, Button, Row, Col, Form, Select, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import moment from 'moment'
let id = 0
class ArmazemArmazenagem extends Component {
    state = {
        tableLoading: false,
        tableData: [],
        showArmazenagemModal: false,
        almoxarifadosOptions: [],
        idPedidoInsumo: null,
        nomeInsumo: null,
        quantidadeInsumo: null,
        almoxarifadosPosicoes: [],
        dynamicFieldsRendered: false,
        almoxarifados: [],
        posicoes: [],
        quantidades: []
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

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    getInsumosConferidos = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getPedidosInsumos?status=C')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    tableData: res.data.payload.map(row => {
                        var dthrRecebimento = moment(row.dthrRecebimento).format('DD/MM/YYYY H:m:s')
                        return({
                            id: row.id,
                            idPedido: row.idPedido,
                            chaveNF: row.chaveNF,
                            insInsumo: row.insInsumo,
                            nomeInsumo: row.nomeInsumo,
                            quantidadeConferida: row.quantidadeConferida,
                            dthrRecebimento,
                            local: row.local
                        })
                    })
                })
            }
            else
                console.log('Nenhum registro encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
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

    getInsumosArmazenagem = (idPedidoInsumo) => {
        axios
        .get(this.props.backEndPoint + '/getInsumosArmazenagem?id_pedido_insumo='+idPedidoInsumo)
        .then(res => {
            if(res.data.payload.length > 0){
                var keys = []
                var almoxarifados = res.data.payload.map((row, index) => {
                    keys.push(index)
                    return(row.id_almoxarifado)
                })
                // Buscando posições para cada almoxarifado
                this.getMultiplasPosicoeArmazens(almoxarifados)
                this.props.form.setFieldsValue({keys})

                this.setState({
                    dynamicFieldsRendered: true,
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
            this.showArmazenagemModal(false)
        })
        .catch(error =>{
            console.log(error)
        })
    }

    loadArmazenagemModal = (record) => {
        this.setState({idPedidoInsumo: record.id, nomeInsumo: record.nomeInsumo, quantidadeInsumo: record.quantidadeConferida})
        this.getAlmoxarifados()
        this.getInsumosArmazenagem(record.id)
        this.showArmazenagemModal(true)
    }

    showArmazenagemModal = (showArmazenagemModal) => {
        this.setState({showArmazenagemModal})
        // Fechando modal
        if(!showArmazenagemModal){
            //Reset modal
            this.props.form.resetFields()
            this.setState({
                almoxarifadosOptions: [],
                almoxarifadosPosicoes: [],
                idPedidoInsumo: null,
                nomeInsumo: null,
                quantidadeInsumo: null
            })
        }
    }

    changeAlmoxarifado = (value, k) => {
        var strObj = '{"posicao['+k+']": ""}'
        var obj  = JSON.parse(strObj)
        this.props.form.setFieldsValue(obj)
        if(value) this.getPosicoesArmazem(value, k)
    }

    handleFormSubmit = () => {
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
        if (keys.length === 1){
            return
        }
        this.props.form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    componentDidMount(){
        this.getInsumosConferidos()
    }

    componentDidUpdate(){
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
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        var filtered = []
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

        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.key,
        },
        {
            title: 'ID Pedido',
            dataIndex: 'idPedido',
            sorter: (a, b) => a.idPedido - b.idPedido,
        },
        {
            title: 'Chave NF',
            dataIndex: 'chaveNF',
            sorter: (a, b) => this.compareByAlph(a.chaveNF, b.chaveNF)
        },
        {
            title: 'INS',
            dataIndex: 'insInsumo',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        },
        {
            title: 'Insumo',
            dataIndex: 'nomeInsumo',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.unidadeMedidaDescription, b.unidadeMedidaDescription)
        },
        {
            title: 'Quantidade',
            dataIndex: 'quantidadeConferida',
            align: 'center',
            sorter: (a, b) => a.quantidadeConferida - b.quantidadeConferida,
        },
        {
            title: 'Data Hora Recebimento',
            dataIndex: 'dthrRecebimento',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.dthrRecebimento, b.dthrRecebimento)
        },
        {
            title: 'Local',
            dataIndex: 'local',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.local, b.local)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Armazenar" onClick={() => this.loadArmazenagemModal(record)} />
                    </React.Fragment>
                )
            }
        }]

        return(
            <React.Fragment>
                <h3>Armazenagem de Insumos</h3>
                <Row style={{marginTop: 30}}>
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            loading={this.state.tableLoading}
                            rowKey='id'
                        />
                    </Col>
                </Row>
                <Modal
                    title="Armazenamento de Insumos"
                    visible={this.state.showArmazenagemModal}
                    onCancel={() => this.showArmazenagemModal(false)}
                    width={900}
                    footer={[
                        <Button key="back" onClick={() => this.showArmazenagemModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarConjunto} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colArmazenagem" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Row className="bold" style={{marginBottom: 10}}>
                                    <Col span={24}>
                                        Insumo: {this.state.nomeInsumo} | Quantidade total: {this.state.quantidadeInsumo}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazemArmazenagem))