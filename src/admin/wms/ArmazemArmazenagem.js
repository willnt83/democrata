import React, { Component } from 'react'
import { Layout, Table, Icon, Modal, Input, Button, Row, Col, Form, Select } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import moment from 'moment'

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class ArmazemArmazenagem extends Component {
    state = {
        tableLoading: false,
        tableData: []
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    componentDidMount(){
        axios
        .get(this.props.backEndPoint + '/getPedidosInsumos?status=C')
        .then(res => {
            if(res.data.payload){
                console.log('res.data.payload', res.data.payload)
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

    render(){
        const { getFieldDecorator } = this.props.form
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
                        <Icon type="edit" style={{cursor: 'pointer'}} />
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