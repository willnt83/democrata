import React, { Component } from 'react'
import { Layout, Table, Icon, Button, Row, Col, Tooltip, Form, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import moment from 'moment'

import EntradaInsumos from './EntradaInsumos'

const { Content } = Layout

class ArmazemEntrada extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Entrada de Insumos')
    }

    state = {
        entradaId: null,
        tableLoading: false,
        tableData: [],
        showEntradaModal: false,
        dynamicFieldsRendered: false,
        btnSalvarLoading: false
    }

    requestGetEntradaInsumos = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getEntradaInsumos')
        .then(res => {
            if(res.data.payload){
                var tableData = []
                res.data.payload.forEach(entrada => {
                    var data_entrada = moment(entrada.data_entrada, 'YYYY-MM-DD')
                    entrada.insumos.forEach((insumo, index) =>{
                        tableData.push({
                            key: insumo.id,
                            id: entrada.id,
                            data_entrada: data_entrada.format('DD/MM/YYYY'),
                            hora_entrada: entrada.hora_entrada,
                            idPedido: insumo.idPedido,
                            idPedidoInsumo: insumo.idPedidoInsumo,
                            chaveNF: insumo.chaveNF,
                            idfornecedor: insumo.idFornecedor,
                            nomeFornecedor: insumo.nomeFornecedor,
                            idInsumo: insumo.idInsumo,
                            nomeInsumo: insumo.nomeInsumo,
                            insInsumo: insumo.insInsumo,
                            quantidade: insumo.quantidade,
                            // quantidade_conferida: insumo.quantidade_conferida,
                        })
                    })
                })
                this.setState({tableData})                
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

    loadEntradaModal = (record) => {
        this.setState({entradaId: record.id})
        this.showEntradaModalF(true)
    }

    showEntradaModalF = (showEntradaModal) => {
        this.setState({showEntradaModal})
    }

    entradaIdF = (entradaId) => {
        this.setState({entradaId})
    }

    componentWillMount(){
        this.requestGetEntradaInsumos()
    }

    render(){            
        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Data',
            dataIndex: 'data_entrada',
            sorter: (a, b) => this.compareByAlph(a.data_entrada, b.data_entrada)
        },
        {
            title: 'Hora',
            dataIndex: 'hora_entrada',
            sorter: (a, b) => this.compareByAlph(a.hora_entrada, b.hora_entrada)
        },
        {
            title: 'Pedido',
            dataIndex: 'idPedido',
            sorter: (a, b) => this.compareByAlph(a.idPedido, b.idPedido)
        },   
        {
            title: 'Fornecedor',
            dataIndex: 'nomeFornecedor',
            sorter: (a, b) => this.compareByAlph(a.nomeFornecedor, b.nomeFornecedor)
        },           
        {
            title: 'Insumo',
            dataIndex: 'idInsumo',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.idInsumo, b.idInsumo)
        },
        {
            title: 'INS',
            dataIndex: 'insInsumo',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.insInsumo, b.insInsumo)
        },        
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            align: 'center',
            sorter: (a, b) => a.quantidade - b.quantidade,
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Alterar Entrada" onClick={() => this.loadEntradaModal(record)} />
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
                    entradaIdIn={this.state.entradaId}
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