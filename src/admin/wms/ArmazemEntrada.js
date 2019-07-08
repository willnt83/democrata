import React, { Component } from 'react'
import { Table, Icon, Modal, Input, Button, Row, Col, Form, Select, DatePicker, TimePicker, Divider, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'

let id = 0

const statusInsumoOption = [
    {value: 'S', description: 'Solicitado'},
    {value: 'E', description: 'Entregue'},
    {value: 'C', description: 'Conferido'}
]

class ArmazemEntrada extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Entrada de Insumos')
    }

    state = {
        tableLoading: false,
        tableData: [],
        showEntradaModal: false,
        showEntradaModalStatus: false,
        idPedidoInsumo: null,
        idPedido: null,
        nomeInsumo: null,
        insInsumo: null,
        dataPedido: null,
        horaPedido: null,
        previsaoPedido: null,
        nomeFornecedor: null,
        statusInsumo: null,
        chaveNF: null,
        quantidade: null,
        quantidadeConferida: null,
        dataEntradaValues: [],
        horaEntradaValues: [],
        entradas: [],
        dynamicFieldsRendered: false,
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

    returnStatusDescription = (status, object) => {
        var returnStatus = '';
        if(object){
            return object.forEach(objStatus => {
                if(objStatus.value === status) {
                    returnStatus = objStatus.description
                }
            });
        }
        return returnStatus;
    }

    getInsumosEntrada = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getPedidosCompraInsumos?statusInsumo=S,E,C')
        .then(res => {
            if(res.data.payload){
                var tableData = [];
                res.data.payload.forEach(pedidoCompra => {
                    pedidoCompra.insumos.forEach(insumo =>{
                        var data_pedido = moment(pedidoCompra.data_pedido, 'YYYY-MM-DD')
                        var data_previsao = moment(pedidoCompra.data_previsao, 'YYYY-MM-DD')
                        tableData.push({
                            key: insumo.item,
                            id: pedidoCompra.id,
                            data_previsao: data_previsao.format('DD/MM/YYYY'),
                            data_pedido: data_pedido.format('DD/MM/YYYY'),
                            hora_pedido: pedidoCompra.hora_pedido,
                            chave_nf: pedidoCompra.chave_nf,
                            idfornecedor: pedidoCompra.idFornecedor,
                            fornecedorDescription: pedidoCompra.nomeFornecedor,
                            idInsumo: insumo.id,
                            nomeInsumo: insumo.nome,
                            insInsumo: insumo.ins,
                            quantidade: insumo.quantidade,
                            quantidade_conferida: insumo.quantidade_conferida,
                            statusInsumo: insumo.statusInsumo,
                            statusInsumoDescription: this.returnStatusDescription(insumo.statusInsumo,statusInsumoOption)
                        })
                    })
                })
                console.log(tableData);
                this.setState({tableData})
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

    loadArmazenagemModal = (record) => {
        console.log(record);
        if(typeof(record) !== "undefined" && record.key) {
            this.setState({pedidoCompraId: record.key})
            axios
            .get(this.props.backEndPoint + '/getPedidosCompraInsumos?id='+record.key)
            .then(res => {
                this.setState({
                    idPedidoInsumo: record.key,
                    idPedido: record.id,
                    nomeInsumo: record.nomeInsumo,
                    insInsumo: record.insInsumo,
                    dataPedido: record.data_pedido,
                    horaPedido: record.hora_pedido,
                    previsaoPedido: record.data_previsao,
                    nomeFornecedor: record.fornecedorDescription,
                    statusInsumo: record.statusInsumoDescription,
                    chaveNF: record.chave_nf,
                    quantidade: record.quantidade,
                    quantidadeConferida: record.quantidadeConferida
                })
                this.showEntradaModal(true)
            });
        } else {
            this.showEntradaModal(false)
        }
    }

    showEntradaModal = (showEntradaModal) => {
        this.setState({showEntradaModal})
    }

    loadInsumoStatusModal = (record) => {
        console.log(record);
        this.setState({
            idPedidoInsumo: record.key,
            idPedido: record.id,
            nomeInsumo: record.nomeInsumo,
            insInsumo: record.insInsumo,
            dataPedido: record.data_pedido,
            horaPedido: record.hora_pedido,
            previsaoPedido: record.data_previsao,
            nomeFornecedor: record.fornecedorDescription,
            statusInsumo: record.statusInsumo,
            chaveNF: record.chave_nf,
            quantidade: record.quantidade,
            quantidadeConferida: record.quantidadeConferida
        })
        this.showEntradaModalStatus(true)
    }

    showEntradaModalStatus = (showEntradaModalStatus) => {
        this.setState({showEntradaModalStatus})
    }

    addComposicaoRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
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

    componentDidMount(){
        this.getInsumosEntrada()
    }

    // componentDidUpdate(){
    //     if(this.state.dynamicFieldsRendered && this.state.almoxarifadosPosicoes.length > 0){
    //         // Atualizando id, que é a variável que controla o add e remove de campos
    //         id = (this.state.almoxarifados.length)
    //         this.props.form.setFieldsValue({
    //             almoxarifado: this.state.almoxarifados,
    //             posicao: this.state.posicoes,
    //             quantidade: this.state.quantidades
    //         })
    //         this.setState({dynamicFieldsRendered: false})
    //     }
    // }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const entradaRow = keys.map(k => (
            <Row key={k} gutter={5} style={{marginBottom: '15px'}}>
                <Col span={7} id="colData" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                        {getFieldDecorator(`dataEntrada[${k}]`, {
                            rules: [{
                                required: true, message: "Informe a Data"
                            }],
                        })(
                            <DatePicker
                                locale={ptBr}
                                format="DD/MM/YYYY"
                                placeholder="Selecione a data"
                                style={ {width: '100%'} }
                                getCalendarContainer={() => document.getElementById('colData')}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={7} id="colHora" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                        {getFieldDecorator(`horaEntrada[${k}]`, {
                            rules: [{
                                required: true, message: "Informe a Hora"
                            }],
                        })(
                            <TimePicker
                                locale={ptBr}
                                format="HH:mm:ss"
                                placeholder="Selecione a hora"
                                style={ {width: '100%'} }
                                getCalendarContainer={() => document.getElementById('colHora')}
                            />                            
                        )}
                    </Form.Item>
                </Col>
                <Col span={8} id="colQuantidade" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                        {getFieldDecorator(`quantidades[${k}]`, {
                            rules: [
                                {
                                    required: true, message: 'Informe a quantidade',
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
                <Col span={1} id="colDelete" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px', marginTop: '4px', textAlign: 'center'}}>
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
            title: 'Pedido',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Data Pedido',
            dataIndex: 'data_pedido',
            sorter: (a, b) => this.compareByAlph(a.data_pedido, b.data_pedido)
        },
        {
            title: 'Fornecedor',
            dataIndex: 'fornecedorDescription',
            sorter: (a, b) => this.compareByAlph(a.fornecedorDescription, b.fornecedorDescription)
        },
        {
            title: 'Chave N.F',
            dataIndex: 'chave_nf',
            sorter: (a, b) => this.compareByAlph(a.chave_nf, b.chave_nf)
        },             
        {
            title: 'Insumo',
            dataIndex: 'nomeInsumo',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.nomeInsumo, b.nomeInsumo)
        },
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            align: 'center',
            sorter: (a, b) => a.quantidade - b.quantidade,
        },
        {
            title: 'Status',
            dataIndex: 'statusInsumoDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.statusInsumoDescription, b.statusInsumoDescription)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Entrada" onClick={() => this.loadArmazenagemModal(record)} />
                    </React.Fragment>
                )
            }
        }]

        return(
            <React.Fragment>
                <h3>Entrada de Insumos</h3>
                <Row style={{marginTop: 30}}>
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            loading={this.state.tableLoading}
                            rowKey='key'
                        />
                    </Col>
                </Row>
                <Modal
                    title="Entrada de Insumos"
                    visible={this.state.showEntradaModal}
                    onCancel={() => this.showEntradaModal(false)}
                    width={600}
                    footer={[
                        <Button key="back" onClick={() => this.showEntradaModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Row>
                            <Col span={16} id="colInsumo" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Insumo"
                                >
                                {this.state.nomeInsumo}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colInsInsumo" style={{position: 'relative'}}>
                                <Form.Item
                                    label="INS"
                                >
                                {this.state.insInsumo}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={16} id="colFornecedor" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Fornecedor"
                                >
                                {this.state.nomeFornecedor}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colChaveNF" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Chave N.F"
                                >
                                {this.state.chaveNF}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8} id="colQuantidade" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Quantidade"
                                    style={{paddingBottom: '0px', marginBottom: '0px'}}
                                >
                                {this.state.quantidade}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colQuantidadeConferida" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Quantidade Conferida"
                                    style={{paddingBottom: '0px', marginBottom: '0px'}}
                                >
                                {this.state.quantidadeConferida}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colStatusInsumo" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Status"
                                    style={{paddingBottom: '0px', marginBottom: '0px'}}
                                >
                                {this.state.statusInsumo}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider />
                        <h4>Entrada de Insumos (Matérias-Primas)</h4>                          
                        {
                            entradaRow.length > 0 ?
                            <Row className="bold" style={{marginBottom: 10}}>
                                <Col span={7}>Data</Col>
                                <Col span={7}>Hora</Col>
                                <Col span={8}>Quantidade</Col>
                            </Row>
                            :null
                        }                        
                        {entradaRow}
                        <Row>
                            <Col span={24}>
                                <Button key="primary" title="Nova Entrada" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
                            </Col>
                        </Row>                        
                    </Form>
                </Modal>
                <Modal
                    title="Atualização de Status do Insumos"
                    visible={this.state.showEntradaModalStatus}
                    onCancel={() => this.showEntradaModalStatus(false)}
                    width={600}
                    footer={[
                        <Button key="back" onClick={() => this.showEntradaModalStatus(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Form layout="vertical">
                        <Row>
                            <Col span={16} id="colInsumo" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Insumo"
                                >
                                {this.state.nomeInsumo}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colInsInsumo" style={{position: 'relative'}}>
                                <Form.Item
                                    label="INS"
                                >
                                {this.state.insInsumo}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={16} id="colFornecedor" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Fornecedor"
                                >
                                {this.state.nomeFornecedor}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colChaveNF" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Chave N.F"
                                >
                                {this.state.chaveNF}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8} id="colQuantidade" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Quantidade"
                                >
                                {this.state.quantidade}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colQuantidadeConferida" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Quantidade Conferida"
                                >
                                {this.state.quantidadeConferida}
                                </Form.Item>
                            </Col>
                            <Col span={8} id="colStatusInsumo" style={{position: 'relative'}}>
                                <Form.Item
                                    label="Status"
                                >
                                    {getFieldDecorator('statusInsumo', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione',
                                            }
                                        ]
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder="Selecione"
                                            getPopupContainer={() => document.getElementById('colStatusInsumo')}
                                            allowClear={true}
                                        >
                                            {
                                                statusInsumoOption.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
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
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazemEntrada))