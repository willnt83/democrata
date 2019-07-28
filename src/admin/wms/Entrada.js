import React, { Component } from 'react'
import { Layout, Table, Icon, Button, Row, Col, Tooltip, Form, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import moment from 'moment'

import EntradaInsumos from './EntradaInsumos'

const { Content } = Layout

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
        idPedidoInsumo: null,
        idPedido: null,
        idInsumo: null,
        nomeInsumo: null,
        insInsumo: null,
        dataPedido: null,
        horaPedido: null,
        previsaoPedido: null,
        idFornecedor: null,
        nomeFornecedor: null,
        statusInsumo: null,
        chaveNF: null,
        quantidade: null,
        quantidadeConferida: null,
        dataEntradaValues: [],
        horaEntradaValues: [],
        quantidadeValues: [],
        entradas: [],
        queryParams: null,
        dynamicFieldsRendered: false,
        btnSalvarLoading: false
    }

    getInsumosEntrada = (pedido = 0, insumo = '') => {
        this.setState({tableLoading: true})
    
        // Filtros
        let queryParams = ''
        if(pedido) queryParams += '&id='+pedido
        if(insumo) {
            if(!isNaN(insumo))
                queryParams += '&idPedidoInsumo='+insumo
            else
                queryParams += '&nomeInsumo='+insumo
        }

        axios
        .get(this.props.backEndPoint + '/getPedidosCompraInsumos?statusInsumo=S,E,C' + queryParams)
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
                this.setState({tableData,queryParams})                
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

    showEntradaModalF = (showEntradaModal) => {
        this.setState({showEntradaModal})
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const formHorizontal = {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 },
        }
            
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Incluir ou Alterar Entradas" onClick={() => this.loadEntradaModal(record)} />
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
                        <Tooltip title="Cadastrar Nova Entrada de Insumos" placement="right">
                            <Button className="buttonGreen" onClick={() => this.showEntradaModalF(true)}><Icon type="plus" /> Nova Entrada</Button>
                        </Tooltip>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='key'
                />
                <EntradaInsumos
                    showEntradaModalF={this.showEntradaModalF}
                    showEntradaModal={this.state.showEntradaModal}
                />
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazemEntrada))