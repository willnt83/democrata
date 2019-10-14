import React, { Component } from 'react'
import { Layout, Row, Col, Form, Icon, Button, Table, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import ModalSaida from './ModalSaida'

const { Content } = Layout

class Saida extends Component{
    constructor(props){
        super(props)
        this.state = {
            showModalSaida: false,
            idSaida: null,
            tableData: []
        }
        this.handleScanLancamento = this.handleScanLancamento.bind(this)
    }

    requestGetSaidas = () => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getSaidas')
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

    showModalSaidaF = (bool, idSaida = null) => {
        this.setState({showModalSaida: bool, idSaida})
        if(!bool)
            this.requestGetSaidas()
    }

    componentDidMount(){
        this.requestGetSaidas()
    }

    render(){
        const columns = [{
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Data da Saida',
            dataIndex: 'dataSaida',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.dataSaida, b.dataSaida)
        },
        {
            title: 'Usuario',
            dataIndex: 'usuario.nome',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.usuario.nome, b.usuario.nome)
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
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Alterar Saida" onClick={() => this.showModalSaidaF(true, record.id)} />
                        {/*<Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteEntrada(record.id)}>
                            <a href="/admin/wms/armazem/saida" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} title="Excluir Entrada" /></a>
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
                        <Button className="buttonGreen" onClick={() => this.showModalSaidaF(true)}><Icon type="plus" /> Nova Saida</Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                    rowKey='id'
                />

                <ModalSaida
                    showNotification={this.showNotification}
                    idSaida={this.state.idSaida}
                    showModalSaida={this.state.showModalSaida}
                    showModalSaidaF={this.showModalSaidaF}
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(Saida)))