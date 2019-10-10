import React, { Component } from 'react'
import { Layout, Row, Col, Form, Icon, Button, Table, Popconfirm, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import ModalEntrada from './ModalEntrada'

const { Content } = Layout

class Entrada extends Component{
    constructor(props){
        super(props)
        this.state = {
            showModalEntrada: false,
            idEntrada: null,
            tableData: []
        }
        this.handleScanLancamento = this.handleScanLancamento.bind(this)
    }

    requestGetEntradas = () => {
        axios
        .get(this.props.backEndPoint + '/getEntradas')
        .then(res => {
            if(res.data.payload){
                this.setState({tableData: res.data.payload})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
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

    handleScanLancamento(data){
        if(this.state.idFuncionario !== null){
            var request = {
                idFuncionario: this.state.idFuncionario,
                barcode: data
            }
            this.requestLancamentoProducao(request)
        }
        else{
            this.showNotification('Selecione um funcionário', false)
        }
    }

    showModalEntradaF = (bool, idEntrada = null) => {
        this.setState({showModalEntrada: bool, idEntrada})
    }

    componentDidMount(){
        this.requestGetEntradas()
    }

    render(){
        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Data da Entrada',
            dataIndex: 'dataEntrada',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.dataEntrada, b.dataEntrada)
        },
        {
            title: 'Usuario',
            dataIndex: 'nomeUsuario',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.nomeUsuario, b.nomeUsuario)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Alterar Entrada" onClick={() => this.showModalEntradaF(true, record.id)} />
                        {/*<Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteEntrada(record.id)}>
                            <a href="/admin/wms/armazem/entrada" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} title="Excluir Entrada" /></a>
                        </Popconfirm>*/}
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
                        <Button className="buttonGreen" onClick={() => this.showModalEntradaF(true)}><Icon type="plus" /> Nova Entrada</Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='id'
                />

                <ModalEntrada
                    showNotification={this.showNotification}
                    idEntrada={this.state.idEntrada}
                    showModalEntrada={this.state.showModalEntrada}
                    showModalEntradaF={this.showModalEntradaF}
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
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(Entrada)))