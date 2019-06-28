import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class ArmazemArmazenagem extends Component {
    state = {

    }


    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    render(){
        const { getFieldDecorator } = this.props.form
        const columns = [{
            title: 'ID Pedido',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        }, {
            title: 'Pedido',
            dataIndex: 'nomePedido',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        }, {
            title: 'ID Insumo',
            dataIndex: 'idInsumo',
            sorter: (a, b) => this.compareByAlph(a.ins, b.ins)
        }, {
            title: 'INS Insumo',
            dataIndex: 'insInsumo',
            sorter: (a, b) => this.compareByAlph(a.description, b.description)
        }, {
            title: 'Insumo',
            dataIndex: 'nomeInsumo',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.unidadeMedidaDescription, b.unidadeMedidaDescription)
        }, {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.unidadeDescription, b.unidadeDescription)
        }, {
            title: 'Ativo',
            dataIndex: 'ativoDescription',
            align: 'center',
            width: 150,
            filters: [{
                text: 'Ativo',
                value: 'Ativo',
            }, {
                text: 'Inativo',
                value: 'Inativo',
            }],
            filterMultiple: false,
            onFilter: (value, record) => record.ativo.indexOf(value) === 0
        }, {
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