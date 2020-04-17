import React, { Component } from 'react'
import { Layout, Row, Col, Form, Icon, Button, Table, notification, DatePicker, Popconfirm } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import ModalEntrada from './ModalEntrada'
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

const today = moment().format('DD/MM/YYYY')

const { Content } = Layout

class Entrada extends Component{
    constructor(props){
        super(props)
        this.state = {
            showModalEntrada: false,
            idEntrada: null,
            tableData: [],
            tableLoading: false
        }
    }

    requestGetEntradas = (entradaData) => {
        this.setState({tableLoading: true})
        var entradaDataObj = moment(entradaData, 'DD/MM/YYYY')
        axios.get(this.props.backEndPoint + '/wms-produtos/getEntradaProdutos?dt_lancamento='+entradaDataObj.format('YYYY-MM-DD'))
        .then(res => {
            if(res.data.payload){
                this.setState({tableData: res.data.payload})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            this.setState({tableLoading: false})
            console.log(error)
        })
    }

    estornarEntradaProduto = (idEntradaProduto) => {
        var request = {
            idUsuario: this.props.session.usuario.id,
            idEntradaProduto: idEntradaProduto
        }

        axios.post(this.props.backEndPoint + '/wms-produtos/estornarEntradaProduto', request)
        .then(res => {
            this.props.showNotification(res.data.msg, res.data.success)
            this.requestGetEntradas(today)

        })
        .catch(error => {
            console.log(error)
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

    componentDidMount(){
        this.requestGetEntradas(today)
    }

    render(){
        const columns = [
            {
                title: 'ID Entrada',
                dataIndex: 'id',
                align: 'center',
                sorter: (a, b) => a.id - b.id,
            },
            {
                title: 'Produto',
                dataIndex: 'nomeProduto',
                align: 'center',
                sorter: (a, b) => a.nomeProduto - b.nomeProduto,
            },
            {
                title: 'Cor',
                dataIndex: 'corProduto',
                align: 'center',
                sorter: (a, b) => a.corProduto - b.corProduto,
            },
            {
                dataIndex: 'operacao',
                align: 'center',
                width: 150,
                render: (text, record) => {
                    return(
                        <Popconfirm title="Realmente deseja estornar a entrada deste produto?" onConfirm={() => this.estornarEntradaProduto(record.id)}>
                            <Icon type="undo" style={{color: 'red'}} />
                        </Popconfirm>
                    )
                }
            }
        ]

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
                    <Col span={24} id="colSelectDate">
                        <DatePicker
                            locale={ptBr}
                            defaultValue={moment(today, 'DD/MM/YYYY')}
                            format="DD/MM/YYYY"
                            style={ {width: '30%'} }
                            getCalendarContainer={() => document.getElementById('colSelectDate')}
                            onChange={(date, datestring) => this.requestGetEntradas(date)}
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='id'
                />
            </Content>
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
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(Entrada)))